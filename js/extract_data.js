function data_package_generator(eldata) {

  var series_obj = {
    'SE.ADT.LITR.FE.ZS': 'illiteracy',
    'SE.ADT.LITR.MA.ZS': 'illiteracy',
    'SH.DTH.INJR.1534.FE.ZS': 'death by injury',
    'SH.DTH.INJR.1534.MA.ZS': 'death by injury',
    'SL.UEM.TOTL.FE.NE.ZS': 'unemployement',
    'SL.UEM.TOTL.MA.NE.ZS': 'unemployement'
  };

  var data_obj_series = [],
    arr_averages = [];

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
        female: {}
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

    //---SET AVERAGES ONLY VALID
    var ave_male = (d.average_male === 0) ? NaN : (d.average_male === 100) ? NaN : d.average_male;
    var ave_female = (d.average_female === 0) ? NaN : (d.average_female === 100) ? NaN : d.average_female;

    arr_averages.push(ave_male);
    arr_averages.push(ave_female);

  });

  return [data_obj_series, arr_continents, arr_averages];
}
