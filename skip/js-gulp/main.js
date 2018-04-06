$(function () {
  'use strict';


  if (!window.vibrant) {
    window.vibrant = {};
  }
  window.vibrant.city = 'Meridian';
  /*
   * this swallows backspace keys on any non-input element.
   * stops backspace -> back
   */
  var rx = /INPUT|SELECT|TEXTAREA/i;
  $(document).bind("keydown keypress", function (e) {
    if (e.which == 8) { // 8 == backspace
      if (!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly) {
        e.preventDefault();
      }
    }
  });


  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }



  window.onpopstate = function (event) {
    $(document).ready(function () {
      // new WOW().init();
      resize(true);
      loadPage({}, true);
    });
  };

  var loadingWrapper;
  $(document).ready(function () {
    loadingWrapper = $("#loading-wrapper");
    // new WOW({ scrollContainer: '.scrollert-content' }).init();
    resize(true);
    $('#navigation .link-to').off().on("click", function (event) {
      event.stopPropagation();
      event.preventDefault();
      let linkTo = $(this).data('link-to');
      loadPage({
        page: linkTo
      });
    });
    loadPage({}, true);
  });

  /**
   * detect IE
   * returns version of IE or false, if browser is not Internet Explorer
   */
  function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
      // IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
      // IE 11 => return version number
      var rv = ua.indexOf('rv:');
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
      // Edge (IE 12+) => return version number
      return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
  }



  var events = {
    // "graphs": {
    //   page: "graphs",
    //   nav: "graphs",
    //   event: window.loadGraph
    // },
    "blog": {
      page: "blog",
      nav: undefined,
      event: window.loadLanding,
      prevAjax: function () {
        $('#sub-navigation').addClass("hidden");
        $("#page-wrapper").css('height', "inherit").removeClass('no-min-height');
        $("#container").css('margin-top', "50px");
        loadingWrapper.addClass("hidden");
      },
      nextAjax: undefined
    },
    "contact": {
      page: "contact",
      nav: undefined,
      event: window.loadLanding,
      prevAjax: function () {
        $('#sub-navigation').addClass("hidden");
        $("#page-wrapper").css('height', "inherit").removeClass('no-min-height');
        $("#container").css('margin-top', "50px");
        loadingWrapper.addClass("hidden");
      },
      nextAjax: undefined
    },
    "landing": {
      page: "landing",
      nav: undefined,
      event: window.loadLanding,
      prevAjax: function () {
        $('#sub-navigation').addClass("hidden");
        $("#page-wrapper").css('height', "inherit").removeClass('no-min-height');
        $("#container").css('margin-top', "50px");
        loadingWrapper.addClass("hidden");
      },
      nextAjax: undefined
    },
    // "landingcity": {
    //   page: "landingcity",
    //   nav: undefined,
    //   event: window.loadLandingCity,
    //   prevAjax: function () {
    //     $('#sub-navigation').addClass("hidden");
    //     $("#page-wrapper").css('height', "inherit").removeClass('no-min-height');
    //     $("#container").css('margin-top', "50px");
    //     loadingWrapper.addClass("hidden");
    //   },
    //   nextAjax: function () {
    //     $(window).scrollTop(0);
    //     window.scrollTo(0, 0);
    //     loadingWrapper.addClass("hidden");
    //   }
    // },
    "framework": {
      page: "framework",
      nav: "graphs",
      event: window.loadFramework,
      prevAjax: function () {
        $("#page-wrapper").css('height', "inherit").removeClass('no-min-height');
        $('#sub-navigation').removeClass("hidden");
        $("#container").css('margin-top', "78px");
      },
      nextAjax: function () {
        $(window).scrollTop(0);
        window.scrollTo(0, 0);
        // window.scrollBy(0,0);
        loadingWrapper.addClass("hidden");
      }
    },
    "traded": { //activity
      page: "traded",
      nav: "graphs",
      event: window.loadTraded,
      prevAjax: function () {
        $("#page-wrapper").css('height', "inherit").removeClass('no-min-height');
        $('#sub-navigation').removeClass("hidden");
        $("#container").css('margin-top', "78px");
      },
      nextAjax: function () {
        $(window).scrollTop(0);
        window.scrollTo(0, 0);
        // window.scrollBy(0,0);
        loadingWrapper.addClass("hidden");
      }
    },
    "trends": {
      page: "trends",
      nav: "graphs",
      event: window.loadTrends,
      prevAjax: function () {
        $("#page-wrapper").css('height', "inherit").removeClass('no-min-height');
        $('#sub-navigation').removeClass("hidden");
        $("#container").css('margin-top', "78px");
      },
      nextAjax: function () {
        $(window).scrollTop(0);
        window.scrollTo(0, 0);
        loadingWrapper.addClass("hidden");
      }
    },
    "local": {
      page: "local",
      nav: "graphs",
      event: window.loadLocal,
      prevAjax: function () {
        $("#page-wrapper").css('height', "inherit").removeClass('no-min-height');
        $('#sub-navigation').removeClass("hidden");
        $("#container").css('margin-top', "78px");
      },
      nextAjax: function () {
        $(window).scrollTop(0);
        window.scrollTo(0, 0);
        loadingWrapper.addClass("hidden");
      }
    },
    "swot": {
      page: "swot",
      nav: "graphs",
      event: window.loadSwot,
      prevAjax: function () {
        $("#page-wrapper").css('height', "inherit").removeClass('no-min-height');
        $('#sub-navigation').removeClass("hidden");
        $("#container").css('margin-top', "78px");
      },
      nextAjax: function () {
        $(window).scrollTop(0);
        window.scrollTo(0, 0);
        loadingWrapper.addClass("hidden");
      }
    },
    "network": {
      page: "network",
      nav: "graphs",
      event: window.loadNetwork,
      prevAjax: function () {
        $('#sub-navigation').removeClass("hidden");
        $("#container").css('margin-top', "78px");
      },
      nextAjax: function () {
        $(window).scrollTop(0);
        window.scrollTo(0, 0);
        loadingWrapper.addClass("hidden");
      }
    },
    "framework": {
      page: "framework",
      nav: "graphs",
      event: window.loadFramework,
      prevAjax: function () {
        $('#sub-navigation').removeClass("hidden");
        $("#container").css('margin-top', "78px");
      },
      nextAjax: function () {
        $(window).scrollTop(0);
        window.scrollTo(0, 0);
        loadingWrapper.addClass("hidden");
      }
    }
  };

  // if (events[page].nav === "graphs" && initLoading) {
  // $('#navigation .link-to').removeClass('link-to-active');
  // $('#navigation .link-to-' + events[page].nav).addClass('link-to-active');

  // d3.select("#sub-navigation-wrapper").selectAll("*").remove();
  // $('#sub-navigation-wrapper').empty().load("graphs_nav.html", function (d) {
  // $('#sub-navigation-wrapper .link-to').removeClass('link-to-active');
  // $('#sub-navigation-wrapper .link-to-' + page).addClass('link-to-active');
  $('#sub-navigation-wrapper .link-to').off().on("click", function (event) {
    event.stopPropagation();
    event.preventDefault();
    let linkTo = $(this).data('link-to');
    if (linkTo === "nolink") {
      return;
    }
    $('#sub-navigation-wrapper .link-to').removeClass('link-to-active');
    $('#sub-navigation-wrapper .link-to-' + linkTo).addClass('link-to-active');
    loadPage({
      page: linkTo
    });
  });
  resize(false);
  // });
  // }

  window.loadPage = function loadPage(obj, initLoading) {
    var page = obj.page || getParameterByName('page', window.location.search) || "landing";
    window.vibrant.city = getParameterByName('city', window.location.search) || window.vibrant.city;// || 'Austin';
    if (page === "nolink") {
      return;
    }
    loadingWrapper.removeClass("hidden");

    page = page.replace("#", "").replace(/[^a-zA-Z]+/g, '');
    if (!events[page]) {
      window.open(window.location.origin + "?page=", '_self');
      return;
    }

    if (page === "landing" || page === "network") {
      window.vibrant.city = '';
    } else{
      window.vibrant.city = 'Meridian';
    }

    if (page) {
      window.history.pushState({
        "page": page,
        "city": window.vibrant.city
      }, page, "?page=" + page+"&city="+window.vibrant.city);
    } else {
      return;
    }

    // console.log(initLoading);

    $('#navigation .link-to').removeClass('link-to-active');
    $('#navigation .link-to-' + events[page].nav).addClass('link-to-active');
    $('#sub-navigation-wrapper .link-to').removeClass('link-to-active');
    $('#sub-navigation-wrapper .link-to-' + page).addClass('link-to-active');
    if (initLoading) {
      resize(false);
    }

    // if (page === "landingcity") {
    //   $(document).ready(() => {
    //     $('#page-wrapper').empty().load("landingcity-" + window.vibrant.city.toLowerCase() + ".html", function (d) {
    //       var activeCity = window.vibrant.city || 'Austin';

    //       $("#network-wrapper iframe").width($("#landingcity").width());

    //       _loadTraded(activeCity);

    //       function _loadTraded(activeCity) {
    //         new BubbleLegend({
    //           element: d3.select('#traded-bubble-legend div'), //.node(),
    //           class: "traded-bubble-legend-tooltip"
    //         });

    //         build(activeCity);

    //         function build(activeCity) {
    //           d3.queue(2)
    //             // .defer(d3.csv, `./data/${activeCity}_Table.csv`)
    //             .defer(d3.csv, `./data/${activeCity}_Master_Traded.csv`)
    //             .defer(d3.csv, `./data/color_legend2.csv`) //linked to color_legend2 to show you the issue
    //             .await(function ready(error, master, colors) {
    //               if (error) throw error;

    //               buildBubble(master, colors);
    //               // buildTable(master);
    //             });
    //         }

    //         function buildBubble(data, colors) {
    //           const chart = new TradedBubble({
    //             element: d3.select('#traded-bubble-wrapper'), //document.querySelector('#traded-bubble-wrapper'),
    //             data: data,
    //             colors: colors
    //           });
    //         }
    //       }
    //       if ($.isFunction(events[page].nextAjax)) {
    //         events[page].nextAjax();
    //       }
    //     });
    //   });
    //   return;
    // }

    // d3.select("#page-wrapper").selectAll("*").remove();
    $('#page-wrapper').empty().load(events[page].page + ".html", function (d) { //.replace(/[^0-9#]+/g, '');

      // if ($.isFunction(events[page].callback)) {
      //   events[page].callback();
      // }

      if ($.isFunction(events[page].prevAjax)) {
        events[page].prevAjax();
      }
      if ($.isFunction(events[page].event)) {
        events[page].event(events[page].nextAjax);
      }

      // resize(false);
    });
    if (detectIE()) {
      alert("For best viewing experience, please use a modern browser");
    }
  };



  function resize(init) {
    // $("#footer").removeClass('footer-fixed').addClass('footer-relative');
    const otherHeight = $("#header").height(); // + $("#sub-navigation-wrapper").height();// + $("#footer").height()
    const height = $(window).height() - otherHeight + "px";
    // console.log($("#header").height(), $("#sub-navigation-wrapper").height(), $("#header").height());
    $("#container").css('margin-top', otherHeight);
    $("#page-wrapper").css('min-height', height).css('height', "inherit");
    $(".information-tooltip").css('left', 0).css('top', 0);
  }
  $(window).on('resize', resize);

});