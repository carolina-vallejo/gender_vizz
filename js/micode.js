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

    var spreadsheetID = "1PLXntCRH6r1EfwtxTThCu2lSZT1T0DxEG3NK9ar-qQ4";

    //https://docs.google.com/spreadsheets/d/1PLXntCRH6r1EfwtxTThCu2lSZT1T0DxEG3NK9ar-qQ4/pubhtml

    //https://docs.google.com/spreadsheets/d/1PLXntCRH6r1EfwtxTThCu2lSZT1T0DxEG3NK9ar-qQ4/pubhtml

    var url = "https://spreadsheets.google.com/feeds/list/1oet1UymEXnYnTh_5SsNcfxcHBvjkl1TIkP-S3wXx9uY/od6/public/values?alt=json";

    var url_ = 'data/data.json';

    var act_continent = 'AF';

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

      var detail_chart = new DetailGraph(configs_detail);

      /*-----------------------------
      // MAPS
      -----------------------------*/
      var configs_map = {
        container: map_container,
        topofile_url: 'json/world-map.json',
        draw_detail_func: detail_chart.draw,
        data: arr_datas
      };
      var cfgs_draw_small = {
        width: 250,
        height: 250,
        tooltip: false,
        zoom_map: 150,
        zoom_limit: 10,
        zoom_scale: 1.5,
        class_container: 'small'
      };
      var cfgs_draw_full = {
        width: window.innerWidth,
        height: window.innerHeight,
        tooltip: true,
        zoom_map: 190,
        zoom_limit: 100,
        zoom_scale: 4,
        class_container: 'full'
      };
      var map = new MapChart(configs_map);
      map.draw(cfgs_draw_small);

      /*-----------------------------
      // COUNTRIES BAR CHART
      -----------------------------*/
      var configs_barchart = {
        svg: svg,
        arr_averages: arr_datas[2],
        draw_detail_func: detail_chart.draw,
        map_funct: map.zoom_country
      };

      var country_barchart = new BarChart(configs_barchart);
      country_barchart.draw(data);

      console.log('code.js -> country_barchart draw!!')

      //------------------------------
      //---BTNS CONTINENTS INTERACTIVITY

      var $body = $('body'),
        $svg_map_wrapper = $(map_container);

      $('#' + act_continent).addClass('active');

      var $btns = $('.wrap-btns-continents .btn');

      data_act_continent = arr_datas[1][act_continent];

      $btns.on('click.btn', function() {
        $('.btn.active').removeClass('active');

        //---COUNTRY ACT
        act_continent = $(this).attr('data-continent');
        data_act_continent = arr_datas[1][act_continent];
        act_country = 0;

        country_barchart.draw(data_act_continent);
        detail_chart.draw([data_act_continent[act_country]]);

        $('#' + $(this).attr('id')).addClass('active');

        console.log([data_act_continent[act_country]][0].code);

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

          map.draw(cfgs_draw_full);

        } else {
          $this.text('OPEN MAP');
          $this.removeClass('close').addClass('open');
          $svg_map_wrapper.removeClass('world');
          $body.removeClass('world-vizz');

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

  - OJO SOLO VER EL BARCHART CON UN TIPO DE DATO, y UN SELECTOR PARA FILTRAR

  - OJO VER BAR CHART DE SOMALIA, DJIBOUTI; LA LINEA DEL AVERAGE NO MUESTRA LA VERDAD, en escala!!!
  - ojo cuando el average es igual quitar "WORSE!!" VER ARUBA
  - ojo con los valores en 100, ver que pasa
  - USAR EL ARR DE AVERAGES PARA HACER LAS ESTADÍSTICAS






_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

INTERFAZ- UX:


- hacer zoom en el mapa a cada pais, incluir los que falta

- hacer un buscador de country****  con un select2, un desplegable que busca dentro una lista al lado del nombre del país

- que el radio button del chart titile o salte o algo!, como hacer para que se sepa que se hace click ahí?

//////////////////
EL MAPA:

- en el mapa poner legenda de que signican los circulitos, peor o mejor 
- poder ver cada "issue" en el mapa (hacer selector de issues en la visualizacion del mapa) y en la grafica de continentes, se debe entender que es cada cosa


- ojo en el mundo marcar el pais con el color del female o male y localizar bien el country,
quitar países que no están en el mapa o buscarlos y dibujarlos, y recentrar el mapa por el pais


- tooltip para el mapa con las estadísticas de cada país (DISEÑO)

- que puedas navegar con el mapa, con hover salen las estadisticas de cada pais, y con click se ve el detalle de el pais
- centrar el mapa en el window

- rellenar el pais seleccionado con textures!
- que tal si sale un panel con todos los indicators que puedes seleccionar, ojo mirar el potus http://www.worldpotus.com/#/trump/brexit/countries/drops/outside-usa/ o screenshoot en moods

- ojo cuando se abre el tootip del pais, mostrar gráfica de detail, como pintarlo?? o volver atrás? analizar INTERACTION

- si es cloropleth poner legenda con escala de valores

EL MAPA SMALL

- poner una lupa cuando te paras encima, quitar el click para usuario

//////////////

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
- comparar child issues  

UX DATA-VISUALIZACION:
  - piensa como mostrar pattern, como por ejemplo cuando se ven todas las líneas juntas del barchart
  - comparar continentes con patterns con animacion, donde al separarse se marque el mayor y el mennor como con un triangulito, por ejemplo




_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_



-------*/
