/**
 * Javascript library for ....
 *
 * @version $Revision: 1 $$Date:: 2017-04-19 #$
 * @author Carolina Vallejo <carovallejomar@gmail.com>
 * @copyright Copyright(c) 2017 to the present, Carolina Vallejo
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
    cfg.data = {};
    cfg.svg = null;
    cfg.h_win_box = $(window).height();
    cfg.w_win_box = $(window).width();
    cfg.max_width = 1280;
    cfg.cut_width = 124;
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

    //---VARS INTERNAS
    var m_bars_section = (function() {
      var value;
      if (cfg.w_win_box < (cfg.max_width + cfg.cut_width)) {
        value = (cfg.w_win_box * 0.05) + 60;
      } else {
        value = ((cfg.w_win_box - cfg.max_width) / 2) + 60;
      }
      return value;

    })();
    var w_box_country_bar = (cfg.w_win_box - (m_bars_section * 2)) / (cfg.data.length);

    var w_symb = 14,
      st_sys = 0.65,
      st_issues = 3,
      cx_middle = w_box_country_bar / 2,
      anchor_point = 100;

    var h_linea = 0,
      h_diff = 50, //--separar label paises
      off_anchor = 18,
      space_issues = 6;


    //-------------------------
    //  Auto functions

    function dataprocess(par) {
      // console.log(w_box_country_bar);

    };
    console.log(d3.selectAll('div'));

    dataprocess('sss');
    //-------------------------
    //  return functions
    self.func1 = function() {
      //console.log('pppp');
    };

    self.draw = function() {
      //console.log('draw' + cfg.data);
      //console.log(w_box_country_bar);
    };

    return self;

  } //---> end BarChart()

})(window);
