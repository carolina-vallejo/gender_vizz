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

    var url = "https://spreadsheets.google.com/feeds/list/1oet1UymEXnYnTh_5SsNcfxcHBvjkl1TIkP-S3wXx9uY/od6/public/values?alt=json";

    var url_ = 'data/data.json';

    var act_continent = 'AF',
      act_country = 0; // detectar IP PAIS

    var eljson, json, external_svg, the_svg;

    //---positioning
    var max_width = 1280,
      cut_width = 124;

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

      var arr_datas = data_funct2(json);

      var data = arr_datas[1][act_continent];

      function data_funct2(eldata) {

        var series_obj = {
          'SE.ADT.LITR.FE.ZS': 'illiteracy',
          'SE.ADT.LITR.MA.ZS': 'illiteracy',
          'SH.DTH.INJR.1534.FE.ZS': 'death by injury',
          'SH.DTH.INJR.1534.MA.ZS': 'death by injury',
          'SL.UEM.TOTL.FE.NE.ZS': 'unemployement',
          'SL.UEM.TOTL.MA.NE.ZS': 'unemployement'
        };

        var data_obj_series = [];

        //----GET ALL SERIES data_obj
        var old_name = '';
        var new_name = '';
        var id_country = 0;

        eldata.forEach(function(d, i) {

          //--IMPORTANT: DATA IMPORT DATA SORTED BY COUNTRY / SERIE / GENDER
          //--IMPORTANT INCLUDE GENDER COLUMN

          /*        
          console.log(d.gsx$continent.$t);
          console.log(d.gsx$countryname.$t);
          console.log(d.gsx$countrycode.$t);
          console.log(d.gsx$gender.$t);
          console.log(d.gsx$average.$t);
          console.log('-----');
          */

          old_name = new_name;
          new_name = d.gsx$countrycode.$t;
          if (old_name !== new_name) {

            data_obj_series.push({
              country: d.gsx$countryname.$t,
              code: d.gsx$countrycode.$t,
              male: {},
              average_male: 0,
              average_female: 0,
              female: {},
              "laws": [{
                "id": 1,
                "title": "equal remuneration",
                "value": Math.floor((Math.random() * 2))
              }]
            });

            //---ojo tener en cuenta el NAN!
            if (d.gsx$seriescode.$t === 'SE.ADT.LITR.FE.ZS' || d.gsx$seriescode.$t === 'SE.ADT.LITR.MA.ZS') {

              data_obj_series[id_country][d.gsx$gender.$t][series_obj[d.gsx$seriescode.$t]] = isNaN(parseFloat(d.gsx$average.$t)) ? 0 : 100 - parseFloat(d.gsx$average.$t);

            } else {

              data_obj_series[id_country][d.gsx$gender.$t][series_obj[d.gsx$seriescode.$t]] = isNaN(parseFloat(d.gsx$average.$t)) ? 0 : parseFloat(d.gsx$average.$t);

            }

            data_obj_series[id_country]['continent'] = d.gsx$continent.$t;

            id_country++;

          } else {

            if (d.gsx$seriescode.$t === 'SE.ADT.LITR.FE.ZS' || d.gsx$seriescode.$t === 'SE.ADT.LITR.MA.ZS') {

              data_obj_series[id_country - 1][d.gsx$gender.$t][series_obj[d.gsx$seriescode.$t]] = isNaN(parseFloat(d.gsx$average.$t)) ? 0 : 100 - parseFloat(d.gsx$average.$t);

            } else {

              data_obj_series[id_country - 1][d.gsx$gender.$t][series_obj[d.gsx$seriescode.$t]] = isNaN(parseFloat(d.gsx$average.$t)) ? 0 : parseFloat(d.gsx$average.$t);

            }

            data_obj_series[id_country - 1]['continent'] = d.gsx$continent.$t;
          }
        });

        var arr_continents = {
          'AS': [],
          'AF': [],
          'EU': [],
          'NA': [],
          'SA': [],
          'OC': [],
          '--': []
        };

        data_obj_series.forEach(function(d, i) {

          arr_continents[d['continent']].push(d);

          var sum_m = 0,
            count_m = 0;
          for (var item in d['male']) {

            if (d['male'][item] !== 0) {
              sum_m += d['male'][item];
              count_m++;

            }

          }

          d['average_male'] = isNaN(sum_m / count_m) ? 0 : sum_m / count_m;

          var sum_f = 0,
            count_f = 0;
          for (var item in d['female']) {

            if (d['female'][item] !== 0) {
              sum_f += d['female'][item];
              count_f++;
            }

          }

          d['average_female'] = isNaN(sum_f / count_f) ? 0 : sum_f / count_f;

        });

        return [data_obj_series, arr_continents];
      }

      //////////////////////

      var data_length = data.length;
      //---window sizes
      var h_win_box = $(window).height();
      var w_win_box = $(window).width();

      //---sizes
      if ($(window).width() < (max_width + cut_width)) {
        var m_bars_section = ($(window).width() * 0.05) + 60;
      } else {
        var m_bars_section = (($(window).width() - max_width) / 2) + 60;
      }

      var box_boundary = (w_win_box - (m_bars_section * 2)) / (data.length);
      var radio_all = 200;

      //---Widths & Strokes
      var w_symb = 14,
        st_sys = 0.65,
        st_issues = 3,
        w_diff = 10,
        cx_middle = box_boundary / 2,
        anchor_point = radio_all / 2;

      var w_law = 6,
        h_linea = 0,
        h_diff = 50, //--separar label paises
        off_anchor = 18,
        space_issues = 6,
        w_base_line = box_boundary / 10;

      var opac_diff = 0.1;

      //----RECT detail
      var w_rect_detail = 120,
        h_rect_detail = h_win_box / 2.6;

      //---COORDS

      var coords_fem = [];

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

          d.map(function(dat, ind) {

            //---restring only valid

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

      var issues_scale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, 20]);

      //---section CONTAINERS
      var bars_chart = svg.append('g')
        .classed('bars_chart', true);

      var detail_wrap = svg.append('g')
        .classed('detail_wrap', true);

      /*------------------
      // SCALES
      -------------------*/
      var min_avg = d3.min(arr_averages);
      var max_avg = d3.max(arr_averages);
      //---HEIGHT DIFF

      var diff_scale = d3.scaleLinear()
        .domain([min_avg, max_avg])
        .range([0, 50]);

      var radio_nodes = createNodes(data.length, radio_all);

      /*------------------
      // POSITIONING
      -------------------*/

      detail_wrap.attrs({
        'transform': 'translate(' + ((w_win_box / 2) - ((w_rect_detail * 1.2) / 2)) + ',' + 0 + ') scale(1.2)'
      });

      /*------------------
      // COUNTRIES BAR CHART
      -------------------*/

      ////////////////////// 

      //-------defs on off law
      var defs = svg
        .append('defs')
        .attr('id', 'defs');

      defs.append('circle')
        .attrs({
          'id': 'law_on',
          'cy': anchor_point,
          'cx': cx_middle,
          'r': w_law / 2
        })
        .styles({
          'fill': 'none',
          'stroke': 'rgba(255, 255, 255, 1)',
          'stroke-width': 1
        });

      defs.append('rect')
        .attrs({
          'id': 'law_off',
          'y': anchor_point,
          'x': cx_middle - w_symb / 2,
          'width': w_symb,
          'height': 1
        })
        .styles({
          'fill': 'grey',
          'fill-opacity': 0.6,
          'stroke': 'none',
          'display': 'none'
        });
      defs.append('rect')
        .attrs({
          'id': 'box_law',
          'y': anchor_point - off_anchor,
          'x': cx_middle - off_anchor,
          'width': off_anchor * 2,
          'height': off_anchor * 2
        })
        .styles({
          'fill': 'none',
          'stroke': 'none',
          'stroke-opacity': 0.1,
          'stroke-width': st_sys
        });

      defs.append('polyline')
        .attrs({
          'id': 'check-ico',
          'points': '9.129,0.592 3.662,6.059 0.592,2.988',
          'transform': 'scale(1.2)'
        })
        .styles({
          'fill': 'none',
          'stroke': 'white',
          'stroke-opacity': 1,
          'stroke-width': 1.6738
        });
      defs.append('circle')
        .attrs({
          'id': 'radio-ico',
          'r': 5
        })
        .styles({
          'fill': 'rgba(255,255,255,0.7)',
          'stroke': 'none',
          'stroke-opacity': 1

        });

      var country_g;

      draw_bar_chart(data);

      function draw_bar_chart(data) {
        bars_chart.selectAll("*").remove();

        var wrap_countries = bars_chart.append('g')
          .classed('wrap_countries', true)
          .attr('transform', 'translate(22,0)');

        var links_wrap = bars_chart.append('g')
          .classed('links_wrap', true);

        country_g = wrap_countries.selectAll('g')
          .data(data)
          .enter()
          .append('g')
          .attr('class', function(d, i) {
            return d.code + ' country_g';
          })
          .attr('transform', function(d, i) {

            return 'translate(' + (((box_boundary * i) + (box_boundary / 2)) + m_bars_section) + ',0)'
          });

        //---rects
        country_g.append('rect')
          .attrs({
            'x': 0,
            'y': 0,
            'width': box_boundary,
            'height': radio_all,
            'fill': 'none',
            'stroke': 'white',
            'opacity': 0.0
          });

        var male_g = country_g.append('g').classed('male_g', true);
        var female_g = country_g.append('g')
          .classed('female_g', true);

        //////////////////////
        //------FEMALE        

        //------symbol female
        var sym_fem = female_g
          .append('line')
          .classed('sym_fem', true)
          //.attr('r', w_symb / 2)
          .attr('x1', function(d, i) {

            coords_fem[i] = {
              'cx': cx_middle + ((box_boundary * i) + m_bars_section)
            };
            return cx_middle - (w_symb / 2);
          })
          .attr('y1', function(d, i) {
            var l_pos_y = anchor_point - h_linea - off_anchor;

            coords_fem[i].cy = l_pos_y - diff_scale(d.average_male);

            return l_pos_y - diff_scale(d.average_male);
          })
          .attr('x2', function(d, i) {

            coords_fem[i] = {
              'cx': cx_middle + ((box_boundary * i) + m_bars_section)
            };
            return cx_middle + (w_symb / 2);
          })
          .attr('y2', function(d, i) {
            var l_pos_y = anchor_point - h_linea - off_anchor;

            coords_fem[i].cy = l_pos_y - diff_scale(d.average_male);

            return l_pos_y - diff_scale(d.average_male);
          })

        .styles({
          'fill': 'none',
          'stroke-width': st_sys,
          'stroke': paleta.symbols.female,
          'display': function(d, i) {
            if (d.average_female > d.average_male) {
              return 'block';
            } else {
              return 'block';
            }
          }
        });

        //---symbol if is max value  
        var sym_max_fem = female_g
          .append('circle')
          .attr('r', w_symb / 2)
          .attr('cx', function(d, i) {
            return cx_middle;
          })
          .attr('cy', function(d, i) {
            var l_pos_y = anchor_point - h_linea - off_anchor - (w_symb / 2);
            return l_pos_y - diff_scale(d.average_male);
          })

        .attr('transform-origin', 'center')
          .attr('transform', 'rotate(90)')
          .styles({
            'fill': function(d, i) {
              if (d.average_male < d.average_female) {
                return paleta.symbols.female;
              } else {
                return 'none';
              }
            },
            'fill-opacity': 0.0,
            'stroke-width': 1.5,
            'stroke': function(d, i) {
              if (d.average_female > d.average_male) {
                return paleta.symbols.female;
              } else {
                return 'none';
              }
            },
            'transform-origin': 'center',
            'transform': 'rotate(45deg) scale(0.5)'
          });

        //---CENTRAL LINE
        var central_line = female_g.append('line')
          .attr('x1', cx_middle)
          .attr('y1', anchor_point - off_anchor) //inicio line
          .attr('x2', cx_middle)
          .attr('y2', function(d, i) {
            var l_pos_y = anchor_point - h_linea - off_anchor;

            return l_pos_y - diff_scale(d.average_male);

          }) //largo linea
          .styles({
            'stroke': paleta.symbols.female,
            'stroke-width': st_sys / 1.5,
            'stroke-dasharray': "2, 2",
            'display': function(d, i) {
              if (d.average_female > d.average_male) {
                return 'block';
              } else {
                return 'block';
              }
            }
          });

        //---ISSUES
        var female_issues = female_g.append('g')
          .classed('issues', true);

        female_issues
          .each(function(d, i) {
            var count = -1;
            for (var item in d.female) {
              d3.select(this)
                .append('line')
                .attrs(function() {
                  var center = middlepoint(cx_middle, anchor_point - off_anchor, cx_middle, anchor_point - h_linea - off_anchor);
                  return {
                    'y1': anchor_point - off_anchor - issues_scale(d.female[item]),
                    'x1': cx_middle + (space_issues * count),
                    'y2': anchor_point - off_anchor,
                    'x2': cx_middle + (space_issues * count)
                  };
                })
                .styles({
                  'stroke': function() {
                    return paleta.issues[count + 1];
                  },
                  'stroke-width': st_issues,
                  'fill': 'none'
                });

              count++;
            } //--end for
          });

        //////////////////////
        //------ MALE

        //---SYMBOL
        male_g
          .append('line')
          .attr('x1', function(d, i) {
            return cx_middle - (w_symb / 2);
          })
          .attr('y1', function(d, i) {
            var l_pos_y = anchor_point + h_linea + off_anchor;
            return l_pos_y + diff_scale(d.average_male);
          })
          .attr('x2', function(d, i) {
            return cx_middle + (w_symb / 2);
          })
          .attr('y2', function(d, i) {
            var l_pos_y = anchor_point + h_linea + off_anchor;
            return l_pos_y + diff_scale(d.average_male);
          })
          .styles({
            'fill': 'none',
            'stroke-width': st_sys,
            'stroke': paleta.symbols.male,
            'display': function(d, i) {
              if (d.average_female < d.average_male) {
                return 'block';
              } else {
                return 'block';
              }
            }
          });

        //---symbol if is max value  
        male_g
          .append('circle')
          .attr('r', w_symb / 2)
          .attr('cx', function(d, i) {
            return cx_middle;
          })
          .attr('cy', function(d, i) {
            var l_pos_y = anchor_point + h_linea + off_anchor + (w_symb / 2);
            return l_pos_y + diff_scale(d.average_male);
          })

        .attr('transform-origin', 'center')
          .attr('transform', 'rotate(90)')
          .styles({
            'fill': function(d, i) {
              if (d.average_female < d.average_male) {
                return paleta.symbols.male;
              } else {
                return 'none';
              }
            },
            'fill-opacity': 0.0,
            'stroke-width': 1.5,
            'stroke': function(d, i) {
              if (d.average_female < d.average_male) {
                return paleta.symbols.male;
              } else {
                return 'none';
              }
            },
            'transform-origin': 'center',
            'transform': 'rotate(45deg) scale(0.5)'
          });
        //---CENTRAL LINE
        male_g.append('line')
          .attr('x1', cx_middle)
          .attr('y1', anchor_point + off_anchor) //inicio line
          .attr('x2', cx_middle)
          .attr('y2', function(d, i) {
            var l_pos_y = anchor_point + h_linea + off_anchor;

            return l_pos_y + diff_scale(d.average_male);
          }) //largo linea
          .styles({
            'stroke': paleta.symbols.male,
            'stroke-width': st_sys / 1.5,
            'stroke-dasharray': "2, 2",
            'display': function(d, i) {
              if (d.average_female < d.average_male) {
                return 'block';
              } else {
                return 'block';
              }
            }
          });

        //---ISSUES
        var male_issues = male_g.append('g')
          .classed('issues', true);

        male_issues
          .each(function(d, i) {
            var count = -1;
            for (var item in d.male) {
              d3.select(this)
                .append('line')
                .attrs(function() {

                  return {
                    'y1': anchor_point + off_anchor + issues_scale(d.male[item]),
                    'x1': cx_middle + (space_issues * count),
                    'y2': anchor_point + off_anchor,
                    'x2': cx_middle + (space_issues * count)
                  };
                })
                .styles({
                  'stroke': function() {
                    return paleta.issues[count + 1];
                  },
                  'stroke-width': st_issues,
                  'fill': 'none'
                });

              count++;
            } //--end for
          });

        //---LEGENDS
        var wrap_legends = country_g.append('g')
          .classed('wrap_legends', true);

        var e_legend = wrap_legends
          .append('text')
          .attrs({
            'x': function(d, i) {
              var l_pos = anchor_point + off_anchor + h_linea + h_diff + 20;
              return -l_pos;

            },
            'y': function(d, i) {
              return cx_middle + 4;

            },
            'transform': 'rotate(-90, 0, 0)'
          })
          .text(function(d, i) {
            return d.country;
          })
          .styles({
            'fill': 'white',
            'fill-opacity': 0.4,
            'text-transform': 'uppercase',
            'font-size': '13px',
            'text-anchor': 'end'
          });

        var radio_btn = country_g.append('circle')
          .attrs({
            'class': 'check',
            'cx': cx_middle,
            'cy': anchor_point,
            'r': 9
          })
          .styles({
            'stroke-width': 0.8,
            'stroke-opacity': 0.2,
            'stroke': 'white',
            'fill': colors.oscuro2,
            'cursor': 'pointer'
          })
          .on('click', function(d, i) {

            country_g.classed('active-country', false);
            d3.select(this.parentNode)
              .classed('active-country', true);

            act_country = $('.active-country').index();

            det_transiton_gender([data[i]], 'female', 0, 0);
            det_transiton_gender([data[i]], 'male', 0, 1);
            det_transition_all([data[i]]);

          })
          .on('mouseover', function() {
            d3.select(this).transition().styles({ 'stroke-opacity': 1 });
          })
          .on('mouseout', function() {
            d3.select(this).transition().styles({ 'stroke-opacity': 0.3 });
          });

        var radio_true = country_g
          .append('svg:use')
          .attrs({
            'xlink:href': '#radio-ico',
            'r': 4,
            'transform': function() {

              var cx = radio_btn.attr('cx');
              var cy = radio_btn.attr('cy');

              return 'translate(' + cx + ', ' + cy + ')';

            }
          })
          .styles({
            'pointer-events': 'none',
            'opacity': function(d, i) {

              return 0;
            }
          });

        //first radiotrue

        d3.select(country_g.nodes()[0])
          .classed('active-country', true);

        //-------- LAW ON / OFF  
        country_g
          .append('svg:use')
          .attr("xlink:href", function(d, i) {
            if (d.laws[0].value === 0) {
              return "#law_off";
            } else {
              return "#law_off";
            }
          });
        country_g
          .append('svg:use')
          .attr("xlink:href", function(d, i) {
            return "#box_law";
          });

        /*------------------
        // LINKS CURVE
        -------------------*/

        var links_fem = links_wrap.append('path')
          .datum(coords_fem) //--pasa todo el mogollon de data
          .attrs({
            'd': function(d, i) {
              var path_string = '';

              d.map(function(dat, ind) {

                if (ind === 0) {
                  path_string += 'M ' + dat.cx + ' ' + dat.cy + ' ';
                } else {
                  path_string += 'L ' + dat.cx + ' ' + dat.cy + ' ';
                }

              })
              return path_string;
            }
          })
          .styles({
            'stroke': paleta.symbols.female,
            'fill': 'none',
            'stroke-opacity': 0.7,
            'stroke-width': st_sys / 1.5,
            'display': 'none'

          });

        /*-----POSITIONING-------*/
        var w_indent = -0;
        var box_bars_chart = $('.bars_chart').get(0).getBBox();
        bars_chart.attrs({
          'transform': 'translate(' + (((w_win_box / 2) - (m_bars_section + w_indent)) - (box_bars_chart.width / 2)) + ',' + (h_win_box / 2) + ')'
        });

      } //----end: draw_bar_chart        

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
        w_law: 6,
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
        .range([0, h_diff]);

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

      /*---LAW DETAIL---*/
      var w_rect_law = 80;
      var rect_law = detail_wrap.append('rect')
        .attrs({
          'class': 'rect_law',
          'x': (parseFloat(rect_guide.attr('width')) / 2) - (w_rect_law / 2) + parseFloat(rect_guide.attr('x')),
          'y': rect_guide.attr('height'),
          'width': w_rect_law,
          'height': 30
        })
        .styles({
          'stroke': 'white',
          'stroke-width': 0.5,
          'fill': 'none',
          'display': 'none'
        });
      detail_wrap.append('text')
        .attrs({
          'x': rect_law.attr('x'),
          'y': rect_law.attr('y'),
          'dx': 15,
          'dy': 18
        })
        .data(data_det)
        .text(function(d, i) {

          if (d.laws[0].value === 0) {
            return "no";
          } else {
            return "yes";
          }
        })
        .styles({
          'fill': 'white',
          'display': 'none'
        });
      detail_wrap
        .append('svg:use')
        .data(data_det)
        .attr("xlink:href", function(d, i) {
          if (d.laws[0].value === 0) {
            return "#law_off";
          } else {
            return "#law_on";
          }
        })
        .attrs({
          'x': parseFloat(rect_law.attr('x')) + 55,
          'y': parseFloat(rect_law.attr('y')) - 86

        })
        .styles({
          'display': 'none'
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
            $.map(d.male, function(dat, ind) {
              var obj = {};
              obj[ind] = dat;
              arr_iss.push(obj);
            })
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

      /*------------------
      // RESIZE UPDATE
      -------------------*/
      function update_resize(data) {

        box_boundary = ($(window).width() - (m_bars_section * 2)) / (data.length + 1);

        //---countries
        var transition_country = country_g
          .transition()
          .duration(300)
          .attr('transform', function(d, i) {
            return 'translate(' + ((box_boundary * i) + m_bars_section) + ',0)'
          });

      } //--end update function

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

          draw_bar_chart(data_act_continent);

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

      /*-----NEXT COUNTRY BTN----*/

      $('#next-det-btn').on('click', function() {

        if (act_country === (data_act_continent.length - 1)) {

          act_country = 0;

        } else {
          act_country++;
        }
        country_g.classed('active-country', false);

        d3.select(country_g.nodes()[act_country])
          .classed('active-country', true);

        det_transiton_gender([data_act_continent[act_country]], 'female', 0, 0);
        det_transiton_gender([data_act_continent[act_country]], 'male', 0, 1);
        det_transition_all([data_act_continent[act_country]]);

      });
      /*-----PREV COUNTRY BTN----*/

      $('#prev-det-btn').on('click', function() {

        if (act_country === 0) {

          act_country = data_act_continent.length - 1;

        } else {
          act_country--;
        }
        country_g.classed('active-country', false);

        d3.select(country_g.nodes()[act_country])
          .classed('active-country', true);

        det_transiton_gender([data_act_continent[act_country]], 'female', 0, 0);
        det_transiton_gender([data_act_continent[act_country]], 'male', 0, 1);
        det_transition_all([data_act_continent[act_country]]);

      });

      ////////////////////////////////

    }); //---END THEN

  }); ///---END READY

  function middlepoint(x1, y1, x2, y2) {
    var center = [(parseFloat(x1) + parseFloat(x2)) / 2, (parseFloat(y1) + parseFloat(y2)) / 2];
    return center;
  }

  var createNodes = function(numNodes, radius) {
    var nodes = [],
      width = (radius * 2) + (radius),
      height = (radius * 2) + 20,
      angle,
      x,
      y,
      i;
    for (i = 0; i < numNodes; i++) {
      angle = (i / (numNodes / 2)) * Math.PI; // Calculate the angle at which the element will be placed.
      // For a semicircle, we would use (i / numNodes) * Math.PI.
      x = (radius * Math.cos(angle)) + (width / 2); // Calculate the x position of the element.
      y = (radius * Math.sin(angle)) + (height / 2); // Calculate the y position of the element.
      nodes.push({ 'x': x, 'y': y, 'angle': (angle * 180 / Math.PI) + 90 });
    }
    return nodes;
  }

  function getTranslation(transform) {
    //--transform is a string for the matrix

    // Create a dummy g for calculation purposes only. This will never
    // be appended to the DOM and will be discarded once this function 
    // returns.
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // Set the transform attribute to the provided string value.
    g.setAttributeNS(null, "transform", transform);

    // consolidate the SVGTransformList containing all transformations
    // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
    // its SVGMatrix. 
    var matrix = g.transform.baseVal.consolidate().matrix;

    // As per definition values e and f are the ones for the translation.
    return [matrix.e, matrix.f];
  }

  //--prototipes D3.js

  d3.selection.prototype.first = function() {
    return d3.select(this[0][0]);
  };
  d3.selection.prototype.last = function() {
    var last = this.size() - 1;
    return d3.select(this[0][last]);
  };

}(window.jQuery, window, document));

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
