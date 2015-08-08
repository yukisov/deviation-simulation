(function(global) {
  "use strict";

  global.app = global.app || {};

  //---------------------------
  // Parameters module
  //---------------------------
  global.app.parameters = (function (global) {

    var default_value_averate = 70,
        default_value_deviation = 15;

    /**
     * @param event
     * @param ui
     */
    var handlerOfAverate = function(event, ui) {

      $( "#amount-average" ).val( ui.value );

      global.app.graph.render();

    };

    /**
     * @param event
     * @param ui
     */
    var handlerOfDeviation = function(event, ui) {

      $( "#amount-deviation" ).val( ui.value );

      global.app.graph.render();

    };

    /**
     *
     */
    var setEventHandlers = function() {

      $( "#slider-average" ).slider({
        orientation: "horizontal",
        range: "min",
        max: 100, // from 0
        value: default_value_averate, // default
        slide: handlerOfAverate,
        change: handlerOfAverate
      });
      $( "#slider-deviation" ).slider({
        orientation: "horizontal",
        range: "min",
        max: 30, // from 0
        value: default_value_deviation, // default
        slide: handlerOfDeviation,
        change: handlerOfDeviation
      });
      $( "#amount-average" ).val( default_value_averate );
      $( "#amount-deviation" ).val( default_value_deviation );

    };

    /**
     *
     */
    var init = function() {

      setEventHandlers();

    };

    return {
     init: init
    };

  })(global);

  //---------------------------
  // Graph Render module
  //---------------------------
  global.app.graph = (function (/*global*/) {

    /**
     *
     * @param average
     * @param deviation
     * @returns {{plotBands: Array, plotLines: Array, categories: Array, series: Array}}
     */
    var createData = function(average, deviation) {

      var plotBands, plotLines, categories = [], series,
        point, value1, value2, objTmp;

      // +++++ plotBands +++++
      plotBands =  [{ // visualize the σ
        from: (average - deviation) / 5,
        to: (average + deviation) / 5,
        color: 'rgba(68, 170, 213, .2)'
      }, { // visualize the 2σ
        from: (average - 2 * deviation) / 5,
        to: (average - deviation) / 5,
        color: 'rgba(213, 68, 169, .2)'
      }, { // visualize the 2σ
        from: (average + deviation) / 5,
        to: (average + 2 * deviation) / 5,
        color: 'rgba(213, 68, 169, .2)'
      }];

      // +++++ plotLines +++++
      objTmp = {
        color: '#000',
        dashStyle: 'ShortDash',
        width: 1,
        zIndex: 10
      };
      plotLines = [
        _.assign({
          value: average / 5,
          label: { text: '平均点'}
        }, objTmp),
        _.assign({
          value: (average - deviation) / 5,
          label: { text: '-σ'}
        }, objTmp),
        _.assign({
          value: (average + deviation) / 5,
          label: { text: '+σ'}
        }, objTmp),
        _.assign({
          value: (average - 2 * deviation) / 5,
          label: { text: '-2σ'}
        }, objTmp),
        _.assign({
          value: (average + 2 * deviation) / 5,
          label: { text: '+2σ'}
        }, objTmp)
      ];

      // +++++ series +++++
      series = [
        {
          name: '偏差値',
          yAxis: 0,
          data: []
        },
        {
          name: '正規分布 f(x)',
          yAxis: 1,
          type: 'spline',
          data: []
        }
      ];

      // +++++ series and categories +++++
      for (point = 0; point <= 100; point = point + 5) {
        value1 = ((point - average) / deviation) * 10 + 50;
        value2 = (Math.exp((-1) * (Math.pow((point - average), 2) / (2 * Math.pow(deviation, 2)))))
                  / (Math.sqrt(2 * Math.PI * deviation));
        categories.push(point);
        series[0].data.push(parseInt(value1));
        series[1].data.push(Math.floor(value2 * 1000) / 1000);
      }

      return {
        plotBands: plotBands,
        plotLines: plotLines,
        categories: categories,
        series: series
      };
    };

    /**
     *
     */
    var render = function() {

      var average = $( "#slider-average" ).slider( "value" ),
          deviation = $( "#slider-deviation" ).slider( "value" );

      var dataObj = createData(average, deviation);

      $('#graph-container').highcharts({
        chart: {
          //type: 'areaspline'
          zoomType: 'xy'
        },
        title: {
          text: '得点と偏差値の関係'
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 150,
          y: 100,
          floating: true,
          borderWidth: 1,
          backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        xAxis: {
          title: {
            text: '得点'
          },
          gridLineWidth: 1,
          type: "linear",
          categories: dataObj.categories,
          plotBands: dataObj.plotBands,
          plotLines: dataObj.plotLines
        },
        yAxis: [{ // Primary yAxis
          labels: {
            format: '{value}',
            style: {
              color: '#7CB5EC'
            }
          },
          title: {
            text: '偏差値',
            style: {
              color: '#7CB5EC'
            }
          }
        }, { // Secondary yAxis
          gridLineWidth: 0,
          title: {
            text: '正規分布 f(x)',
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          },
          labels: {
            format: '{value}',
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          },
          opposite: true
        }],
        tooltip: {
          shared: true,
          headerFormat: '{point.x}点<br/>'
        },
        credits: {
          enabled: false
        },
        plotOptions: {
          areaspline: {
            fillOpacity: 0.5
          }
        },
        series: dataObj.series
      });

    };

    return {
      render: render
    };

  })(global);

  //------------
  // Main
  //------------
  $(function(){

    global.app.parameters.init();
    global.app.graph.render();
    $(document).foundation();

  });

})((typeof window === 'object' && window) || global);
