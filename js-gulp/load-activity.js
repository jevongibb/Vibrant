;
(function (d3, $, window) {
  'use strict';

  if (!window.vibrant) {
    window.vibrant = {};
  }

  window.loadActivity = function loadActivity(callback) {
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
      element: d3.select('#activity-bubble-legend div'), //.node(),
      class: "activity-bubble-legend-tooltip"
    });


    build(activeCity);

    function build(activeCity) {
      d3.queue(2)
        // .defer(d3.csv, `./data/${activeCity}_Table.csv`)
        .defer(d3.csv, `./data/${activeCity}_Master_Traded.csv`)
        .defer(d3.csv, `./data/color_legend2.csv`) //linked to color_legend2 to show you the issue
        .await(function ready(error, master, colors) {
          if (error) throw error;

          buildBubble(master, colors);
          buildTable(master);
        });
    }


    //Activity: NAICS=naics, Description=Label, Employees=2015, Relative Size=RS_2015, % Total=Pct_Total.
    function buildTable(data) {
      const table = new ActivityTable({
        element: d3.select('#activity-table-wrapper'),
        data: data,
        count: undefined
      });
    }



    function buildBubble(data, colors) {
      const chart = new ActivityBubble({
        element: d3.select('#activity-bubble-wrapper'), //document.querySelector('#activity-bubble-wrapper'),
        data: data,
        colors: colors
      });
    }


    if ($.isFunction(callback)) {
      callback();
    }

  }

})(d3, $, window);