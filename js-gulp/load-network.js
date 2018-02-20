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

    build(activeCity);

    function build(activeCity){
      var el = d3.select("#network-wrapper");
      el.selectAll("*").remove();
      var w = $(window);
      el.append("iframe")
        .attr("width", Math.floor($(window).width()) || "100%")
        .attr("height", height+"px")
        .attr("src", activeCity.toLowerCase()+".html");
    }

    if ($.isFunction(callback)) {
      callback();
    }
    // $("#loading-wrapper").addClass("hidden");
  }

})(d3, $, window);