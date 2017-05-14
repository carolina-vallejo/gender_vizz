/**
 * @author Carolina Vallejo <carovallejomar@gmail.com>
 */

(function(global) {
  'use strict';

  /// Set BarChart global object ///
  if (!global.BarChart)
    global.BarChart = BarChart;

  function BarChart(config) {

    var self = this;

    //default configs..
    var cfg = {};
    self.cfg = cfg;

    //---CONFIGURABLES
    cfg.svg = null;
    cfg.arr_averages = [];

    //--------

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
    var max_width = 1200;
    var cut_width = 124;
    var marginBarchart = cals_bars(w_win, max_width);

    var w_symb = 14,
      st_sys = 0.65,
      st_issues = 2,
      sp_issues = st_issues * 2,
      anchor_point = 100;

    var h_diff = 50, //--separar label paises
      off_anchor = 18;

    //----SCALES
    var min_avg = d3.min(cfg.arr_averages);
    var max_avg = d3.max(cfg.arr_averages);

    var issues_scale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, 20]);

    var diff_scale = d3.scaleLinear()
      .domain([min_avg, max_avg])
      .range([0, (h_diff - 5)]);

    //---D3 CONTAINERS
    var chart_item,
      country_g;
    var gender_g = {
      male_g: null,
      female_g: null
    };

    //---TIMINGS
    var time1 = 1000;
    var time2 = 800;
    var time3 = 1200;
    var delay1 = 300;
    var delay2 = 800;
    var delay3 = 800;

    //---SELECTORS
    var $next_det_btn = $('#next-det-btn');
    var $prev_det_btn = $('#prev-det-btn');

    //-------------------------
    //  AUTO_FUNCTIONS
    function config_elems() {
      chart_item = cfg.svg.append('g')
        .attrs({
          'class': 'chart_item',
          'transform': 'translate(' + 0 + ', ' + (h_win / 2) + ')'
        });

    } //---config_elems  
    config_elems();

    /*-----NEXT COUNTRY BTN----*/

    $next_det_btn.on('click', function() {

      if (act_country === (data_act_continent.length - 1)) {

        act_country = 0;

      } else {
        act_country++;
      }
      country_g.classed('active-country', false);

      d3.select(country_g.nodes()[act_country])
        .classed('active-country', true);

      //---- NEW DRAW DETAIL
      detail_chart.draw([data_act_continent[act_country]]);

      var actelm = document.getElementById(data_act_continent[act_country].code);

      map.zoom_country(actelm, data_act_continent[act_country].code)

    });
    /*-----PREV COUNTRY BTN----*/

    $prev_det_btn.on('click', function() {

      if (act_country === 0) {

        act_country = data_act_continent.length - 1;

      } else {
        act_country--;
      }
      country_g.classed('active-country', false);

      d3.select(country_g.nodes()[act_country])
        .classed('active-country', true);

      //---- NEW DRAW DETAIL
      detail_chart.draw([data_act_continent[act_country]]);

      var actelm = document.getElementById(data_act_continent[act_country].code);

      map.zoom_country(actelm, data_act_continent[act_country].code)

    });

    //-------------------------

    self.draw = function(data) {

      chart_item.selectAll("*").remove();

      var box_length = data.length * 40;

      marginBarchart = cals_bars(w_win, ((max_width - box_length) > 0 ? box_length : max_width));

      var w_box = (w_win - (marginBarchart * 2)) / (data.length);

      //---NAV SLIDER
      $(window).ready(function() {
        $next_det_btn.css({
          'right': (marginBarchart - 50) + 'px',
          'opacity': 0.5
        });
        $prev_det_btn.css({
          'left': (marginBarchart - 20) + 'px',
          'opacity': 0.5
        });
      });

      //---RADIO BUTTON
      country_g = chart_item.selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attrs({
          'class': function(d, i) {
            return d.code + ' country_g';
          },
          'transform': 'translate(' + (((w_win / 2) - ((w_rect_detail * 0.4) / 2))) + ',0)'
        });

      //---RADIO BUTTON
      var radio_btn = country_g.append('circle')
        .attrs({
          'class': 'check',
          'cx': w_symb,
          'cy': anchor_point,
          'r': 7
        })
        .on('click', function(d, i) {

          country_g.classed('active-country', false);

          d3.select(this.parentNode)
            .classed('active-country', true);

          act_country = $('.active-country').index();

          //---- NEW DRAW DETAIL
          detail_chart.draw([data[i]]);


          var actelm = document.getElementById([data[i]][0].code);
          map.zoom_country(actelm, [data[i]][0].code);

        });

      country_g.append('circle')
        .attrs({
          'class': 'radio_true',
          'cx': w_symb,
          'cy': anchor_point,
          'r': 4
        });
      //---SELECT FIRST COUNTRY
      d3.select(country_g.nodes()[0])
        .classed('active-country', true)
        .append('circle')
        .attrs({
          'class': 'radio_true',
          'cx': w_symb,
          'cy': anchor_point,
          'r': 4
        });

      //---LEGENDS
      country_g.append('text')
        .attrs({
          'class': 'country_lengend',
          'x': function(d, i) {
            var l_pos = anchor_point + off_anchor + h_diff + 15;
            return -l_pos;

          },
          'y': w_symb + 4,
          'transform': 'rotate(-90, 0, 0)'
        })
        .text(function(d, i) {
          return d.country;
        })
        .transition()
        .duration(500)
        .delay(delay1 + delay2)
        .styles({
          'opacity': 1
        });

      //---DRAW EACH GENDER
      draw_gender('female')
      draw_gender('male')

      //---------------------
      //---TRANSITIONS 
      //(ojo una vez todo se haya incluido en el objeto se hace la transition sino peta)

      country_g.transition()
        .duration(time1)
        .delay(delay1)
        .attrs({
          'transform': function(d, i) {
            return 'translate(' + (((w_box * i) + (w_box / 2)) + marginBarchart) + ',0)'
          }
        });
      var data_det = [data[0]];
      d3.select('#' + data_det[0].code).classed('current', true);

      //console.log('draw-barchart-lib');
    };

    return self;

    //-------------------------
    //  FUNCTIONS 
    function draw_gender(gender) {

      var color = paleta.symbols[gender];

      //---COMMONS
      var str = {
        'fill': 'none',
        'stroke-width': st_sys,
      };

      var fem_negative = gender === 'female' ? -1 : 1;
      var origin = anchor_point + (off_anchor * fem_negative);

      var diffScale = function(d) {

        return diff_scale(d['average_' + gender]) * fem_negative;
        //return 0;
      };
      var issuesScale = function(d, item) {
        return issues_scale(d[gender][item]) * fem_negative;
        //return 0  * fem_negative;
      };

      gender_g[gender + '_g'] = country_g.append('g')
        .attr('class', gender + '_g');

      //--ADD HORIZONTAL LINE
      gender_g[gender + '_g'].append('line')
        .attrs({
          'class': 'vert_line',
          'x1': w_symb - (w_symb / 2),
          'y1': function(d, i) {
            return origin + diffScale(d);
          },
          'x2': w_symb + (w_symb / 2),
          'y2': function(d, i) {
            return d3.select(this).attr('y1');
          }
        })
        .styles(str);

      //--ADD VERTICAL LINE
      gender_g[gender + '_g'].append('line')
        .attrs({
          'class': 'horiz_line',
          'x1': w_symb,
          'y1': anchor_point + (off_anchor * fem_negative),
          'x2': w_symb,
          'y2': function(d, i) {
            return origin + diffScale(d);
          }
        })
        .styles(str);

      //--ADD GUIDE VERTICAL LINE
      if (gender === 'male') {
        gender_g[gender + '_g'].append('line')
          .attrs({
            'class': 'guide_line',
            'x1': w_symb,
            'y1': function(d, i) {
              var l_pos = anchor_point + off_anchor + h_diff + 15;
              return l_pos - 5;
              //return  anchor_point + (off_anchor * fem_negative)
            },
            'x2': w_symb,
            'y2': function(d, i) {
              return (origin + diffScale(d)) + 10;
            }
          })
          .styles({
            'stroke': 'white',
            'stroke-opacity': 0,
            'stroke-width': st_sys,
            'stroke-dasharray': "2, 2"
          })
          .transition()
          .duration(time2)
          .delay(delay1 + delay2)
          .styles({
            'stroke-opacity': 0.2,
          });
      }

      //--ADD CIRCLE
      var circle_sym = gender_g[gender + '_g'].append('circle')
        .attrs({
          'r': 0,
          'cx': w_symb,
          'cy': function(d, i) {
            var val = origin + ((w_symb / 2) * fem_negative);
            return val + diffScale(d);
          }
        })
        .styles(str)
        .styles({
          'display': function(d, i) {
            return compare_avg(d, gender, 'block', 'none');
          }
        });

      //---CIRCLE SYMBOL TRANSITION
      circle_sym.transition()
        .duration(time3)
        .delay(delay1 + delay2)
        .attrs({
          'r': w_symb / 6
        });

      //--------INDICATORS
      var lines_issues;

      gender_g[gender + '_g']
        .each(function(d, i) {
          var count = -1;
          for (var item in d[gender]) {
            lines_issues = d3.select(this)
              .append('line')
              .attrs(function() {
                return {
                  'y1': anchor_point + (off_anchor * fem_negative),
                  'x1': w_symb + (sp_issues * count),
                  'y2': anchor_point + (off_anchor * fem_negative),
                  'x2': w_symb + (sp_issues * count)
                };
              })
              .styles({
                'stroke': function() {
                  return paleta.issues[count + 1];
                },
                'stroke-width': st_issues,
                'fill': 'none',
                'display': 'none'
              })
              .transition()
              .duration(time2)
              .delay(delay1 + delay2)
              .attrs({
                'y1': anchor_point + (off_anchor * fem_negative) + issuesScale(d, item)
              });

            count++;
          } //--end for
        });

    } //--- end draw_gender
    //-------------------------
    //  AUXILIARY FUNCTIONS  

    function cals_bars(width, max_width) {
      var value;
      if (width < (max_width + cut_width)) {
        value = (width * 0.05) + 60;
      } else {
        value = ((width - max_width) / 2) + 60;
      }
      return value;

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

  } //---> end BarChart()

})(window);
