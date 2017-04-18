(function($, window, document) {

  $(function() {

    var colors = {
      violeta: '#7b24a6',
      violeta1: '#b035ec',
      verde: '#18d9a9',
      azul: '#218cff',
      rosa: '#ff0066',
      aguamarina: '#22f4ff',
      azul_oscuro: '#1a1921',
      aguamarina_osc: '#4ad1d9',
      grismedio: '#43414c',
      oscuro2: '#16151e'
    };

    var spreadsheetID = "1PLXntCRH6r1EfwtxTThCu2lSZT1T0DxEG3NK9ar-qQ4";

    //https://docs.google.com/spreadsheets/d/1PLXntCRH6r1EfwtxTThCu2lSZT1T0DxEG3NK9ar-qQ4/pubhtml

    var url_ = "https://spreadsheets.google.com/feeds/list/1oet1UymEXnYnTh_5SsNcfxcHBvjkl1TIkP-S3wXx9uY/od6/public/values?alt=json";

    var url = 'data/data.json';

    var act_continent = 'AF',
      act_country = 0; // detectar IP PAIS

    var json, external_svg, the_svg;

    //---positioning
    var h_win_box = $(window).height(),
      w_win_box = $(window).width();

    var paleta = {
      lines: 'white',
      issues: [colors.violeta, colors.verde, colors.azul],
      symbols: {
        female: colors.rosa,
        male: colors.aguamarina_osc
      },
      background: colors.oscuro2
    };

    var wrap_div_svg = d3.select('#svg-map')
      .style('height', $(window).height());

    //---- GETS CHAIN
    $.when(
      $.getJSON(url, function(data) {
        json = data.feed.entry;

      }),
      $.get("map/world_map.svg", function(xml) {

        //---STORAGE SVG
        external_svg = xml;

        //---APPEND SVG
        wrap_div_svg.html(external_svg);

        //---GET SVG external APPENDED
        the_svg = wrap_div_svg.select('svg');

      }, 'text') //---final get svg 

    ).then(function() {

      /*------------------
      // INIT DATA
      -------------------*/
      var arr_datas = data_package_generator(json),
        data = arr_datas[1][act_continent],
        data_length = data.length;

      //----RECT detail
      var w_rect_detail = 120,
        h_rect_detail = h_win_box / 2.6;

      /*------------------
      // MAP - COUNTRIES
      -------------------*/

      var map_scale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, 10]);

      var country_paths = the_svg.selectAll('path')
        .attrs({
          'stroke': 'rgba(255,255,255,0.3)',
          'stroke-opacity': 1,
          'stroke-width': 0.2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        })

      var data_map = arr_datas[0];
      var arr_averages = [];

      var country = the_svg
        .datum(data_map)
        .each(function(d, i) {

          d.forEach(function(dat, ind) {

            //---restrict to only valid

            var ave_male = (dat.average_male === 0) ? NaN : (dat.average_male === 100) ? NaN : dat.average_male;
            var ave_female = (dat.average_female === 0) ? NaN : (dat.average_female === 100) ? NaN : dat.average_female;

            arr_averages.push(ave_male);
            arr_averages.push(ave_female);

            the_svg.select('#' + dat.code).attrs({
                'class': 'xpath'
              })
              .each(function() {
                var box = this.getBBox();

                the_svg.append('circle')
                  .attrs({
                    'cx': box.x + (box.width / 2),
                    'cy': box.y + (box.height / 2),
                    'r': map_scale(dat.average_male),
                    'stroke': paleta.symbols.male,
                    'fill': 'none',
                    'fill-opacity': 0.3,
                    'stroke-width': 0.5
                  });
                the_svg.append('circle')
                  .attrs({
                    'cx': box.x + (box.width / 2),
                    'cy': box.y + (box.height / 2),
                    'r': map_scale(dat.average_female),
                    'stroke': paleta.symbols.female,
                    'fill': 'none',
                    'fill-opacity': 0.3,
                    'stroke-width': 0.5
                  });

              });

          });
        });

      /*------------------
      // CHARTS ZONE
      -------------------*/

      //----SVG CONTAINER
      var svg = d3.select('#svg_container')
        .append('svg')
        .attr('width', '100%')
        .attr('height', ($(window).height() - 40))
        .attr('class', 'the_svg')
        .style('background', paleta.background);

      var detail_wrap = svg.append('g')
        .classed('detail_wrap', true);

      /*------------------
      // SCALES
      -------------------*/
      var min_avg = d3.min(arr_averages);
      var max_avg = d3.max(arr_averages);
      //---HEIGHT DIFF



      /*------------------
      // POSITIONING
      -------------------*/


      detail_wrap.attrs({
        'transform': 'translate(' + ((w_win_box / 2) - ((w_rect_detail * 1.2) / 2)) + ',' + 0 + ') scale(1.2)'
      });

      init_country_barchart(data, svg,arr_averages,paleta,colors);
      /*-----------------------------
      // COUNTRIES BAR CHART
      -----------------------------*/
      var configs = {
        svg : svg,
        data: data,
        arr_averages : arr_averages
      };

      var country_barchart = new BarChart(configs);
      country_barchart.draw();

      country_barchart.setConfig( {
        data:[1,2]

      } );
      country_barchart.draw();


      /*------------------
      // DETAIL
      -------------------*/

      var data_det = [data[0]];

      d3.select('#' + data_det[0].code).classed('current', true);
      var box_det = 35;
      var det_rect_middle = ((w_rect_detail / 2) - (box_det / 2));

      var det = {
        w_symb: 8,
        st_sys: 1.5,
        st_issues: 3,
        w_diff: 24,
        middle: box_det / 2,
        anchor: h_rect_detail - 20,
        h_linea: 80,
        h_diff: 180,
        w_issu: 50,
        off_anchor: 8,
        space_issues: 12,
        w_base_line: box_det / 10,
        h_plus_average: 0
      };
      var det_diff_scale = d3.scaleLinear()
        .domain([min_avg, max_avg])
        .range([0, 50]);

      var det_issu_scale = d3.scaleLinear()
        .domain([0, 100])
        .range([3, det.w_issu]);

      var rect_guide = detail_wrap.append('rect')
        .attrs({
          'class': 'rect_guide',
          'x': 0,
          'y': 0,
          'width': w_rect_detail,
          'height': h_rect_detail
        })
        .styles({
          'stroke': 'white',
          'stroke-opacity': 0,
          'fill': 'none'
        });

      detail_wrap.append('line')
        .attrs({
          'x1': rect_guide.attr('x'),
          'y1': det.anchor,
          'x2': rect_guide.attr('width'),
          'y2': det.anchor
        })
        .styles({
          'stroke': 'white',
          'stroke-width': 0.15,
          //'stroke-dasharray': "4, 2"

        });

      /*------------------
      // TITLE COUNTRY IN DETAIL
      -------------------*/
      var title_country = detail_wrap.insert('text', ':nth-child(2)')
        .data(data_det)
        .attrs({
          'class': 'title_country',
          'x': parseFloat(rect_guide.attr('width')) / 2,
          'y': det.anchor - det.h_diff
        })
        .text(function(d, i) {
          return d.country;
        })
        .styles({
          'fill': 'white',
          'text-anchor': 'middle',
          'fill-opacity': 0.5,
          'font-size': '16px'
        });

      //----BOX TEXT COUNTRY
      var text_country_box = title_country['_groups'][0][0].getBBox();
      var text_pad = 10;

      var back_country = detail_wrap.insert('rect', ':nth-child(1)')
        .attrs({
          'class': 'back_country',
          'x': text_country_box.x - text_pad,
          'y': text_country_box.y - (text_pad / 2),
          'width': function() {
            return text_country_box.width + (text_pad * 2);
          },
          'height': function() {
            return text_country_box.height + (text_pad);
          }
        })
        .styles({
          'fill': 'none',
          'stroke': 'white',
          'stroke-width': 0.3
        })

      /*----------------------
      // DRAW DATA DETAILS
      -----------------------*/

      /*======###VARIABLES!!!========*/

      //ARRS D3 OBJECTS
      var det_lines_issues_arr = [];
      var det_central_line_arr = [];
      var det_symbol_line_arr = [];
      var det_rect_dif_arr = [];
      var det_issues_labels_arr = [];
      var gender_label_arr = [];
      var dat_issue_arr = [];
      var det_avg_text_arr = [];

      //D3 OBJECTS
      var tspan_num, line_fem, line_male, line_diff, det_rect_dif, det_avg_text, det_symbol_line, det_central_line, gender_label;

      //VARS OBJECTS
      var w_lines, centroid, tspan_label;

      draw_detail([data[0]], 'female', 0);
      draw_detail([data[0]], 'male', 1);

      d3.select('.g_detail_' + 'female')
        .attr('transform', 'translate(' + (det_rect_middle + (box_det / 1.5)) + ',0)');

      d3.select('.g_detail_' + 'male')
        .attr('transform', 'translate(' + (det_rect_middle - (box_det / 1.5)) + ',0)');

      /*----------------------
          //--DRAW        
      -----------------------*/
      function draw_detail(data, gender, num) {
        var elm_wrap = detail_wrap;

        //--APPEND
        g_detail = elm_wrap
          .data(data)
          .append('g')
          .classed('g_detail_' + gender, true);

        det_central_line = g_detail
          .append('line')
          .classed('det_central_line', true);

        det_symbol_line = g_detail
          .append('line')
          .classed('det_symbol_line', true);

        det_rect_dif = g_detail
          .append('rect')
          .classed('det_rect_dif', true);

        det_avg_text = g_detail
          .append('text')
          .classed('det_avg_text', true);

        var det_issues = g_detail
          .append('g')
          .classed('det_issues', true);

        var det_lines_issues = det_issues.selectAll('line')
          .data(function(d, i) {
            var arr_iss = [];

            var ind = 0;
            for (var prop in d.male) {
              var obj = {};
              obj[ind] = d.male[prop];
              arr_iss.push(obj);

              ind++;
            }
            return arr_iss;
          })
          .enter()
          .append('line')
          .attr('class', 'det_line_issues');

        det_issues_labels = det_issues.selectAll('text')
          .data(function(d, i) {
            var arr_iss = [];

            $.map(d.male, function(dat, ind) {
              var obj = {};
              obj[ind] = dat;
              arr_iss.push(obj);
            })

            return arr_iss;
          })
          .enter()
          .append('text');

        //---ATTRS

        det.num_issues = det_lines_issues.size();

        det_central_line
          .attrs({
            'x1': det.middle,
            'y1': det.anchor,
            'x2': det.middle,
            'y2': function(d, i) {

              return det.anchor - det.h_linea - det_diff_scale(d['average_' + gender]) - det.h_plus_average;
            }
          })
          .styles({
            'stroke': paleta.symbols[gender],
            'fill': 'none',
            'stroke-width': det.st_sys
          });

        det_symbol_line
          .attrs({
            'x1': 0,
            'y1': function(d, i) {

              return det.anchor - det.h_linea - det_diff_scale(d['average_' + gender]) - det.h_plus_average;
            },
            'x2': box_det,
            'y2': function(d, i) {
              return det.anchor - det.h_linea - det_diff_scale(d['average_' + gender]) - det.h_plus_average;
            }
          })
          .styles({
            'stroke': paleta.symbols[gender],
            'fill': 'none',
            'stroke-width': 1
          });

        det_rect_dif
          .attrs({
            'x': det.middle - (det.w_diff / 2),
            'y': function(d, i) {

              return det.anchor - det_diff_scale((d['average_' + gender])) - det.h_plus_average;
            },
            'width': det.w_diff,
            'height': function(d, i) {
              var val = det_diff_scale(d['average_' + gender]) >= 0 ? det_diff_scale(d['average_' + gender]) : 0;
              return val + det.h_plus_average;
            }
          })
          .styles({
            'fill': paleta.symbols[gender],
            'fill-opacity': 0.2
          });

        det_avg_text
          .text(function(d, i) {
            return gender === 'male' ? 'AVG ' + (Math.round((d['average_' + gender] * 1)) / 1) + '%' : (Math.round((d['average_' + gender] * 1)) / 1) + '% AVG';

          })
          .attrs({
            'dx': function() {
              return gender === 'male' ? det.w_diff : 0
            },
            'dy': 15,
            'x': det.middle - (det.w_diff / 2),
            'y': function(d, i) {
              return det.anchor;
            }
          })
          .styles({
            'text-anchor': function(d, i) {
              return gender === 'female' ? 'start' : 'end'
            },
            'fill': paleta.symbols[gender],
            'fill-opacity': 0.5,
            'font-size': '14px',
            'alignment-baseline': 'middle'
          });

        det_lines_issues
          .datum(data)
          .each(function(d, i) {

            var h_dif = det_diff_scale(d[0]['average_' + gender]) + det.h_linea;
            var h_ls = (det.h_linea / 2);

            d3.select(this)
              .attrs(function() {
                return {
                  'x1': function() {
                    var w_line = parseFloat(det_central_line.style('stroke-width'));

                    return gender !== 'female' ? det.middle - (w_line / 2) : det.middle + (w_line / 2);
                  },
                  'y1': det.anchor + (det.space_issues * (i - 1)) - h_dif + (h_ls) - det.h_plus_average,
                  'x2': function() {
                    //return det.middle;
                    var w_line = parseFloat(det_central_line.style('stroke-width'));

                    return gender !== 'female' ? det.middle - (w_line / 2) : det.middle + (w_line / 2);
                  },
                  'y2': det.anchor + (det.space_issues * (i - 1)) - h_dif + (h_ls) - det.h_plus_average
                };
              })

          })
          .styles({
            'stroke': function(d, i) {
              return paleta.issues[i];
            },
            'stroke-width': det.st_issues
          });

        //---TRANSITION FIRST ISSUES
        det_lines_issues
          .transition()
          .duration(1000)
          .delay(500)
          .attrs({
            'x1': function(d, i) {
              var dat = d[0][gender][Object.keys(d[0][gender])[i]];
              var dato = dat !== 0 ? det_issu_scale(dat) : 0;
              var w_line = parseFloat(det_central_line.style('stroke-width'));

              return gender !== 'female' ? -dato + (det.middle - (w_line / 2)) : dato + (det.middle + (w_line / 2));
            }
          });

        gender_label = g_detail.append('text')
          .text(function() {
            return gender === 'female' ? 'FEMALE' : 'MALE';
          })
          .attrs({
            'x': function() {

              return gender === 'female' ? det_symbol_line.attr('x2') : det_symbol_line.attr('x1');
            },
            'y': function() {
              return gender === 'female' ? det_symbol_line.attr('y2') : det_symbol_line.attr('y1');
            },
            'dx': function() {
              return gender === 'female' ? -35 : 30;
            },
            'dy': function() {
              return -10;
            }
          })
          .styles({
            'font-size': '12px',
            'fill': function() {
              //return gender === 'female' ? paleta.symbols.female : paleta.symbols.male;
              return 'white';
            },
            'fill-opacity': 0.5,
            'text-anchor': function() {
              return gender === 'female' ? 'start' : 'end'
            },
            'alignment-baseline': 'middle'
          });

        //----issues labels
        det_issues_labels
          .attrs({
            'class': 'det_issues_labels',
            'x': function(d, i) {

              return gender === 'female' ? parseFloat(det_central_line.attr('x1')) + det.w_issu : parseFloat(det_central_line.attr('x1')) - det.w_issu;
            },
            'y': function(d, i) {
              return d3.select(det_lines_issues._groups[0][i]).attr('y1');
            }

          })
          .styles({
            'font-size': '10px',
            'fill': 'white',
            'fill-opacity': 0.5,
            'text-anchor': function() {
              return gender === 'female' ? 'start' : 'end'
            }
          })
          .insert('tspan', ':nth-child(' + (gender === 'female' ? 1 : 0) + ')')
          .text(function(d, i) {

            return Object.keys(d);
          })
          .attrs({
            'dx': function() {
              return gender === 'female' ? 5 : 5;
            }
          })
          .styles({
            'alignment-baseline': 'middle',
            'text-transform': 'uppercase'
          });

        var dat_issue = det_issues_labels
          .insert('tspan', ':nth-child(' + (gender === 'female' ? 0 : 1) + ')')
          .datum(data)
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
              return gender === 'female' ? 5 : -5;
            }
          })
          .styles({
            'font-size': '12px',
            'fill': 'white',
            'alignment-baseline': 'middle',
            'text-transform': 'uppercase',
            'fill-opacity': function(d, i) {
              var val = d[0][gender][Object.keys(d[0][gender])[i]];

              if (val === 0) {
                return 0.2
              } else {
                return 1
              }
            }
          })

        //---export
        det_lines_issues_arr.push(det_lines_issues);
        det_central_line_arr.push(det_central_line);
        det_symbol_line_arr.push(det_symbol_line);
        det_rect_dif_arr.push(det_rect_dif);
        det_avg_text_arr.push(det_avg_text);
        det_issues_labels_arr.push(det_issues_labels);
        gender_label_arr.push(gender_label);
        dat_issue_arr.push(dat_issue);

      } //---draw detail

      /*----------------------
      // LABELS DIFFERENCE
      -----------------------*/
      var format = d3.format(".2n");

      function draw_gral_labels() {

        w_lines = 150;

        var labels_detail = detail_wrap.append('g')
          .classed('labels_detail', true);

        line_fem = labels_detail.append('line')
          .classed('line_fem', true);
        line_male = labels_detail.append('line')
          .classed('line_male', true);

        function draw_line(gender, elm) {
          elm
            .attrs({
              'x1': function(d, i) {

                if (gender === 'male') {
                  return d.average_female - d.average_male < 0 ? (w_rect_detail / 2) - (w_lines / 2) : (w_rect_detail / 2) - (w_lines / 2)
                } else {
                  return d.average_female - d.average_male < 0 ? (w_rect_detail / 2) - (w_lines / 2) : (w_rect_detail / 2) - (w_lines / 2) + 50
                }
              },
              'y1': function(d, i) {
                return det.anchor - det_diff_scale(d['average_' + gender]) - det.h_plus_average;
              },
              'x2': function(d, i) {

                if (gender === 'male') {
                  return d.average_female - d.average_male > 0 ? (w_rect_detail / 2) - (w_lines / 2) + w_lines : (w_rect_detail / 2) - (w_lines / 2) + w_lines - 50
                } else {
                  return d.average_female - d.average_male > 0 ? (w_rect_detail / 2) - (w_lines / 2) + w_lines : (w_rect_detail / 2) - (w_lines / 2) + w_lines
                }

              },
              'y2': function(d, i) {
                return det.anchor - det_diff_scale(d['average_' + gender]) - det.h_plus_average;
              }
            })
            .styles({
              'stroke': 'white',
              'stroke-width': 0.25,
              'stroke-dasharray': "2.5, 2.5",
              'display': function(d, i) {
                if (d.average_female === 0) {

                  return 'none';
                } else {
                  return 'block';
                }
              }
            });
        }

        draw_line('female', line_fem);
        draw_line('male', line_male);

        line_diff = labels_detail.append('line')
          .classed('line_diff', true)
          .attrs({
            'x1': function(d, i) {

              return d.average_female - d.average_male < 0 ? (parseFloat(line_fem.attr('x1')) - 5) : parseFloat(line_fem.attr('x2')) + 5
            },
            'y1': function(d, i) {

              return line_male.attr('y1')
            },
            'x2': function(d, i) {

              return d.average_female - d.average_male < 0 ? (parseFloat(line_fem.attr('x1')) - 5) : parseFloat(line_fem.attr('x2')) + 5
            },
            'y2': function(d, i) {

              return line_fem.attr('y1')
            }
          })
          .styles({
            'stroke': 'white',
            'stroke-width': 0.25

          });

        centroid = middlepoint(line_diff.attr('x1'), line_diff.attr('y1'), line_diff.attr('x2'), line_diff.attr('y2'));

        tspan_label = labels_detail.append('text')
          .classed('tspan_label', true)
          .text(function(d, i) {
            var worse = d.average_female > d.average_male ? 'female' : 'male';
            return 'worse ' + worse;
          })
          .attrs({
            'x': centroid[0],
            'y': centroid[1],
            'dx': function(d, i) {
              return d.average_female - d.average_male < 0 ? -10 : 10
            },
            'dy': 17
          })
          .styles({
            'font-size': '12px',
            'fill': function(d, i) {

              return d.average_female > d.average_male ? paleta.symbols.female : paleta.symbols.male;
            },
            'fill-opacity': 1,
            'text-anchor': function(d, i) {
              return d.average_female - d.average_male < 0 ? 'end' : 'start'
            },
            'alignment-baseline': 'middle',
            'text-transform': 'uppercase',
            'display': function(d, i) {
              if (d.average_female === 0) {

                return 'none';
              } else {
                return 'block';
              }

            }
          });

        tspan_num = labels_detail.append('text')
          .classed('tspan_num', true)
          .text(function(d, i) {
            return (Math.round(Math.abs(d.average_female - d.average_male) * 100) / 100) + '%';
            // return Math.round(Math.abs(d.average_female - d.average_male)) + '%';
          })
          .attrs({
            'x': centroid[0],
            'y': centroid[1],
            'dx': tspan_label.attr('dx')
          })
          .styles({
            'fill': function(d, i) {
              return d.average_female - d.average_male > 0 ? paleta.symbols.female : paleta.symbols.male;
            },
            'font-size': '22px',
            'text-anchor': tspan_label.style('text-anchor'),
            'alignment-baseline': 'middle',
            'display': function(d, i) {
              if (d.average_female === 0) {

                return 'none';
              } else {
                return 'block';
              }
            }
          });

      }
      draw_gral_labels();

      /*------------------
      // DATA TRANSITIONS
      -------------------*/

      function det_transiton_gender(data, gender, delay, num) {

        det_lines_issues_arr[num]
          .datum(data)
          .each(function(d, i) {

            var dat = d[0][gender][Object.keys(d[0][gender])[i]];
            var h_dif = det_diff_scale(d[0]['average_' + gender]) + det.h_linea;
            var h_ls = (det.h_linea / 2);

            d3.select(this)
              .transition()
              .duration(10)
              .attrs(function() {
                return {

                  'y1': det.anchor + (det.space_issues * (i - 1)) - h_dif + (h_ls) - det.h_plus_average,
                  'y2': det.anchor + (det.space_issues * (i - 1)) - h_dif + (h_ls) - det.h_plus_average
                };
              })
              //.on('end', labels)
              .transition()
              .duration(500)
              .delay(0)
              .attrs(function() {
                return {
                  'x1': function() {

                    var dato = dat !== 0 ? det_issu_scale(dat) : 0;
                    var w_line = parseFloat(det_central_line.style('stroke-width'));

                    return gender !== 'female' ? -dato + (det.middle - (w_line / 2)) : dato + (det.middle + (w_line / 2));
                  },
                  'x2': function() {
                    var w_line = parseFloat(det_central_line.style('stroke-width'));
                    return gender !== 'female' ? det.middle - (w_line / 2) : det.middle + (w_line / 2)
                  }
                };
              })

          })
        labels();

        function labels() {
          det_issues_labels_arr[num]
            .datum(data)
            .each(function(d, i) {
              var dat = d[0][gender][Object.keys(d[0][gender])[i]];
              var h_dif = det_diff_scale(d[0]['average_' + gender]) + det.h_linea;
              var h_ls = (det.h_linea / 2);
              d3.select(this)
                .transition()
                .attrs({

                  'y': det.anchor + (det.space_issues * (i - 1)) - h_dif + (h_ls) - det.h_plus_average

                })
            })
        }

        dat_issue_arr[num]
          .datum(data)
          .text(function(d, i) {
            var val = d[0][gender][Object.keys(d[0][gender])[i]];

            if (val === 0) {
              return 'no data'
            } else {
              return (Math.round(val * 10) / 10) + '%'
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

        det_central_line_arr[num]
          .data(data)
          .transition()
          .duration(500)
          .attrs({
            'x1': det.middle,
            'y1': det.anchor,
            'x2': det.middle,
            'y2': function(d, i) {

              return det.anchor - det.h_linea - det_diff_scale(d['average_' + gender]) - det.h_plus_average;
            }
          })
          .styles({
            'stroke': paleta.symbols[gender],
            'fill': 'none',
            'stroke-width': det.st_sys
          });

        det_symbol_line_arr[num]
          .data(data)
          .transition()
          .duration(500)
          .attrs({
            'x1': 0,
            'y1': function(d, i) {

              return det.anchor - det.h_linea - det_diff_scale(d['average_' + gender]) - det.h_plus_average;
            },
            'x2': box_det,
            'y2': function(d, i) {
              return det.anchor - det.h_linea - det_diff_scale(d['average_' + gender]) - det.h_plus_average;
            }
          })
          //.on('end', gender_label)
          .styles({
            'stroke': paleta.symbols[gender],
            'fill': 'none',
            'stroke-width': det.st_sys
          });
        gender_label();

        function gender_label() {
          gender_label_arr[num]
            .data(data)
            .transition()
            .duration(500)
            .attrs({
              'y': function(d, i) {
                return det.anchor - det.h_linea - det_diff_scale(d['average_' + gender]) - det.h_plus_average;
              }
            })
        }

        det_rect_dif_arr[num]
          .data(data)
          .transition()
          .duration(500)
          .attrs({
            'x': det.middle - (det.w_diff / 2),
            'y': function(d, i) {
              return det.anchor - det_diff_scale(d['average_' + gender]) - det.h_plus_average;
            },
            'width': det.w_diff,
            'height': function(d, i) {
              var val = det_diff_scale(d['average_' + gender]) >= 0 ? det_diff_scale(d['average_' + gender]) : 0;
              return val + det.h_plus_average;
            }
          })
          .styles({
            'fill': paleta.symbols[gender],
            'fill-opacity': 0.2
          });

        det_avg_text_arr[num]
          .data(data)
          .text(function(d, i) {
            return gender === 'male' ? 'AVG ' + (Math.round((d['average_' + gender] * 1)) / 1) + '%' : (Math.round((d['average_' + gender] * 1)) / 1) + '% AVG';

          });

      } //---end transition

      function det_transition_all(data) {
        d3.select('.current').classed('current', false);

        d3.select('#' + data[0].code).classed('current', true);

        draw_line('female', line_fem);
        draw_line('male', line_male);

        function draw_line(gender, elm) {
          elm
            .data(data)
            //.transition()
            //.duration(500)
            .attrs({
              'x1': function(d, i) {

                if (gender === 'male') {
                  return d.average_female - d.average_male < 0 ? (w_rect_detail / 2) - (w_lines / 2) : (w_rect_detail / 2) - (w_lines / 2)
                } else {
                  return d.average_female - d.average_male < 0 ? (w_rect_detail / 2) - (w_lines / 2) : (w_rect_detail / 2) - (w_lines / 2) + 50
                }
              },
              'y1': function(d, i) {
                return det.anchor - det_diff_scale(d['average_' + gender]) - det.h_plus_average;
              },
              'x2': function(d, i) {

                if (gender === 'male') {
                  return d.average_female - d.average_male > 0 ? (w_rect_detail / 2) - (w_lines / 2) + w_lines : (w_rect_detail / 2) - (w_lines / 2) + w_lines - 50
                } else {
                  return d.average_female - d.average_male > 0 ? (w_rect_detail / 2) - (w_lines / 2) + w_lines : (w_rect_detail / 2) - (w_lines / 2) + w_lines
                }

              },
              'y2': function(d, i) {
                return det.anchor - det_diff_scale(d['average_' + gender]) - det.h_plus_average
              }
            })
            .styles({
              'display': function(d, i) {
                if (d.average_female === 0) {

                  return 'none';
                } else {
                  return 'block';
                }

              }
            })
            .call(draw_line_diff);
        }

        function draw_line_diff() {
          line_diff
            .data(data)
            .attrs({
              'x1': function(d, i) {

                return d.average_female - d.average_male < 0 ? (parseFloat(line_fem.attr('x1')) - 5) : parseFloat(line_fem.attr('x2')) + 5
              },
              'y1': function(d, i) {

                return line_male.attr('y1')
              },
              'x2': function(d, i) {

                return d.average_female - d.average_male < 0 ? (parseFloat(line_fem.attr('x1')) - 5) : parseFloat(line_fem.attr('x2')) + 5
              },
              'y2': function(d, i) {

                return line_fem.attr('y1')
              }
            });
        }

        centroid = middlepoint(line_diff.attr('x1'), line_diff.attr('y1'), line_diff.attr('x2'), line_diff.attr('y2'));

        tspan_label
          .data(data)
          .text(function(d, i) {
            var worse = d.average_female > d.average_male ? 'female' : 'male';
            return 'worse ' + worse;
          })
          .attrs({
            'x': centroid[0],
            'y': centroid[1],
            'dx': function(d, i) {
              return d.average_female - d.average_male < 0 ? -10 : 10
            }
          })
          .styles({
            'text-anchor': function(d, i) {
              return d.average_female - d.average_male < 0 ? 'end' : 'start'
            },
            'fill': function(d, i) {

              return d.average_female > d.average_male ? paleta.symbols.female : paleta.symbols.male;
            },
            'display': function(d, i) {
              if (d.average_female === 0) {

                return 'none';
              } else {
                return 'block';
              }

            }
          });

        tspan_num
          .data(data)
          .attrs({
            'x': centroid[0],
            'y': centroid[1],
            'dx': tspan_label.attr('dx')
          })
          .styles({
            'fill': function(d, i) {
              return d.average_female - d.average_male > 0 ? paleta.symbols.female : paleta.symbols.male;
            },
            'text-anchor': tspan_label.style('text-anchor'),
            'display': function(d, i) {
              if (d.average_female === 0) {

                return 'none';
              } else {
                return 'block';
              }

            }
          })
          .transition()
          .duration(1000)
          .on("start", function repeat() {
            d3.active(this)
              .tween("text", function(d, i) {
                var that = d3.select(this),
                  i = d3.interpolateNumber(1, Math.round(Math.abs(d.average_female - d.average_male) * 100) / 100);

                //return (Math.round(Math.abs(d.average_female - d.average_male) * 100) / 100)  + '%';
                return function(t) {
                  that.text(format(i(t)) + '%');

                };
              });

          });
        title_country
          .data(data)
          .text(function(d, i) {
            return d.country;
          });
        text_country_box = title_country['_groups'][0][0].getBBox();
        back_country
          .attrs({
            'x': text_country_box.x - text_pad,
            'y': text_country_box.y - (text_pad / 2),
            'width': function() {
              return text_country_box.width + (text_pad * 2);
            },
            'height': function() {
              return text_country_box.height + (text_pad);
            }
          })

      } //--det_transition_all

      //----- LOOP ANIMATED
      var fps = 15;
      var loop_count = 0;

      function display_data() {
        setTimeout(function() {
          requestAnimationFrame(display_data);

          det_transiton_gender([data[loop_count]], 'female', 0, 0);
          det_transiton_gender([data[loop_count]], 'male', 0, 1);
          det_transition_all([data[loop_count]]);

          loop_count++;
        }, 1000);
      }
      //display_data();

      $(window).on("resize", function(e) {
        //--only in mobile!!!
        //update_resize(arr_datas[1][$('.btn.active').attr('data-continent')]);
      });

      //----EVENTS

      var $svg_map = $('#svg_map'),
        $body = $('body');

      $svg_map.addClass(act_continent);
      $('#' + act_continent).addClass('active');

      var $btns = $('.wrap-btns-continents .btn');

      var data_act_continent = arr_datas[1][act_continent];

      $btns.on('click', function() {

        if ($(this).attr('id') === 'world') {
          $svg_map.parent().addClass($(this).attr('id'));
          $body.addClass('world-vizz');
        } else {
          $svg_map.attr('class', '').addClass($(this).attr('id'));
          $body.removeClass('world-vizz');

          $btns.removeClass('active');

          //---COUNTRY ACT
          act_continent = $(this).attr('data-continent');
          data_act_continent = arr_datas[1][act_continent];
          act_country = 0;
          //draw new bar chart

          det_transiton_gender([data_act_continent[act_country]], 'female', 0, 0);
          det_transiton_gender([data_act_continent[act_country]], 'male', 0, 1);
          det_transition_all([data_act_continent[act_country]]);

          $('#' + $(this).attr('id')).addClass('active');
        }

        //--ojo actualiza la escala de los circulitos

      });
      $('#close-world-btn').on('click', function() {

        $svg_map.parent().removeClass('world');
        $body.removeClass('world-vizz');

      });
      $('#svg-map').on('click', function() {
        $svg_map.parent().addClass('world');
        $body.addClass('world-vizz');

      });

      /*--- INFO TOOTIP ---*/
      var $tooltip_tit = $('#modal-tit');

      $('#info-tip').on('click', function() {
        $tooltip_tit.fadeToggle();
      });

      $('.close-modal').on('click', function(e) {
        e.preventDefault();

        $(this).parents('.wrapper-modal').fadeOut();

      });

      ////////////////////////////////

    }); //---END THEN

  }); ///---END READY



}(window.jQuery, window, document));
  function middlepoint(x1, y1, x2, y2) {
    var center = [(parseFloat(x1) + parseFloat(x2)) / 2, (parseFloat(y1) + parseFloat(y2)) / 2];
    return center;
  }

