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

    var url_ = "https://spreadsheets.google.com/feeds/list/1oet1UymEXnYnTh_5SsNcfxcHBvjkl1TIkP-S3wXx9uY/od6/public/values?alt=json";

    var url = 'data/data.json';

    var act_continent = 'AF';

    window.act_country = 0; // detectar IP PAIS
    window.data_act_continent;
    var json, external_svg, the_svg;

    //---positioning
    var h_win_box = $(window).height(),
      w_win_box = $(window).width();

    window.paleta = {
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
        .attr('class', 'the_svg');

      var detail_wrap = svg.append('g')
        .classed('detail_wrap', true);

      /*------------------
      // DETAIL
      -------------------*/
      var configs_detail = {
        svg: svg,
        arr_averages: arr_averages,
        data : data

      };

      var detail_chart = new DetailGraph(configs_detail);
      //detail_chart.draw(data);

      /*-----------------------------
      // COUNTRIES BAR CHART
      -----------------------------*/
      var configs_barchart = {
        svg: svg,
        arr_averages: arr_averages,
        draw_detail_func : detail_chart.draw
      };

      var country_barchart = new BarChart(configs_barchart);
      country_barchart.draw(data);





      //----- LOOP ANIMATED
      var fps = 15;
      var loop_count = 0;

      function display_data() {
        setTimeout(function() {
          requestAnimationFrame(display_data);

          

          loop_count++;
        }, 1000);
      }
      //display_data();


      //----EVENTS

      var $svg_map = $('#svg_map'),
        $body = $('body');

      $svg_map.addClass(act_continent);
      $('#' + act_continent).addClass('active');

      var $btns = $('.wrap-btns-continents .btn');

      data_act_continent = arr_datas[1][act_continent];

      $btns.on('click.btn', function() {

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
          country_barchart.draw(data_act_continent);
          detail_chart.draw([data_act_continent[act_country]]);

          

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

  - ojo: las barritas de issues que tengan un backgroung un poquito gris

  - ojo mal sao Tome an principe, azerbajan



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
- que tal si sale un panel con todos los indicators que puedes seleccionar, ojo mirar el potus http://www.worldpotus.com/#/trump/brexit/countries/drops/outside-usa/ o screenshoot en moods

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
