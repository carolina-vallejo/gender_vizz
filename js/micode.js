(function($, window, document) {

  $(function() {

    var colors = {
      violeta: '#7b24a6',
      verde: '#18d9a9',
      azul: '#218cff',
      rosa: '#ff0066',
      aguamarina: '#22f4ff',
      azul_oscuro: '#1a1921',
      aguamarina_osc: '#4ad1d9',
      grismedio: '#43414c'
    };

    var url = 'data/data.json';
    var paleta = {
      lines: 'white',
      issues: [colors.violeta, colors.verde, colors.azul],
      symbols: {
        female: colors.rosa,
        man: colors.aguamarina_osc
      },
      background: colors.azul_oscuro
    };

    $.getJSON(url, function(json) {

      var data = data_funct(json);

      //---DATA PROCESSING      
      function data_funct(eldata) {
        return eldata.map(function(d) {

          var manarr = Object.keys(d.man);

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
              "illiteracy": illi_f,
              'average': (viol_f + unem_f + illi_f) / 3
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
      var box_boundary = (w_win_box - (m_bars_section * 2)) / (data.length + 1);
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
      // CONTAINERS
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
        'transform': 'translate(0,' + (h_win_box / 2) + ')'
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
      female_g.append('line')
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

      wrap_legends
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
        })

      //-------- LAW ON / OFF  
      country_g
        .append('svg:use')
        .attr("xlink:href", function(d, i) {
          if (d.laws[0].value === 0) {
            return "#law_off";
          } else {
            return "#law_on";
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

      detail_wrap.append('rect')
        .attrs({
          'class': 'rect_guide',
          'x': 0,
          'y': 0,
          'width': w_rect_detail,
          'height': h_rect_detail
        })
        .styles({
          'stroke': 'white',
          'stroke-opacity': 0.2,
          'fill': 'none'
        });

      //console.log(data[0]);
      var data_det = [data[0]];

      //--APPEND
      var fem_detail = detail_wrap
        .data(data_det)
        .append('g')
        .classed('fem_detail', true);

      var det_central_line = fem_detail
        .append('line')
        .classed('det_central_line', true);

      var det_symbol_line = fem_detail
        .append('line')
        .classed('det_symbol_line', true);

      var det_rect_dif = fem_detail
        .append('rect')
        .classed('det_rect_dif', true);

      var det_issues = fem_detail
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
        .append('line');

      //---ATTRS
      var box_det = 30;

      var det = {
        w_symb: 10,
        st_sys: 1,
        st_issues: 4,
        w_diff: 18,
        middle: box_det / 2,
        anchor: h_rect_detail,
        w_law: 6,
        h_linea: 60,
        h_diff: 120,
        w_issu: 30,
        off_anchor: 8,
        space_issues: 10,
        w_base_line: box_det / 10,
        num_issues: det_lines_issues.size()
      };

      var det_diff_scale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, det.h_diff]);
      var det_issu_scale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, det.w_issu]);

      det_central_line
        .attrs({
          'x1': det.middle,
          'y1': det.anchor,
          'x2': det.middle,
          'y2': function(d, i) {

            return det.anchor - det.h_linea - det_diff_scale(d.average_female);
          }
        })
        .styles({
          'stroke': paleta.symbols.female,
          'fill': 'none',
          'stroke-width': det.st_sys
        });

      det_symbol_line
        .attrs({
          'x1': 0,
          'y1': function(d, i) {

            return det.anchor - det.h_linea - det_diff_scale(d.average_female);
          },
          'x2': box_det,
          'y2': function(d, i) {
            return det.anchor - det.h_linea - det_diff_scale(d.average_female);
          }
        })
        .styles({
          'stroke': paleta.symbols.female,
          'fill': 'none'
        });

      det_rect_dif
        .attrs({
          'x': det.middle - (det.w_diff / 2),
          'y': function(d, i) {

            return det.anchor - det_diff_scale(d.average_female);
          },
          'width': det.w_diff,
          'height': function(d, i) {
            return det_diff_scale(d.average_female);
          }
        })
        .styles({
          'fill': paleta.symbols.female,
          'fill-opacity': 0.3
        });

      det_lines_issues
        .datum(data_det)
        .each(function(d, i) {

          var dat = d[0].female[Object.keys(d[0].female)[i]];
          var h_dif = det_diff_scale(d[0].average_female) + det.h_linea;
          var h_ls = (det.h_linea / 2);
          d3.select(this)
            .attrs(function() {
              return {
                'x1': -det_issu_scale(dat),
                'y1': det.anchor + (det.space_issues * (i - 1)) - h_dif + (h_ls),
                'x2': det.middle - (det.st_sys / 2),
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

    }); //---JSON
  }); ///---END READY

  function middlepoint(x1, y1, x2, y2) {
    var center = [(x1 + x2) / 2, (y1 + y2) / 2];
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


-------*/
