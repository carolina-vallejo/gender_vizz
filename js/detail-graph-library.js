/**
 * @author Carolina Vallejo <carovallejomar@gmail.com>
 */

(function(global) {
  'use strict';

  /// Set DetailGraph global object ///
  if (!global.DetailGraph)
    global.DetailGraph = DetailGraph;

  function DetailGraph(config) {

    var self = this;

    //default configs..
    var cfg = {};
    self.cfg = cfg;

    //---CONFIGURABLES
    cfg.svg = null;
    cfg.arr_averages = [];
    cfg.data = null;

    //-------------------------
    //  setconfigs
    self.setConfig = function(config) {
      if (!config)
        return;
      for (var op in config)
        if (config.hasOwnProperty(op)) {
          if (self.cfg.hasOwnProperty(op)) {
            self.cfg[op] = config[op];
          } else {
            console.log('error: no configuration option: "' + op + '"');
          }
        }
    };
    self.setConfig(config);

    //-----SIZES
    var h_win = $(window).height();
    var w_win = $(window).width();

    //----RECT detail
    window.w_rect_detail = 120;
    window.h_rect_detail = h_win / 2.6;

    var box_det = 46;
    var det_rect_middle = ((w_rect_detail / 2) - (box_det / 2));

    var
      w_sym = 24,
      st_sys = 1,
      st_sym = 1,
      w_diff = 17,
      middle = (box_det / 2),
      anchor = h_rect_detail - 20,
      h_linea = 80,
      hm_linea = h_linea / 2,
      h_diff = 180,
      w_issu = 40,
      w_base_issu = 50,
      off_anchor = 8,
      space_issues = 12,
      w_base_line = box_det / 10,
      w_lines = w_rect_detail + 10,
      indent_line = w_diff,
      dx_worse = 15;
    //---SCALES
    var min_avg = d3.min(cfg.arr_averages);
    var max_avg = d3.max(cfg.arr_averages);

    var det_diff_scale = d3.scaleLinear()
      .domain([min_avg, max_avg])
      .range([0, w_base_issu]);

    var det_issu_scale = d3.scaleLinear()
      .domain([0, 100])
      .range([3, w_issu]);

    //----D3 ELEMENTS
    var
      detail_wrap,
      title_country,
      rect_back_title,
      labels_detail,
      det_lines_issues_obj = {},
      base_lines_issues_obj = {},
      det_issues_labels = {},
      tspan_num,
      tspan_label,
      base_issues;

    //---dumb ojbs for transitions
    var trans_objs_arr = [],
      trans_counter = 0;

    //-------------------------
    //  AUTO_FUNCTIONS
    function config_elems() {

      detail_wrap = cfg.svg.append('g')
        .classed('detail-graph', true)
        .attrs({
          'transform': 'translate(' + ((w_win / 2) - ((w_rect_detail * 1.5) / 2)) + ',' + -20 + ') scale(1.3)'
        });

      detail_wrap.append('line')
        .attrs({
          'class': 'base_line',
          'x1': 0,
          'y1': anchor,
          'x2': w_rect_detail,
          'y2': anchor
        });

      title_country = detail_wrap.insert('text', ':nth-child(2)')
        .data(cfg.data)
        .text(function(d, i) {
          return d.country;
        })
        .attrs({
          'class': 'title_country',
          'x': w_rect_detail / 2,
          'y': anchor - h_diff
        });

      var text_country_box = title_country['_groups'][0][0].getBBox();
      var text_pad = 10;

      rect_back_title = detail_wrap.insert('rect', ':nth-child(1)')
        .attrs({
          'class': 'rect_back_title',
          'x': text_country_box.x - text_pad,
          'y': text_country_box.y - (text_pad / 2),
          'width': text_country_box.width + (text_pad * 2),
          'height': text_country_box.height + (text_pad)
        });;

      //---DRAW FIRST GENDER GRAPH
      config_draw('female', [cfg.data[0]]);
      config_draw('male', [cfg.data[0]]);

      //---DRAW FIRST AVERAGE DATA
      labels_detail = detail_wrap.append('g')
        .attrs({
          'class': function(d, i) {

            var val = compare_avg(d, 'female', ' worse-female', ' worse-male');

            return 'labels_detail' + val;
          }
        });

      labels_detail.append('line')
        .attrs({
          'class': 'line_fem'
        })
        .attrs(function(d, i) {
          var gender = 'female';
          var posx = (w_rect_detail / 2) - (w_lines / 2);
          var plus = compare_avg(d, gender, indent_line, 0);

          return {
            'x1': posx + plus,
            'y1': anchor - det_diff_scale(d['average_' + gender]),
            'x2': posx + w_lines,
            'y2': anchor - det_diff_scale(d['average_' + gender]),
          };
        });

      labels_detail.append('line')
        .attrs({
          'class': 'line_male'
        })
        .attrs(function(d, i) {
          var gender = 'male';
          var posx = (w_rect_detail / 2) - (w_lines / 2);
          var plus = compare_avg(d, gender, -indent_line, 0);

          return {
            'x1': posx,
            'y1': anchor - det_diff_scale(d['average_' + gender]),
            'x2': posx + w_lines + plus,
            'y2': anchor - det_diff_scale(d['average_' + gender]),
          };
        });

      labels_detail.append('line')
        .attr('class', 'line_diff')
        .attrs(function(d, i) {
          var posx = posx_det(d);
          //compare_avg(d, gender, rtn1, rtn2);
          return {
            'x1': posx,
            'y1': anchor - det_diff_scale(d['average_' + 'male']),
            'x2': posx,
            'y2': anchor - det_diff_scale(d['average_' + 'female']),
          };
        })
        .styles({
          'display': function(d, i) {
            return d['average_' + 'male'] === 0 ? 'none' : 'block';
          }
        });

      //-----AVERAGE DATA WORSE

      tspan_num = labels_detail.append('text')
        .attr('class', 'tspan_num')
        .text(function(d, i) {
          return format(Math.abs(d.average_female - d.average_male)) + '%';
        })
        .attrs(function(d, i) {

          var posx = posx_det(d);
          var posy1 = anchor - det_diff_scale(d['average_' + 'male']);
          var posy2 = anchor - det_diff_scale(d['average_' + 'female']);

          var centroid = middlepoint(posx, posy1, posx, posy2);

          return {
            'x': posx,
            'y': centroid[1],
            'dx': compare_avg(d, 'male', -dx_worse, dx_worse)
          }
        })
        .styles(function(d, i) {
          return style_worse(d);
        });

      //-----WORSE LABEL
      tspan_label = labels_detail.append('text')
        .attr('class', 'tspan_label')
        .text(function(d, i) {

          var worse = compare_avg(d, 'female', 'female', 'male');

          return 'worse ' + worse;
        })
        .attrs(function(d, i) {

          var posx = posx_det(d);
          var posy1 = anchor - det_diff_scale(d['average_' + 'male']);
          var posy2 = anchor - det_diff_scale(d['average_' + 'female']);

          var centroid = middlepoint(posx, posy1, posx, posy2);

          return {
            'x': posx,
            'y': centroid[1],
            'dx': compare_avg(d, 'male', -dx_worse, dx_worse),
            'dy': 17
          }
        })
        .styles(function(d, i) {
          return style_worse(d);
        });

    } //---config_elems  
    config_elems();

    //-------------------------

    self.draw = function(data) {

      //---TITLE COUNTRY
      title_country
        .data(data)
        .text(function(d, i) {
          return d.country;
        });

      var text_country_box = title_country['_groups'][0][0].getBBox();
      var text_pad = 10;

      rect_back_title
        .attrs({
          'class': 'rect_back_title',
          'x': text_country_box.x - text_pad,
          'y': text_country_box.y - (text_pad / 2),
          'width': text_country_box.width + (text_pad * 2),
          'height': text_country_box.height + (text_pad)
        });

      //---DRAW EACH GENDER 
      draw_gender('female', data);
      draw_gender('male', data);

      //----DRAW AVERAGE DATA

      labels_detail.data(data);

      labels_detail.select('.line_fem')
        .transition()
        .duration(500)
        .attrs(function(d, i) {
          var gender = 'female';
          var posx = (w_rect_detail / 2) - (w_lines / 2);
          var plus = compare_avg(d, gender, indent_line, 0);

          return {
            'x1': posx + plus,
            'y1': anchor - det_diff_scale(d['average_' + gender]),
            'x2': posx + w_lines,
            'y2': anchor - det_diff_scale(d['average_' + gender]),
          };
        })
        .styles({
          'display': function(d, i) {
            return d['average_' + 'male'] === 0 ? 'none' : 'block';
          }
        });

      labels_detail.select('.line_male')
        .transition()
        .duration(500)
        .attrs(function(d, i) {
          var gender = 'male';
          var posx = (w_rect_detail / 2) - (w_lines / 2);
          var plus = compare_avg(d, gender, -indent_line, 0);

          return {
            'x1': posx,
            'y1': anchor - det_diff_scale(d['average_' + gender]),
            'x2': posx + w_lines + plus,
            'y2': anchor - det_diff_scale(d['average_' + gender]),
          };
        })
        .styles({
          'display': function(d, i) {
            return d['average_' + 'male'] === 0 ? 'none' : 'block';
          }
        });

      labels_detail.select('.line_diff')
        .transition()
        .duration(500)
        .attrs(function(d, i) {
          var posx = posx_det(d);
          //compare_avg(d, gender, rtn1, rtn2);
          return {
            'x1': posx,
            'y1': anchor - det_diff_scale(d['average_' + 'male']),
            'x2': posx,
            'y2': anchor - det_diff_scale(d['average_' + 'female']),
          };
        });

      //----AVERAGE WORSE
      tspan_num
        .data(data)
        .attrs(function(d, i) {
          var posx = posx_det(d);
          return {
            'x': posx,
            'dx': compare_avg(d, 'male', -dx_worse, dx_worse)
          }
        })
        .styles(function(d, i) {
          return style_worse(d);
        })
        .call(trans_txtnum, 1000, data)
        .call(trans_posy, 500, data);

      //-----WORSE LABEL
      tspan_label
        .data(data)
        .text(function(d, i) {
          var worse = compare_avg(d, 'female', 'female', 'male');
          return 'worse ' + worse;
        })
        .attrs(function(d, i) {
          var posx = posx_det(d);
          return {
            'x': posx,
            'dx': compare_avg(d, 'male', -dx_worse, dx_worse)
          }
        })
        .styles(function(d, i) {
          return style_worse(d);
        })
        .call(trans_posy, 500, data);

      //---DRAW FIRST AVERAGE DATA
      labels_detail
        .attrs({
          'class': function(d, i) {

            var val = compare_avg(d, 'female', ' worse-female', ' worse-male');

            return 'labels_detail' + val;
          }
        });


    };

    return self;
    //-------------------------
    //  FUNCTIONS 
    function config_draw(gender, data) {

      var fem_positive = gender === 'female' ? 1 : -1;
      var origin = (w_rect_detail / 2) + (middle * fem_positive);
      //---EACH GENDER DETAIL
      var g_detail = detail_wrap
        .data(data)
        .append('g')
        .attrs({
          'class': 'g_detail_' + gender
        });

      //---CENTRAL LINE
      g_detail
        .append('line')
        .attrs({
          'class': 'det_central_line',
          'x1': origin,
          'y1': anchor,
          'x2': origin,
          'y2': function(d, i) {
            return diff_h(d, gender);
          }
        });

      //---SYMBOL LINE
      g_detail
        .append('line')
        .attrs({
          'class': 'det_symbol_line',
          'x1': origin - (w_sym / 2),
          'y1': function(d, i) {
            return diff_h(d, gender);
          },
          'x2': origin + (w_sym / 2),
          'y2': function(d, i) {
            return d3.select(this).attr('y1');
          }
        });

      //---GENDER LABEL
      g_detail.append('text')
        .text(function() {
          return gender === 'female' ? 'FEMALE' : 'MALE';
        })
        .attrs({
          'class': 'gender_label',
          'x': function() {

            return origin;
          },
          'y': function(d, i) {
            return diff_h(d, gender);
          },
          'dx': (gender === 'female' ? -18 : 12),
          'dy': -10
        })
        .styles({
          'text-anchor': function() {
            return gender === 'female' ? 'start' : 'end'
          }
        });

      //----RECT AVERAGE
      g_detail
        .append('rect')
        .attrs({
          'class': 'det_rect_dif',
          'x': origin - (w_diff / 2),
          'y': function(d, i) {

            return anchor - det_diff_scale((d['average_' + gender]));
          },
          'width': w_diff,
          'height': function(d, i) {
            var val = det_diff_scale(d['average_' + gender]) >= 0 ? det_diff_scale(d['average_' + gender]) : 0;
            return val;
          }
        });

      //----TEXT AVERAGE
      g_detail
        .append('text')
        .text(function(d, i) {
          return gender === 'male' ? 'AVG ' + format(d['average_' + gender]) + '%' : format(d['average_' + gender]) + '% AVG';
        })
        .attrs({
          'class': 'det_avg_text',
          'dx': function() {
            return gender === 'male' ? w_diff : 0
          },
          'dy': 12,
          'x': origin - (w_diff / 2),
          'y': anchor
        });

      //----LINES OF INDICATORS
      base_issues = g_detail.append('g');
      var g_issues = g_detail.append('g');

      var data_arr_issues = (function() {
        var arr_iss = [];
        data.forEach(function(d, i) {

          var ind = 0;
          for (var prop in d.male) {
            var obj = {};
            obj[ind] = d.male[prop];
            arr_iss.push(obj);

            ind++;
          }

        });
        return arr_iss;
      })();

      base_lines_issues_obj[gender] = base_issues.selectAll('line')
        .data(data_arr_issues)
        .enter()
        .append('line')
        .attr('class', 'base_line_issues')
        .datum(data)
        .attrs(function(d, i) {

          var posx = origin + ((st_sys / 2) * fem_positive);
          var posy = anchor + (space_issues * (i - 1)) - (det_diff_scale(d[0]['average_' + gender]) + h_linea) + (hm_linea);

          var dat = d[0][gender][Object.keys(d[0][gender])[i]];
          var pos_zero = parseFloat(d3.select(this).attr('x1'));
          var posx2 = (det_issu_scale(100) * fem_positive) + (origin - ((st_sys / 2) * fem_positive));

          return {
            'x1': posx,
            'y1': posy,
            'x2': posx2,
            'y2': posy
          };
        });

      det_lines_issues_obj[gender] = g_issues.selectAll('line')
        .data(data_arr_issues)
        .enter()
        .append('line')
        .attr('class', 'det_line_issues')
        .datum(data)
        .attrs(function(d, i) {

          var posx = origin + ((st_sys / 2) * fem_positive);
          var posy = anchor + (space_issues * (i - 1)) - (det_diff_scale(d[0]['average_' + gender]) + h_linea) + (hm_linea);

          return {
            'x1': posx,
            'y1': posy,
            'x2': posx,
            'y2': posy
          };
        })
        .styles({
          'stroke': function(d, i) {
            return paleta.issues[i];
          }
        });

      //--TRANSITION LINE ISSUES (--OJO DATUM SE RAYA SI HAY UNA TRANSICION DE POR MEDIO! )

      det_lines_issues_obj[gender]
        .transition()
        .duration(1000)
        .delay(500)
        .attrs({
          'x2': function(d, i) {

            var dat = d[0][gender][Object.keys(d[0][gender])[i]];
            var pos_zero = parseFloat(d3.select(this).attr('x1'));
            var posx = (det_issu_scale(dat) * fem_positive) + (origin - ((st_sys / 2) * fem_positive));

            return dat !== 0 ? posx : pos_zero;
          }
        });

      // ISSUES LABELS
      det_issues_labels[gender] = g_issues.selectAll('text')
        .data(data_arr_issues)
        .enter()
        .append('text')
        .attr('class', 'det_issues_labels')
        .datum(data)
        .attrs(function(d, i) {

          var posx = origin + ((st_sys / 2) * fem_positive);
          var posy = anchor + (space_issues * (i - 1)) - (det_diff_scale(d[0]['average_' + gender]) + h_linea) + (hm_linea);

          return {
            'x': posx + (w_issu * fem_positive),
            'y': posy
          };
        })
        .styles({
          'text-anchor': function() {
            return gender === 'female' ? 'start' : 'end'
          }
        });
      det_issues_labels[gender]
        .insert('tspan', ':nth-child(' + (gender === 'female' ? 1 : 0) + ')')
        .text(function(d, i) {
          return Object.keys(d[0][gender])[i];
        })
        .attrs({
          'class': 'det_issues_labels_txt',
          'dx': function() {
            return gender === 'female' ? 10 : 5;
          }
        });

      det_issues_labels[gender]
        .insert('tspan', ':nth-child(' + (gender === 'female' ? 0 : 1) + ')')
        .text(function(d, i) {
          var val = d[0][gender][Object.keys(d[0][gender])[i]];

          if (val === 0) {
            return 'no data'
          } else {
            return (Math.round(val * 10) / 10) + '%'
          }

        })
        .attrs({
          'class': 'dat_issue',
          'dx': function() {
            return gender === 'female' ? 5 : -10;
          }
        })
        .styles({
          'fill-opacity': function(d, i) {
            var val = d[0][gender][Object.keys(d[0][gender])[i]];

            if (val === 0) {
              return 0.2
            } else {
              return 1
            }
          }
        });

    } //---END CONFIG DRAW

    function draw_gender(gender, data) {
      var fem_positive = gender === 'female' ? 1 : -1;
      var origin = (w_rect_detail / 2) + (middle * fem_positive);

      var actselect = detail_wrap
        .data(data)
        .select('.g_detail_' + gender);

      //---CENTRAL LINE
      actselect.select('.det_central_line')
        .transition()
        .duration(500)
        .attrs({
          'y2': function(d, i) {
            return anchor - h_linea - det_diff_scale(d['average_' + gender]);
          }
        });

      //---SYMBOL LINE
      actselect.select('.det_symbol_line')
        .transition()
        .duration(500)
        .attrs({
          'y1': function(d, i) {
            return diff_h(d, gender);
          },
          'y2': function(d, i) {
            return diff_h(d, gender);
          }
        });
      //---GENDER LABEL
      actselect.select('.gender_label')
        .transition()
        .duration(500)
        .attrs({
          'y': function(d, i) {
            return diff_h(d, gender);
          }
        });
      //---GENDER LABEL
      actselect.select('.det_rect_dif')
        .transition()
        .duration(500)
        .attrs({
          'y': function(d, i) {

            return anchor - det_diff_scale((d['average_' + gender]));
          },
          'height': function(d, i) {
            var val = det_diff_scale(d['average_' + gender]) >= 0 ? det_diff_scale(d['average_' + gender]) : 0;
            return val;
          }
        });
      //---AVG TEXT
      actselect.select('.det_avg_text')
        .text(function(d, i) {
          return gender === 'male' ? 'AVG ' + format(d['average_' + gender]) + '%' : format(d['average_' + gender]) + '% AVG';
        });

      base_lines_issues_obj[gender]
        .datum(data)
        .transition()
        .duration(500)
        .attrs(function(d, i) {

            var posy = anchor + (space_issues * (i - 1)) - (det_diff_scale(d[0]['average_' + gender]) + h_linea) + (hm_linea);

            return {
              'y1': posy,
              'y2': posy

            }
          }

        );

      det_lines_issues_obj[gender]
        .datum(data)
        .transition()
        .duration(500)
        .attrs(function(d, i) {

            var dat = d[0][gender][Object.keys(d[0][gender])[i]];
            var pos_zero = parseFloat(d3.select(this).attr('x1'));
            var posx = (det_issu_scale(dat) * fem_positive) + (origin - ((st_sys / 2) * fem_positive));

            var posy = anchor + (space_issues * (i - 1)) - (det_diff_scale(d[0]['average_' + gender]) + h_linea) + (hm_linea);

            return {
              'x2': dat !== 0 ? posx : pos_zero,
              'y1': posy,
              'y2': posy

            }
          }

        );

      //-----LABEL ISSUES
      det_issues_labels[gender]
        .datum(data)
        .transition()
        .duration(500)
        .attrs(function(d, i) {

          var posy = anchor + (space_issues * (i - 1)) - (det_diff_scale(d[0]['average_' + gender]) + h_linea) + (hm_linea);

          return {
            'y': posy
          };
        })
        .select('.dat_issue')
        .text(function(d, i) {
          var val = d[0][gender][Object.keys(d[0][gender])[i]];

          if (val === 0) {
            return 'no data'
          } else {
            return format(val) + '%'
          }
        })
        .styles({
          'fill-opacity': function(d, i) {
            var val = d[0][gender][Object.keys(d[0][gender])[i]];

            if (val === 0) {
              return 0.2
            } else {
              return 1
            }
          }
        });

    } // END draw_gender
    //-------------------------
    //  AUXILIARY FUNCTIONS  

    function trans_txtnum(elm, duration, data) {
      trans_objs_arr[trans_counter] = {};

      d3.select(trans_objs_arr[trans_counter])
        .data(data)
        .transition()
        .duration(duration)
        .tween("text", function(d, i) {
          var i = d3.interpolateNumber(1, Math.abs(d.average_female - d.average_male));

          return function(t) {
            elm.text(format(i(t)) + '%');

          };
        });

      trans_counter++;
    }

    function trans_posy(elm, duration, data) {

      trans_objs_arr[trans_counter] = {};

      d3.select(trans_objs_arr[trans_counter])
        .data(data)
        .transition()
        .duration(duration)
        .tween("attr.y", function(d, i) {

          var posx = posx_det(d);
          var posy1 = anchor - det_diff_scale(d['average_' + 'male']);
          var posy2 = anchor - det_diff_scale(d['average_' + 'female']);

          var centroid = middlepoint(posx, posy1, posx, posy2);

          var i = d3.interpolateNumber(elm.attr('y'), centroid[1]);

          return function(t) {
            elm.attr('y', i(t));

          };

        });

      trans_counter++;

    }

    function style_worse(d) {
      return {
        'display': function(d, i) {
          if (d.average_female === 0) {

            return 'none';
          } else {
            return 'block';
          }
        }
      }

    }

    function posx_det(d) {
      return compare_avg(d, 'female', ((w_rect_detail / 2) - (w_lines / 2)) + w_lines, (w_rect_detail / 2) - (w_lines / 2));

    }

    function diff_h(d, gender) {
      return anchor - h_linea - det_diff_scale(d['average_' + gender]);
    }

    function compare_avg(d, gender, rtn1, rtn2) {
      var not_gender = gender === 'female' ? 'male' : 'female';
      //--ver si gender actual es peor
      if (d['average_' + gender] > d['average_' + not_gender]) {
        return rtn1;
      } else if (d['average_' + gender] === d['average_' + not_gender]) {
        return rtn2;
      } else {
        return rtn2;
      }

    }

  } //---> end DetailGraph()

})(window);
