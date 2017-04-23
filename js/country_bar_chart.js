  var h_win_box = $(window).height(),
    w_win_box = $(window).width(),
    max_width = 1280,
    cut_width = 124;

  var m_bars_section;

  //---ADJUST MARGIN TO SCREEN SIZES
  if (w_win_box < (max_width + cut_width)) {
    m_bars_section = (w_win_box * 0.05) + 60;
  } else {
    m_bars_section = ((w_win_box - max_width) / 2) + 60;
  }

  //--calc width box_country
  var w_box_country_bar;

  //---Widths & Strokes
  var w_symb = 14,
    st_sys = 0.65,
    st_issues = 3,
    cx_middle = w_box_country_bar / 2,
    anchor_point = 100;

  var h_linea = 0,
    h_diff = 50, //--separar label paises
    off_anchor = 18,
    space_issues = 6;

  /*-----NO ACTUALIZADO----*/

  /*------------------
   // SCALES
   -------------------*/
  var issues_scale;
  /*------------------
   // SVG ELEMENTS
   -------------------*/

  //--container
  var country_g;

  //--defs
  var defs;
  var diff_scale;

  function init_country_barchart(data, svg, arr_averages,paleta,colors) {
    /*------------------
     // INIT POSITIONING
     -------------------*/
    var min_avg = d3.min(arr_averages);
    var max_avg = d3.max(arr_averages);
    //---HEIGHT DIFF

    diff_scale = d3.scaleLinear()
      .domain([min_avg, max_avg])
      .range([0, 50]);

    h_win_box = $(window).height(),
      w_win_box = $(window).width(),
      max_width = 1280,
      cut_width = 124;

    //---ADJUST MARGIN TO SCREEN SIZES
    if (w_win_box < (max_width + cut_width)) {
      m_bars_section = (w_win_box * 0.05) + 60;
    } else {
      m_bars_section = ((w_win_box - max_width) / 2) + 60;
    }

    //--calc width box_country
    w_box_country_bar = (w_win_box - (m_bars_section * 2)) / (data.length);

    //---Widths & Strokes
    w_symb = 14,
      st_sys = 0.65,
      st_issues = 3,
      cx_middle = w_box_country_bar / 2,
      anchor_point = 100;

    h_linea = 0,
      h_diff = 50, //--separar label paises
      off_anchor = 18,
      space_issues = 6;

    /*------------------
     // SCALES
     -------------------*/
    issues_scale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, 20]);
    /*------------------
     // SVG ELEMENTS
     -------------------*/

    //--container
    country_g,
    bars_chart = svg.append('g')
      .classed('bars_chart', true);

    /*-----NO ACTUALIZADO----*/
    //--defs
    defs = svg
      .append('defs')
      .attr('id', 'defs');

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

    draw_bar_chart(data,paleta,colors);

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

  }

  function draw_bar_chart(data,paleta,colors) {
    bars_chart.selectAll("*").remove();

    var wrap_countries = bars_chart.append('g')
      .classed('wrap_countries', true)
      .attr('transform', 'translate(22,0)');

    country_g = wrap_countries.selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('class', function(d, i) {
        return d.code + ' country_g';
      })
      .attr('transform', function(d, i) {

        return 'translate(' + (((w_box_country_bar * i) + (w_box_country_bar / 2)) + m_bars_section) + ',0)'
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

        return cx_middle - (w_symb / 2);
      })
      .attr('y1', function(d, i) {
        var l_pos_y = anchor_point - h_linea - off_anchor;

        return l_pos_y - diff_scale(d.average_male);
      })
      .attr('x2', function(d, i) {

        return cx_middle + (w_symb / 2);
      })
      .attr('y2', function(d, i) {
        var l_pos_y = anchor_point - h_linea - off_anchor;

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

    /*-----POSITIONING EACH COUNTRY-BAR-------*/
    var w_indent = -0;
    var box_bars_chart = $('.bars_chart').get(0).getBBox();
    bars_chart.attrs({
      'transform': 'translate(' + (((w_win_box / 2) - (m_bars_section + w_indent)) - (box_bars_chart.width / 2)) + ',' + (h_win_box / 2) + ')'
    });

  } //----end: draw_bar_chart
