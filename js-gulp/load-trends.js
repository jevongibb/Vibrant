;
(function (d3, $, window) {
  'use strict';

  if (!window.vibrant) {
    window.vibrant = {};
  }

  window.loadTrends = function loadTrends(callback) {
    run(undefined, callback);
  }






  function run(data, callback) {
    var activeCity = 'Austin';


    $('.dropdown-visible').off().on('click', function () {
      $('.dropdown-hidden').toggleClass('visibility-visible');
      // $(this).find('.fa').toggleClass('fa-angle-down').toggleClass('fa-angle-up');
    });
    $('.dropdown-item').off().on('click', function () {
      activeCity = $(this).data('value');
      $('.dropdown-value').text(activeCity);
      $('.dropdown-hidden').toggleClass('visibility-visible');
      build(activeCity);
    });


    new BubbleLegend({
      element: d3.select('#trends-bubble-legend div'), //.node(),
      class: "trends-bubble-legend-tooltip"
    });


    function buildTable(data, colors) {
      const table = new TrendsTable({
        element: d3.select('#trends-table-wrapper'),
        data: data,
        colors: colors,
        count: undefined,
        callback: function (bubbleObj) {
          buildBubble(bubbleObj);
        }
      });
    }

    function buildBubble(bubbleObj) { //bubbleByYear, years, year, yearLabel, absMaxX, absMaxY
      let bubbleByYearSliced = bubbleObj.bubbleByYear[bubbleObj.year].slice(0, 50);
      const chart = new TrendsBubble({
        element: d3.select('#trends-bubble-wrapper').node(), //document.querySelector('#trends-bubble-wrapper'),
        data: bubbleByYearSliced,
        year: bubbleObj.yearLabel,
        datas: bubbleObj.bubbleByYear,
        years: bubbleObj.years,
        absMaxX: bubbleObj.absMaxX,
        absMaxY: bubbleObj.absMaxY,
      });
      $(window).on('resize', () => chart.draw());
    }


    build(activeCity);

    function build(activeCity) {
      d3.queue(2)
        // .defer(d3.csv, `./data/${activeCity}_Table.csv`)
        .defer(d3.csv, `./data/${activeCity}_Master_Traded.csv`)
        .defer(d3.csv, `./data/color_legend.csv`)
        .await(function ready(error, master, colors) {
          if (error) throw error;
          // console.log(table, master);
          buildTable(master, colors);
        });
    }



    if ($.isFunction(callback)) {
      callback();
    }
    // $("#loading-wrapper").addClass("hidden");
  }

})(d3, $, window);