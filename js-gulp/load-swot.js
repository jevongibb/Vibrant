;
(function (d3, $, window) {
  'use strict';

  if (!window.vibrant) {
    window.vibrant = {};
  }

  window.loadSwot = function loadSwot(callback) {
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



    build(activeCity);

    function build(activeCity) {
      $(".city").text(activeCity);
      new swotTable({
        activeCity: activeCity, //.node(),
        type: "strengths"
      });
      new swotTable({
        activeCity: activeCity, //.node(),
        type: "weaknesses"
      });
      new swotTable({
        activeCity: activeCity, //.node(),
        type: "opportunities"
      });
      new swotTable({
        activeCity: activeCity, //.node(),
        type: "threats"
      });
    }



    if ($.isFunction(callback)) {
      callback();
    }
    // $("#loading-wrapper").addClass("hidden");
  }

})(d3, $, window);