;
(function (d3, $, window) {
  'use strict';

  if (!window.vibrant) {
    window.vibrant = {};
  }

  window.loadLocal = function loadLocal(callback) {
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
      element: d3.select('#local-bubble-legend div'), //.node(),
      class: "local-bubble-legend-tooltip"
    });


    function buildTable(data, colors) {
      const table = new LocalTable({
        element: d3.select('#local-table-wrapper'),
        data: data,
        colors: colors,
        count: undefined
      });
    }


    function buildBubble(data, colors) {
      const chart = new LocalBubble({
        element: d3.select('#local-bubble-wrapper'),
        data: data,
        colors: colors,
      });
      $(window).on('resize', () => chart.draw());
    }


    build(activeCity);

    function build(activeCity) {
      d3.queue(2)
        // .defer(d3.csv, `./data/${activeCity}_Table.csv`)
        // .defer(d3.csv, `./data/${activeCity}_Master_Traded.csv`)
        .defer(d3.csv, `./data/${activeCity}_Master_Local.csv`)
        .defer(d3.csv, `./data/color_legend.csv`)
        .await(function ready(error, master, colors) {
          if (error) throw error;
          // console.log(table, master);
          buildTable(master, colors);
          buildBubble(master, colors);
        });
    }



    if ($.isFunction(callback)) {
      callback();
    }
    // $("#loading-wrapper").addClass("hidden");
  }

})(d3, $, window);