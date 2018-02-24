;
(function (d3, $, window) {
  'use strict';

  if (!window.vibrant) {
    window.vibrant = {};
  }

  window.loadNetwork = function loadNetwork(callback) {
    run(undefined, callback);
  }

  function run(data, callback) {
    var activeCity = 'National';

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
    const otherHeight = $("#header").outerHeight(true) + $("#footer").outerHeight(true);
    const height = $(window).height() - otherHeight;
    $("#page-wrapper").addClass('no-min-height').css('height', height);


    new BubbleLegend({
      element: d3.select('#network-bubble-legend div'), //.node(),
      class: "network-bubble-legend-tooltip"
    });



    build(activeCity);

    function build(activeCity) {
      var el = d3.select("#network-wrapper");
      el.selectAll("*").remove();
      var w = $(window);
      el.append("iframe")
        .attr("width", Math.floor($(window).width()) || "100%")
        .attr("height", Math.floor(height) + "px")
        .attr("src", activeCity.toLowerCase() + ".html");
      // $("#network-wrapper").on('load', function(){
      //   //your code (will be called once iframe is done loading)
      //   ---console.log('load 1');
      // })
      // .ready(function(){
      //   //your code (will be called once iframe is done loading)
      //   +++console.log('load 2');
      // });
    }

    if ($.isFunction(callback)) {
      callback();
    }
    // $("#loading-wrapper").addClass("hidden");
  }

})(d3, $, window);