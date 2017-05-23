(function($, window, document) {

  $(function() {

    window.format = d3.format(".2f");
    window.colors = {
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

    var url = "https://spreadsheets.google.com/feeds/list/1oet1UymEXnYnTh_5SsNcfxcHBvjkl1TIkP-S3wXx9uY/od6/public/values?alt=json";

    var url_ = 'data/data.json';

    window.act_continent = 'AF';

    window.act_country = 0; // detectar IP PAIS
    window.data_act_continent;
    var json;

    window.paleta = {
      lines: 'white',
      issues: [colors.violeta, colors.verde, colors.azul],
      symbols: {
        female: colors.rosa,
        male: colors.aguamarina_osc
      },
      background: colors.oscuro2
    };

    var map_container = '#svg-map-wrapper';

    //---- GETS CHAIN
    $.when(
      $.getJSON(url, function(data) {
        json = data.feed.entry;

      })

    ).then(function() {

      /*------------------
      // INIT DATA
      -------------------*/
      var arr_datas = data_package_generator(json),
        data = arr_datas[1][act_continent];

      var data_map = arr_datas[0];

      /*------------------
      // CHARTS ZONE
      -------------------*/

      //----SVG CONTAINER
      var svg = d3.select('#svg_container')
        .append('svg')
        .attr('width', '100%')
        .attr('height', ($(window).height() - 40));

      var detail_wrap = svg.append('g')
        .classed('detail_wrap', true);

      /*------------------
      // DETAIL
      -------------------*/
      var configs_detail = {
        svg: svg,
        arr_averages: arr_datas[2],
        data: data

      };

      window.detail_chart = new DetailGraph(configs_detail);

      /*-----------------------------
      // MAPS
      -----------------------------*/
      var configs_map = {
        container: map_container,
        topofile_url: 'json/world-map.json',
        data: arr_datas
      };
      var cfgs_draw_small = {
        width: 250,
        height: 250,
        fullmap: false,
        zoom_map: 150,
        zoom_limit: 10,
        zoom_scale: 1.5,
        class_container: 'small'
      };
      var cfgs_draw_full = {
        width: window.innerWidth,
        height: window.innerHeight,
        fullmap: true,
        zoom_map: 190,
        zoom_limit: 20,
        zoom_scale: 4,
        class_container: 'full'
      };
      window.map = new MapChart(configs_map);
      map.draw(cfgs_draw_small);

      /*-----------------------------
      // COUNTRIES BAR CHART
      -----------------------------*/
      var configs_barchart = {
        svg: svg,
        arr_averages: arr_datas[2],
      };

      window.country_barchart = new BarChart(configs_barchart);
      country_barchart.draw(data);

      //console.log('code.js -> country_barchart draw!!')

      //------------------------------
      //---BTNS CONTINENTS INTERACTIVITY

      var $body = $('body'),
        $svg_map_wrapper = $(map_container);

      $('#' + act_continent).addClass('active');

      var $btns = $('.wrap-btns-continents .btn');

      data_act_continent = arr_datas[1][act_continent];

      //----BTN ON CLICK EVENT
      $btns.on('click.btn', function() {
        cleanbtns();

        //---COUNTRY ACT
        act_continent = $(this).attr('data-continent');
        data_act_continent = arr_datas[1][act_continent];
        act_country = 0;

        country_barchart.draw(data_act_continent);
        detail_chart.draw([data_act_continent[act_country]]);

        $('#' + $(this).attr('id')).addClass('active');

        var actelm = document.getElementById([data_act_continent[act_country]][0].code);

        map.zoom_country(actelm, [data_act_continent[act_country]][0].code);

      });

      $('#world-btn').on('click', function() {
        var $this = $(this);

        if ($this.hasClass('open')) {
          $this.text('CLOSE MAP');
          $this.removeClass('open').addClass('close');

          $svg_map_wrapper.addClass('world');
          $body.addClass('world-vizz');

          //---draw Big map
          map.draw(cfgs_draw_full, map.draw_data, '1');

        } else {
          $this.text('OPEN MAP');
          $this.removeClass('close').addClass('open');
          $svg_map_wrapper.removeClass('world');
          $body.removeClass('world-vizz');

          //---draw small map
          map.draw(cfgs_draw_small);
        }
      });
      $('#inactive-screen').on('click', function() {

        $svg_map_wrapper.addClass('world');
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

    $('#tool-legends').on('click', function() {
      $('#wrap-tooltip-legends').toggleClass('toggle');
    });

  }); ///---END READY

}(window.jQuery, window, document));

function cleanbtns() {
  $('.btn.active').removeClass('active');
}

function middlepoint(x1, y1, x2, y2) {
  var center = [(parseFloat(x1) + parseFloat(x2)) / 2, (parseFloat(y1) + parseFloat(y2)) / 2];
  return center;
}

