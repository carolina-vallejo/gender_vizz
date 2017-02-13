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
      grismedio: '#43414c'
    };

    var url = 'data/data.json';
    var url2 = 'data/trozo-data.json';

    var eljson, eljson2, external_svg, the_svg;

    var paleta = {
      lines: 'white',
      issues: [colors.violeta, colors.verde, colors.azul],
      symbols: {
        female: colors.rosa,
        man: colors.aguamarina_osc
      },
      background: colors.azul_oscuro
    };

    var wrap_div_svg = d3.select('#svg-map')
      .style('height', $(window).height());

    //---- GETS CHAIN
    $.when(
      $.getJSON(url2, function(json) {
        eljson2 = json;

      }),
      $.getJSON(url, function(json) {
        eljson = json;

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


      console.log(data_funct2(eljson2));

      function data_funct2(eldata) {

        var data_obj=[];

         var data_obj_series=[];

      //----GET ALL SERIES data_obj
      var old_name = '';
      var new_name = '';
      var idcounter = 0;

      eldata.forEach(function(d, i) {
        console.log(i)


        old_name = new_name;
        new_name = d.gsx$seriesname.$t;
        if (old_name !== new_name) {
          idcounter++;
          console.log(d.gsx$seriesname.$t)
          data_obj_series.push({
            name: d.gsx$seriesname.$t,
            id: idcounter
            
          });
        } else {
          //data_obj[idcounter - 1].data.push(d);
        }

      });
      


        eldata.map(function(d) {
         // console.log(d)

          for (var item in d){

             // console.log(d[item]['$t'])
          }


          var viol = Math.floor((Math.random() * 100) + 1);
          var unem = Math.floor((Math.random() * 100) + 1);
          var illi = Math.floor((Math.random() * 100) + 1);

          var viol_f = Math.floor((Math.random() * 100) + 1);
          var unem_f = Math.floor((Math.random() * 100) + 1);
          var illi_f = Math.floor((Math.random() * 100) + 1);

          data_obj.push({
            country:d.countryname,
            code: d.code,
            man: {
              "violence": viol,
              "unemployement": unem,
              "illiteracy": illi
            },
            average_man: (viol + unem + illi) / 3,
            average_female: (viol_f + unem_f + illi_f) / 3,
            female: {
              "violence": viol_f,
              "unemployement": unem_f,
              "illiteracy": illi_f
            },
            "laws": [{
              "id": 1,
              "title": "equal remuneration",
              "value": Math.floor((Math.random() * 2))
            }]
          });


        });//--end map



        return data_obj_series;
      }      

      var data = data_funct(eljson);
      //---DATA PROCESSING      
      function data_funct(eldata) {
        return eldata.map(function(d) {


          var viol = Math.floor((Math.random() * 100) + 1);
          var unem = Math.floor((Math.random() * 100) + 1);
          var illi = Math.floor((Math.random() * 100) + 1);

          var viol_f = Math.floor((Math.random() * 100) + 1);
          var unem_f = Math.floor((Math.random() * 100) + 1);
          var illi_f = Math.floor((Math.random() * 100) + 1);

          return {
            code: d.code,
            man: {
              "violence": viol,
              "unemployement": unem,
              "illiteracy": illi
            },
            average_man: (viol + unem + illi) / 3,
            average_female: (viol_f + unem_f + illi_f) / 3,
            female: {
              "violence": viol_f,
              "unemployement": unem_f,
              "illiteracy": illi_f
            },
            "laws": [{
              "id": 1,
              "title": "equal remuneration",
              "value": Math.floor((Math.random() * 2))
            }]
          };
        });
      }
      //////////////////////
      var data_length = data.length;

      //---window sizes
      var h_win_box = $(window).height();
      var w_win_box = $(window).width();

      //---sizes
      var m_bars_section = 100;
      var box_boundary = (w_win_box - (m_bars_section * 2)) / (data.length);
      var radio_all = 200;

      //---Widths & Strokes
      var w_symb = 10,
        st_sys = 0.65,
        st_issues = 3,
        w_diff = 10,
        cx_middle = box_boundary / 2,
        anchor_point = radio_all / 2;

      var w_law = 6,
        h_linea = 20,
        h_diff = 40,
        off_anchor = 8,
        space_issues = 6,
        w_base_line = box_boundary / 10;

      var opac_diff = 0.1;

      //----RECT detail
      var w_rect_detail = 400,
        h_rect_detail = h_win_box / 2.5;

      //---COORDS

      var coords_fem = [];

      /*------------------
      // MAP - COUNTRIES
      -------------------*/

      var map_scale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, h_linea]);

      var country_paths = the_svg.selectAll('path')
        .attrs({
          'stroke': 'white',
          'stroke-opacity': 1,
          'stroke-width': 0.2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        })

      var country = the_svg
        .datum(data)
        .each(function(d, i) {
          d.map(function(dat, ind) {

            the_svg.select('#' + dat.code).attrs({
                'class': 'xpath'
              })
              .each(function() {
                //console.log(this.getBBox());
                var box = this.getBBox();

                the_svg.append('circle')
                  .attrs({
                    'cx': box.x + (box.width / 2),
                    'cy': box.y + (box.height / 2),
                    'r': map_scale(dat.average_man),
                    'stroke': paleta.symbols.man,
                    'fill': 'none'
                  });
                the_svg.append('circle')
                  .attrs({
                    'cx': box.x + (box.width / 2),
                    'cy': box.y + (box.height / 2),
                    'r': map_scale(dat.average_female),
                    'stroke': paleta.symbols.female,
                    'fill': 'none'
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
        .attr('height', $(window).height())
        .attr('class', 'the_svg')
        .style('background', paleta.background);

      //---section CONTAINERS
      var bars_chart = svg.append('g')
        .classed('bars_chart', true);

      var wrap_countries = bars_chart.append('g')
        .classed('wrap_countries', true);

      var issues_scale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, h_linea]);

      var links_wrap = bars_chart.append('g')
        .classed('links_wrap', true);

      var detail_wrap = svg.append('g')
        .classed('detail_wrap', true);

      /*------------------
      // SCALES
      -------------------*/

      //---HEIGHT DIFF
      var diff_scale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, h_diff]);

      var radio_nodes = createNodes(data.length, radio_all);

      /*------------------
      // POSITIONING
      -------------------*/

      bars_chart.attrs({
        'transform': 'translate(' + 0 + ',' + (h_win_box / 2) + ')'
      });

      detail_wrap.attrs({
        'transform': 'translate(' + ((w_win_box / 2) - (w_rect_detail / 2)) + ',' + 0 + ')'
      });

      /*------------------
      // COUNTRIES BAR CHART
      -------------------*/

      var country_g = wrap_countries.selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('class', function(d, i) {
          return d.code
        })
        .attr('transform', function(d, i) {
          //return 'translate(' + d[i].x + ', ' + d[i].y + ') rotate(' + d[i].angle + ', '+ (box_boundary/2) +', '+ (radio_all/2) +')';

          return 'translate(' + ((box_boundary * i) + m_bars_section) + ',0)'

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

      //-------defs on off law
      var defs = svg
        .append('defs')
        .attr('id', 'defs')
        .append('circle')
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
          'stroke': 'white',
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
          'fill': 'white',
          'stroke': 'none',
          'stroke-opacity': 1

        });

      //////////////////////
      //------FEMALE        

      //------symbol female
      var sym_fem = female_g
        .append('circle')
        .classed('sym_fem', true)
        .attr('r', w_symb / 2)
        .attr('cx', function(d, i) {

          coords_fem[i] = {
            'cx': cx_middle + ((box_boundary * i) + m_bars_section)
          };
          return cx_middle;
        })
        .attr('cy', function(d, i) {
          var l_pos_y = anchor_point - h_linea - off_anchor - (w_symb / 2);

          coords_fem[i].cy = l_pos_y - diff_scale(d.average_female)
          return l_pos_y - diff_scale(d.average_female);
        })
        .styles({
          'fill': 'none',
          'stroke-width': st_sys,
          'stroke': paleta.symbols.female
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
          return l_pos_y - diff_scale(d.average_female);
        })

      .attr('transform-origin', 'center')
        .attr('transform', 'rotate(90)')
        .styles({
          'fill': function(d, i) {
            if (d.average_man < d.average_female) {
              return paleta.symbols.female;
            } else {
              return 'none';
            }
          },
          'stroke': 'none',
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
          return l_pos_y - diff_scale(d.average_female);
        }) //largo linea
        .styles({
          'stroke': paleta.symbols.female,
          'stroke-width': st_sys / 1.5,
          'stroke-dasharray': "2, 2"
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
        .append('circle')
        .attr('r', w_symb / 2)
        .attr('cx', function(d, i) {
          return cx_middle;
        })
        .attr('cy', function(d, i) {
          var l_pos_y = anchor_point + h_linea + off_anchor + (w_symb / 2);
          return l_pos_y + diff_scale(d.average_man);
        })
        .styles({
          'fill': 'none',
          'stroke-width': st_sys,
          'stroke': paleta.symbols.man
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
          return l_pos_y + diff_scale(d.average_man);
        })

      .attr('transform-origin', 'center')
        .attr('transform', 'rotate(90)')
        .styles({
          'fill': function(d, i) {
            if (d.average_female < d.average_man) {
              return paleta.symbols.man;
            } else {
              return 'none';
            }
          },
          'stroke': 'none',
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
          return l_pos_y + diff_scale(d.average_man);
        }) //largo linea
        .styles({
          'stroke': paleta.symbols.man,
          'stroke-width': st_sys / 1.5,
          'stroke-dasharray': "2, 2"
        });

      //---ISSUES
      var male_issues = male_g.append('g')
        .classed('issues', true);

      male_issues
        .each(function(d, i) {
          var count = -1;
          for (var item in d.man) {
            d3.select(this)
              .append('line')
              .attrs(function() {

                return {
                  'y1': anchor_point + off_anchor + issues_scale(d.man[item]),
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
          return d.code;
        })
        .styles({
          'fill': 'white',
          'fill-opacity': 0.5,
          'text-transform': 'uppercase',
          'font-size': 12,
          'text-anchor': 'end'
        });

      var radio_btn = country_g.append('circle')
        .attrs({
          'class': 'check',
          'cx': cx_middle,
          'cy': radio_all + 80,
          'r': 9
        })
        .styles({
          'stroke-width': 0.5,
          'stroke-opacity': 0.2,
          'stroke': 'white',
          'fill': 'rgb(26, 25, 33)',
          'cursor': 'pointer'
        })
        .on('click', function(d, i) {

          radio_btn
            .transition()
            .style('opacity', 1);
          //limpiar
          radio_true.transition().style('opacity', 0);
          d3.select(this.nextSibling)
            .transition()
            .style('opacity', 1);

          det_transiton_gender([data[i]], 'female', 0, 0);
          det_transiton_gender([data[i]], 'man', 0, 1);
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
          'opacity': 0
        });

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
          'stroke-width': st_sys / 1.5

        });

      /*------------------
      // DETAIL
      -------------------*/

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
          'y1': rect_guide.attr('height'),
          'x2': rect_guide.attr('width'),
          'y2': rect_guide.attr('height')
        })
        .styles({
          'stroke': 'white',
          'stroke-width': 0.25,
          'stroke-dasharray': "4, 2"

        });

      //console.log(data[0]);
      var data_det = [data[0]];
      var box_det = 35;
      var det_rect_middle = ((w_rect_detail / 2) - (box_det / 2));

      var det = {
        w_symb: 8,
        st_sys: 1.5,
        st_issues: 3,
        w_diff: 24,
        middle: box_det / 2,
        anchor: h_rect_detail,
        w_law: 6,
        h_linea: 80,
        h_diff: 120,
        w_issu: 50,
        off_anchor: 8,
        space_issues: 12,
        w_base_line: box_det / 10
      };

      var det_diff_scale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, det.h_diff]);
      var det_issu_scale = d3.scaleLinear()
        .domain([0, 100])
        .range([5, det.w_issu]);

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
          'fill': 'none'
        })
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

        });

      /*------------------
      // TITLE COUNTRY IN DETAIL
      -------------------*/
      var title_country = detail_wrap.insert('text', ':nth-child(2)')
        .data(data_det)
        .attrs({
          'class': 'title_country',
          'x': parseFloat(rect_guide.attr('width')) / 2,
          'y': det.anchor - det.h_linea - det.h_diff - 50
        })
        .text(function(d, i) {
          return d.code;
        })
        .styles({
          'fill': 'white',
          'text-anchor': 'middle',
          'fill-opacity': 0.5,
          'font-size': 20
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
          'fill': 'white',
          'fill-opacity': 0.1
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

      //D3 OBJECTS
      var tspan_num, line_fem, line_man, line_diff, det_rect_dif, det_symbol_line, det_central_line, gender_label;

      //VARS OBJECTS
      var w_lines, centroid, tspan_label;

      draw_detail([data[0]], 'female', 0);
      draw_detail([data[0]], 'man', 1);

      d3.select('.g_detail_' + 'female')
        .attr('transform', 'translate(' + (det_rect_middle + (box_det / 1.5)) + ',0)');

      d3.select('.g_detail_' + 'man')
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

        var det_issues = g_detail
          .append('g')
          .classed('det_issues', true);

        var det_lines_issues = det_issues.selectAll('line')
          .data(function(d, i) {
            var arr_iss = [];
            $.map(d.man, function(dat, ind) {
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
            $.map(d.man, function(dat, ind) {
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

              return det.anchor - det.h_linea - det_diff_scale(d['average_' + gender]);
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

              return det.anchor - det.h_linea - det_diff_scale(d['average_' + gender]);
            },
            'x2': box_det,
            'y2': function(d, i) {
              return det.anchor - det.h_linea - det_diff_scale(d['average_' + gender]);
            }
          })
          .styles({
            'stroke': paleta.symbols[gender],
            'fill': 'none',
            'stroke-width': det.st_sys
          });

        det_rect_dif
          .attrs({
            'x': det.middle - (det.w_diff / 2),
            'y': function(d, i) {

              return det.anchor - det_diff_scale(d['average_' + gender]);
            },
            'width': det.w_diff,
            'height': function(d, i) {
              return det_diff_scale(d['average_' + gender]);
            }
          })
          .styles({
            'fill': paleta.symbols[gender],
            'fill-opacity': 0.2
          });

        det_lines_issues
          .datum(data)
          .each(function(d, i) {

            var dat = d[0][gender][Object.keys(d[0][gender])[i]];
            var h_dif = det_diff_scale(d[0]['average_' + gender]) + det.h_linea;
            var h_ls = (det.h_linea / 2);

            d3.select(this)
              .attrs(function() {
                return {
                  'x1': function() {

                    //return gender !== 'female' ? -det_issu_scale(dat) + det.middle : det_issu_scale(dat) + det.middle
                    return det.middle;
                  },
                  'y1': det.anchor + (det.space_issues * (i - 1)) - h_dif + (h_ls),
                  'x2': function() {
                    var w_line = parseFloat(det_central_line.style('stroke-width'));
                    return gender !== 'female' ? det.middle - (w_line / 2) : det.middle + (w_line / 2)
                  },
                  'y2': det.anchor + (det.space_issues * (i - 1)) - h_dif + (h_ls)
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
              //return det.middle;
              return gender !== 'female' ? -det_issu_scale(dat) + det.middle : det_issu_scale(dat) + det.middle
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
              return gender === 'female' ? 5 : -5;
            }
          })
          .styles({
            'font-size': 13,
            'fill': 'white',
            'fill-opacity': 0.5,
            'text-anchor': function() {
              return gender === 'female' ? 'start' : 'end'
            },
            'alignment-baseline': 'middle'
          });

        //----issues labels
        det_issues_labels
          .attrs({
            'x': function(d, i) {

              return gender === 'female' ? parseFloat(det_central_line.attr('x1')) + det.w_issu : parseFloat(det_central_line.attr('x1')) - det.w_issu;
            },
            'y': function(d, i) {
              return d3.select(det_lines_issues._groups[0][i]).attr('y1');
            }

          })
          .styles({
            'font-size': 9,
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

            return d[0][gender][Object.keys(d[0][gender])[i]] + '%'
          })
          .attrs({
            'class': 'dat_issue',
            'dx': function() {
              return gender === 'female' ? 5 : -5;
            }
          })
          .styles({
            'font-size': 12,
            'fill': 'white',
            'fill-opacity': 1,
            'alignment-baseline': 'middle',
            'text-transform': 'uppercase'

          })

        //---export
        det_lines_issues_arr.push(det_lines_issues);
        det_central_line_arr.push(det_central_line);
        det_symbol_line_arr.push(det_symbol_line);
        det_rect_dif_arr.push(det_rect_dif);
        det_issues_labels_arr.push(det_issues_labels);
        gender_label_arr.push(gender_label);
        dat_issue_arr.push(dat_issue);

      } //---draw detail

      /*----------------------
      // LABELS DIFFERENCE
      -----------------------*/

      function draw_gral_labels() {

        w_lines = 150;

        var labels_detail = detail_wrap.append('g')
          .classed('labels_detail', true);

        line_fem = labels_detail.append('line')
          .classed('line_fem', true);
        line_man = labels_detail.append('line')
          .classed('line_man', true);

        function draw_line(gender, elm) {
          elm
            .attrs({
              'x1': function(d, i) {

                if (gender === 'man') {
                  return d.average_female - d.average_man < 0 ? (w_rect_detail / 2) - (w_lines / 2) : (w_rect_detail / 2) - (w_lines / 2)
                } else {
                  return d.average_female - d.average_man < 0 ? (w_rect_detail / 2) - (w_lines / 2) : (w_rect_detail / 2) - (w_lines / 2) + 50
                }
              },
              'y1': function(d, i) {
                return det.anchor - det_diff_scale(d['average_' + gender])
              },
              'x2': function(d, i) {

                if (gender === 'man') {
                  return d.average_female - d.average_man > 0 ? (w_rect_detail / 2) - (w_lines / 2) + w_lines : (w_rect_detail / 2) - (w_lines / 2) + w_lines - 50
                } else {
                  return d.average_female - d.average_man > 0 ? (w_rect_detail / 2) - (w_lines / 2) + w_lines : (w_rect_detail / 2) - (w_lines / 2) + w_lines
                }

              },
              'y2': function(d, i) {
                return det.anchor - det_diff_scale(d['average_' + gender])
              }
            })
            .styles({
              'stroke': 'white',
              'stroke-width': 0.25,
              'stroke-dasharray': "2.5, 2.5"
            });
        }

        draw_line('female', line_fem);
        draw_line('man', line_man);

        line_diff = labels_detail.append('line')
          .classed('line_diff', true)
          .attrs({
            'x1': function(d, i) {

              return d.average_female - d.average_man < 0 ? (parseFloat(line_fem.attr('x1')) - 5) : parseFloat(line_fem.attr('x2')) + 5
            },
            'y1': function(d, i) {

              return line_man.attr('y1')
            },
            'x2': function(d, i) {

              return d.average_female - d.average_man < 0 ? (parseFloat(line_fem.attr('x1')) - 5) : parseFloat(line_fem.attr('x2')) + 5
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
          .text('difference')
          .attrs({
            'x': centroid[0],
            'y': centroid[1],
            'dx': function(d, i) {
              return d.average_female - d.average_man < 0 ? -10 : 10
            },
            'dy': 17
          })
          .styles({
            'font-size': 12,
            'fill': 'white',
            'fill-opacity': 0.5,
            'text-anchor': function(d, i) {
              return d.average_female - d.average_man < 0 ? 'end' : 'start'
            },
            'alignment-baseline': 'middle'
          });

        tspan_num = labels_detail.append('text')
          .classed('tspan_num', true)
          .text(function(d, i) {
            return Math.round(Math.abs(d.average_female - d.average_man)) + '%';
          })
          .attrs({
            'x': centroid[0],
            'y': centroid[1],
            'dx': tspan_label.attr('dx')
          })
          .styles({
            'fill': function(d, i) {
              return d.average_female - d.average_man > 0 ? paleta.symbols.female : paleta.symbols.man;
            },
            'font-size': 24,
            'text-anchor': tspan_label.style('text-anchor'),
            'alignment-baseline': 'middle'
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

                  'y1': det.anchor + (det.space_issues * (i - 1)) - h_dif + (h_ls),
                  'y2': det.anchor + (det.space_issues * (i - 1)) - h_dif + (h_ls)
                };
              })
              //.on('end', labels)
              .transition()
              .duration(500)
              .delay(0)
              .attrs(function() {
                return {
                  'x1': function() {

                    return gender !== 'female' ? -det_issu_scale(dat) + det.middle : det_issu_scale(dat) + det.middle
                      //return det.middle;
                  },
                  'x2': function() {
                    var w_line = parseFloat(det_central_line.style('stroke-width'));
                    return gender !== 'female' ? det.middle - (w_line / 2) : det.middle + (w_line / 2)
                  }
                };
              })
              

          })
          labels();
          function labels(){
            det_issues_labels_arr[num]
              .datum(data)
              .each(function(d, i) {
                var dat = d[0][gender][Object.keys(d[0][gender])[i]];
            var h_dif = det_diff_scale(d[0]['average_' + gender]) + det.h_linea;
            var h_ls = (det.h_linea / 2);
                d3.select(this)
                  .transition()
                  .attrs({

                    'y': det.anchor + (det.space_issues * (i - 1)) - h_dif + (h_ls)

                  })
              })            
          }

       dat_issue_arr[num]
        .datum(data)
          .text(function(d, i) {

            return d[0][gender][Object.keys(d[0][gender])[i]] + '%'
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

              return det.anchor - det.h_linea - det_diff_scale(d['average_' + gender]);
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

              return det.anchor - det.h_linea - det_diff_scale(d['average_' + gender]);
            },
            'x2': box_det,
            'y2': function(d, i) {
              return det.anchor - det.h_linea - det_diff_scale(d['average_' + gender]);
            }
          })
          //.on('end', gender_label)
          .styles({
            'stroke': paleta.symbols[gender],
            'fill': 'none',
            'stroke-width': det.st_sys
          });
          gender_label();

          function gender_label(){
            gender_label_arr[num]
              .data(data)
              .transition()
              .duration(500)
              .attrs({
                'y': function(d, i) {
                  return det.anchor - det.h_linea - det_diff_scale(d['average_' + gender]);
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

              return det.anchor - det_diff_scale(d['average_' + gender]);
            },
            'width': det.w_diff,
            'height': function(d, i) {
              return det_diff_scale(d['average_' + gender]);
            }
          })
          .styles({
            'fill': paleta.symbols[gender],
            'fill-opacity': 0.2
          });




      } //---end transition

      function det_transition_all(data) {

        draw_line('female', line_fem);
        draw_line('man', line_man);

        function draw_line(gender, elm) {
          elm
            .data(data)
            //.transition()
            //.duration(500)
            .attrs({
              'x1': function(d, i) {

                if (gender === 'man') {
                  return d.average_female - d.average_man < 0 ? (w_rect_detail / 2) - (w_lines / 2) : (w_rect_detail / 2) - (w_lines / 2)
                } else {
                  return d.average_female - d.average_man < 0 ? (w_rect_detail / 2) - (w_lines / 2) : (w_rect_detail / 2) - (w_lines / 2) + 50
                }
              },
              'y1': function(d, i) {
                return det.anchor - det_diff_scale(d['average_' + gender])
              },
              'x2': function(d, i) {

                if (gender === 'man') {
                  return d.average_female - d.average_man > 0 ? (w_rect_detail / 2) - (w_lines / 2) + w_lines : (w_rect_detail / 2) - (w_lines / 2) + w_lines - 50
                } else {
                  return d.average_female - d.average_man > 0 ? (w_rect_detail / 2) - (w_lines / 2) + w_lines : (w_rect_detail / 2) - (w_lines / 2) + w_lines
                }

              },
              'y2': function(d, i) {
                return det.anchor - det_diff_scale(d['average_' + gender])
              }
            })
            .call(draw_line_diff);
        }

        function draw_line_diff() {
          line_diff
            .data(data)
            .attrs({
              'x1': function(d, i) {

                return d.average_female - d.average_man < 0 ? (parseFloat(line_fem.attr('x1')) - 5) : parseFloat(line_fem.attr('x2')) + 5
              },
              'y1': function(d, i) {

                return line_man.attr('y1')
              },
              'x2': function(d, i) {

                return d.average_female - d.average_man < 0 ? (parseFloat(line_fem.attr('x1')) - 5) : parseFloat(line_fem.attr('x2')) + 5
              },
              'y2': function(d, i) {

                return line_fem.attr('y1')
              }
            });
        }

        centroid = middlepoint(line_diff.attr('x1'), line_diff.attr('y1'), line_diff.attr('x2'), line_diff.attr('y2'));

        tspan_label
          .data(data)
          .attrs({
            'x': centroid[0],
            'y': centroid[1],
            'dx': function(d, i) {
              return d.average_female - d.average_man < 0 ? -10 : 10
            }
          })
          .styles({
            'text-anchor': function(d, i) {
              return d.average_female - d.average_man < 0 ? 'end' : 'start'
            }
          });

        var format = d3.format(",d");
        tspan_num
          .data(data)
          .attrs({
            'x': centroid[0],
            'y': centroid[1],
            'dx': tspan_label.attr('dx')
          })
          .styles({
            'fill': function(d, i) {
              return d.average_female - d.average_man > 0 ? paleta.symbols.female : paleta.symbols.man;
            },
            'text-anchor': tspan_label.style('text-anchor'),
          })
          .transition()
          .duration(1000)
          .on("start", function repeat() {
            d3.active(this)
              .tween("text", function(d, i) {
                var that = d3.select(this),
                  i = d3.interpolateNumber(1, Math.round(Math.abs(d.average_female - d.average_man)));
                return function(t) {
                  that.text(format(i(t)) + '%');

                };
              });

          });
        title_country
        .data(data)
        .text(function(d, i) {
          return d.code;
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
      function update_resize() {

        box_boundary = ($(window).width() - (m_bars_section * 2)) / (data.length + 1);

        //---countries
        var transition_country = country_g
          .transition()
          .duration(300)
          .attr('transform', function(d, i) {
            return 'translate(' + ((box_boundary * i) + m_bars_section) + ',0)'
          });

      } //--end update function

      $(window).on("resize", function(e) {
        update_resize();
      });

      //----EVENTS
      $('.wrap-btns-continents .btn').on('click', function() {


        if ($(this).attr('id') === 'world') {
          $('#svg_map').parent().addClass($(this).attr('id'));
          $('body').addClass('world-vizz');
        } else {
          $('#svg_map').attr('class', '').addClass($(this).attr('id'));
          $('body').removeClass('world-vizz');
        }

        //--ojo actuliza la escala de los circulitos

      });
      $('#close-world-btn').on('click', function(){
        
        $('#svg_map').parent().removeClass('world');
        $('body').removeClass('world-vizz');

      });

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

}(window.jQuery, window, document));

/*-----------

Binding data to SVG elements
Creating new SVG elements
The behavior of entering elements
The behavior of updating elements
The behavior of exiting elements

PAN & ZOOM:
https://bl.ocks.org/mbostock/6123708


----------TO-DOS-------
- tooltip con la info de la LAW ON / OFF
- la línea del chart hacer opacidad 0 hasta que se reacomode y luego de nuevo opacidad 1
- fala el btn del world completo que abre una capa encima semi transparente con el mundo encima ()
- que se ilumine el pais seleccionado en el mapa del mundo


/////

- buscar anchors o bookmarks in sublime!

-------*/
