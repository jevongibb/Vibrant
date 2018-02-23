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

    addBubbleLegend();

    function addBubbleLegend() {
      let activityBubbleLegend = d3.select('#network-bubble-legend div');
      activityBubbleLegend.selectAll('*').remove();
      // let padding = activityBubbleLegend.node().getBoundingClientRect();
      let tooltip = activityBubbleLegend
        .append("div")
        .attr("class", "network-bubble-legend-tooltip")
        .style("visibility", "hidden");
      [{
        src: 'group1.jpg',
        tooltip: 'Ag, Fishing, Hunting, & Forestry'
      }, {
        src: 'group2.jpg',
        tooltip: 'Mining, Utilities, & Construction'
      }, {
        src: 'group3.jpg',
        tooltip: 'Manufacturing'
      }, {
        src: 'group4.jpg',
        tooltip: 'Wholesale, Transport, & Warehousing'
      }, {
        src: 'group5.jpg',
        tooltip: 'Services'
      }, {
        src: 'group6.jpg',
        tooltip: 'Education & Healthcare'
      }, {
        src: 'group7.jpg',
        tooltip: 'Arts & Hospitality'
      }, {
        src: 'group8.jpg',
        tooltip: 'Other'
      }].map((d, i) => {
        activityBubbleLegend.append('img') //<img src="img/legend2.png" alt="legend"></div>
          .attr('src', 'img dump/' + d.src)
          .attr('alt', 'legend')
          .style("cursor", "pointer")
          .on("mouseover", () => {
            tooltip.text(d.tooltip);
            tooltip.style("visibility", "visible");
          })
          .on("mousemove", function () {
            // console.log(d3.event.pageY, padding);
            tooltip.style("top", (i * 24 + 5) + "px").style("right", (40) + "px");
            // tooltip.style("top", ( Math.abs(d3.event.pageY - padding.top)-10)+"px").style("left",( Math.abs(d3.event.pageX - padding.left)+10)+"px");
          })
          .on("mouseout", () => tooltip.style("visibility", "hidden"))
      });
    }

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