/*-----------



----------TO-DOS-------

/////////////////////////////
///---   OJO  ---///

PARA PUBLICAR
- hacer stats
- arreglar mapa, interacciones, tooltips y legendas
- ux, buscar pais
- poner icono de descarga en github
- poner credits y licencia



_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_


  DATA:
  - OJO VER BAR CHART DE SOMALIA, DJIBOUTI; LA LINEA DEL AVERAGE NO MUESTRA LA VERDAD, en escala!!!
  - ojo cuando el average es igual quitar "WORSE!!" VER ARUBA
  - ojo con los valores en 100, ver que pasa
  - USAR EL ARR DE AVERAGES PARA HACER LAS ESTADÍSTICAS
  - error average Aruba



_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

INTERFAZ- UX:


- hacer zoom en el mapa a cada pais, incluir los que falta

- hacer un buscador de country****  con un select2, un desplegable que busca dentro una lista al lado del nombre del país

- que el radio button del chart titile o salte o algo!, como hacer para que se sepa que se hace click ahí?

MAPA:
- en el mapa poner legenda de que signican los circulitos, peor o mejor 
- poder ver cada "issue" en el mapa (hacer selector de issues en la visualizacion del mapa) y en la grafica de continentes, se debe entender que es cada cosa


- ojo en el mundo marcar el pais con el color del female o male y localizar bien el country,
quitar países que no están en el mapa o buscarlos y dibujarlos, y recentrar el mapa por el pais


- tooltip para el mapa con las estadísticas de cada país (DISEÑO)

- que puedas navegar con el mapa, con hover salen las estadisticas de cada pais, y con click se ve el detalle de el pais
- centrar el mapa en el window

- rellenar el pais seleccionado con textures!

MODE HELP:

- sacar tooltips en moed-help on/off

- el average de cada genero, que tenga un * (grande en bold) y que tenga un tooltip que diga que es el "average of indicators selected, all values sumarize and divide by the number of indicators available"

-iconos de stats y de contients, con alt para que se sepa que es cada

RESPONSIVE:
- los países con ocultos se muestran con el slider.
- dejar los menus en menu mobile
- detalle centrado
- en responsive el mapa que se marquen los paises con el color de male o female para los worst

CROSS BROWSER:
- No va en Firefox****  

EFFECTOS:
 - animar los bar chart

_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

IMPLEMENTAR:

- poder seleccionar más indicators
- sacar menu de stats:
  1. mayor y menor avegare
  2. cada issue, mayor y menor
  4. peor continente ¿como podría ser?
  5. mas stats¿?


_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_



-------*/
