/**
 * @author Carolina Vallejo <carovallejomar@gmail.com>
 */

(function(global) {
  'use strict';

  /// Set MapChart global object ///
  if (!global.MapChart)
    global.MapChart = MapChart;

  function MapChart(config) {

    var self = this;

    //default configs..
    var cfg = {};
    self.cfg = cfg;

    //---CONFIGURABLES
    cfg.container = 'body';
    cfg.topofile_url = '';
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

    //-------------------------
    // VARIABLES
    var
      countries,
      projection,
      zoom,
      svg,
      active,
      width,
      height,
      zoom_scale,
      zoom_map,
      equiv,
      classname,
      options;

    //----D3 ELEMENTS
    var
      g,
      path,
      countries_paths,
      tooltip,
      data_g;

    var stroke_path = 0.5;
    //-------------------------
    // SCALES
    var map_scale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, 15]);

    //------------
    // datasort
    var countryByCode = d3.nest()
      .key(function(d) {
        return d.code;
      })
      .object(cfg.data[0]);

    //-------------------------

    self.draw = function(opts, callback, call_options) {
      options = opts;

      width = options.width;
      height = options.height;
      active = d3.select(null);
      zoom_scale = options.zoom_scale;
      zoom_map = options.zoom_map;
      classname = ' ' + options.class_container;

      d3.select('.svg-map').remove();

      //-------------------------
      // MAP CONFIGS
      projection = d3.geoMercator()
        .scale(zoom_map)
        .translate([width / 2, height / 1.6])

      zoom = d3.zoom()
        .scaleExtent([1 / 2, options.zoom_limit])
        .on("zoom", zoomed);

      path = d3.geoPath()
        .projection(projection);

      svg = d3.select(cfg.container).append("svg")
        .attr('class', 'svg-map' + classname)
        .attr("width", width)
        .attr("height", height)
        .on("click", stopped, true);

      svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .on("click", reset);

      g = svg.append("g")
        .style('stroke-width', stroke_path);

      svg.style("pointer-events", "all")
        .call(zoom);

      d3.json('json/code-exceptions.json', function(error, eq_json) {

        equiv = eq_json[0];
        var obj_continents = {
          'Asia': 'AS',
          'Africa': 'AF',
          'Europe': 'EU',
          'North America': 'NA',
          'South America': 'SA',
          'Oceania': 'OC'
        };

        d3.json(cfg.topofile_url, function(error, world) {
          if (error) throw error;
          countries = topojson.feature(world, world.objects.countries).features;

          countries_paths = g.selectAll(".country")
            .data(countries)
            .enter().append("path")
            .attr("class", "country")
            .attr('id', function(d, i) {
              return equiv[d.id];
            })
            .attr("d", path)
            .on('click', function(d, i) {

              self.zoom_country(this, d.id);

              var continent = obj_continents[d.properties.continent];
              var index_country = 0;

              cfg.data[1][continent].forEach(function(dat, ind) {

                if (equiv[d.id] === dat.code) {
                  index_country = ind;
                  act_country = ind;
                }

              });

              detail_chart.draw([cfg.data[1][continent][index_country]]);

              //--CLEAN ACTIVE
              $('.active-country').removeClass('active-country');
              //--NEW ACTIVE
              $('.country_g.' + equiv[d.id]).addClass('active-country');

              if (continent !== act_continent) {
                cleanbtns();
                $('#' + continent).addClass('active');
                country_barchart.draw(cfg.data[1][continent]);
                act_continent = continent;
              }

              if (options.fullmap) {

                self.draw_pie(this, d.id);
              }

            });

          if (options.fullmap) {
            countries_paths
              .on('mouseover', mouseover)
              .on('mousemove', mousemove)
              .on('mouseout', mouseout);

          }
          if (typeof callback === "function") {
            if (call_options !== undefined) {
              callback(call_options);
            }
          }

        }); //---END GET TOPOJSON

      }); //---END GET CODE EXCEPTIONS

    };

    self.draw_data = function(id) {

      data_g = g.append('g')
        .attrs({
          'class': 'data_g'
        })
        .styles({
          'stroke-width': 1
        });

      countries_paths
        .each(function(d, i) {
          var este = d3.select(this);
          if (countryByCode.hasOwnProperty(equiv[d.id])) {

            var txt = countryByCode[equiv[d.id]][0].country;
            var centroid = path.centroid(d);
            var dat = countryByCode[equiv[d.id]][0];

            data_g.append('circle')
              .attrs({
                //'data-country': txt,
                'class': function() {

                  var val = compare_avg(dat, 'female', ' w-female', ' w-male');

                  este.classed(val, true);

                  return 'data-circle' + val;
                },
                'r': function() {
                  var val = compare_avg(dat, 'female', map_scale(dat.average_female), map_scale(dat.average_male));

                  return val;

                },
                'cx': centroid[0],
                'cy': centroid[1]
              });

          }

        });

    };
    self.zoom_country = function(elm, id) {

      var d;
      d3.select('#' + id)
        .each(function(dat, i) {
          d = dat;
        });

      d3.select('.tooltip').remove();

      if (active.node() === elm) return reset();
      active.classed("active", false);

      active = d3.select(elm).classed("active", true);

      var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(zoom_scale, 0.9 / Math.max(dx / width, dy / height))),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

    };

    self.draw_pie = function(elm, id) {

      var d;
      d3.select('#' + id)
        .each(function(dat, i) {
          d = dat;

        });
        console.log(countryByCode[equiv[id]][0]);


      
      var centroid = path.centroid(d);

      var pieWrap = g.append('g')
        .attrs({
          'class': 'pie-wrap',
          'transform' : 'translate(' + centroid[0] + ',' + centroid[1] + ')'
        });

      //----PIE!!
      var dat1=countryByCode[equiv[id]][0]['average_female'];
      var dat2=countryByCode[equiv[id]][0]['average_male'];
      var dat = [dat1, dat2];


      console.log(dat);
      var classes = ['w-female','w-male'];

      var pie = d3.pie()
        .sort(null)
        .value(function(d) {
          return d;
        });

      var path_pie = d3.arc()
        .outerRadius(8)
        .innerRadius(2);

      var arc = pieWrap.selectAll(".arc")
        .data(pie(dat))
        .enter().append("g")
        .attr("class", "arc-pie");

      arc.append("path")
        .attr("d", path_pie)
        .attr("class", function(d, i) {
            return classes[i];
        });

    };

    return self;
    //-------------------------
    //  AUXILARIES FUNCTIONS

    function mouseover(d) {

      if (countryByCode.hasOwnProperty(equiv[d.id])) {

        d3.select('.tooltip').remove();
        tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .text(function() {

            return countryByCode[equiv[d.id]][0].country;

          })
          .styles({
            'text-anchor': 'middle',
            'opacity': function() {
              return 1;
            }
          });
      }

    }

    function mousemove(elm) {
      tooltip.styles({
        'left': (d3.event.pageX) + "px",
        'top': (d3.event.pageY - 12) + "px",

      })
    }

    function mouseout(elm) {

      d3.select('.tooltip').remove();
    }

    function click_function(d, elm) {
      // console.log(equiv[d.id]);

    }

    function zoomed() {

      d3.select('.tooltip').remove();

      g.attr("transform", isNaN(d3.event.transform.k) ? 'translate(0,0) scale(1)' : d3.event.transform);
      g.style("stroke-width", stroke_path / d3.event.transform.k + "px");

      if (options.fullmap) {
        data_g.style("stroke-width", 1 / d3.event.transform.k + "px");
      }

    }

    function stopped() {
      if (d3.event.defaultPrevented) d3.event.stopPropagation();
    }

    function reset() {
      active.classed("active", false);
      active = d3.select(null);

      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
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

    function getKey(obj, value) {
      for (var key in obj) {
        if (obj[key] == value) return key;
      }
    }

  } //---> end MapChart()

})(window);
