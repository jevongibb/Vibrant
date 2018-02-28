$(function () {
  'use strict';


  if (!window.vibrant) {
    window.vibrant = {};
  }

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

  var events = {
    // "graphs": {
    //   page: "graphs",
    //   nav: "graphs",
    //   event: window.loadGraph
    // },
    // "blog": {},
    // "contact": {},
    "landing": {
      page: "landing",
      nav: undefined,
      event: window.loadLanding,
      prevAjax: function() {
        $('#sub-navigation').addClass("hidden");
        $("#page-wrapper").css('height', "inherit").removeClass('no-min-height');
        $("#container").css('margin-top', "50px");
        loadingWrapper.addClass("hidden");
      },
      nextAjax: undefined
    },
    "activity": {
      page: "activity",
      nav: "graphs",
      event: window.loadActivity,
      prevAjax: function () {
        $("#page-wrapper").css('height', "inherit").removeClass('no-min-height');
        $('#sub-navigation').removeClass("hidden");
        $("#container").css('margin-top', "78px");
      },
      nextAjax: function () {
        $(window).scrollTop(0); window.scrollTo(0, 0);
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
        $(window).scrollTop(0); window.scrollTo(0, 0);
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
        $(window).scrollTop(0); window.scrollTo(0, 0);
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
        $(window).scrollTop(0); window.scrollTo(0, 0);
        loadingWrapper.addClass("hidden");
      }
    },
    "network": {
      page: "network",
      nav: "graphs",
      event: window.loadNetwork,
      prevAjax: function() {
        $('#sub-navigation').removeClass("hidden");
        $("#container").css('margin-top', "78px");
      },
      nextAjax: function () {
        $(window).scrollTop(0); window.scrollTo(0, 0);
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
    if (page === "nolink") {
      return;
    }
    loadingWrapper.removeClass("hidden");

    page = page.replace("#", "").replace(/[^a-zA-Z]+/g, '');
    if (!events[page]) {
      window.open(window.location.origin + "?page=", '_self');
      return;
    }

    if (page) {
      window.history.pushState({
        "page": page,
      }, page, "?page=" + page);
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

  };



  function resize(init) {
    // $("#footer").removeClass('footer-fixed').addClass('footer-relative');
    const otherHeight = $("#header").height(); // + $("#sub-navigation-wrapper").height();// + $("#footer").height()
    const height = $(window).height() - otherHeight + "px";
    // console.log($("#header").height(), $("#sub-navigation-wrapper").height(), $("#header").height());
    $("#container").css('margin-top', otherHeight);
    $("#page-wrapper").css('min-height', height).css('height', "inherit");
  }
  $(window).on('resize', resize);

});