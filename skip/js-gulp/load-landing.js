;
(function (d3, $, window) {
  'use strict';

  if (!window.vibrant) {
    window.vibrant = {};
  }

  window.loadLanding = function loadLanding(callback) {
    run(undefined, callback);
  }



  function run(data, callback) {
    window.vibrant.city = '';
    // var activeCity = 'Austin';
    // $(document).ready(() => {
    //   console.log("ready");
    //   $("#landing-content").text("");
    //   $("#landing-content").empty();
    // });
    // d3.select("#landing-content iframe").remove();

    // $(".city-img-wrapper").off().click(function(e){
    //   e.stopPropagation();
    //   e.preventDefault();
    //   window.vibrant.city = $(this).data("city") || 'Austin';
    //   // let html = $(this).data("html");
    //   window.loadPage({
    //     page: 'landingcity'
    //   });
    //   // var el = d3.select("#landing-content");
    //   // el.selectAll("*").remove();
    //   // el.append("iframe")
    //   //   .attr("width", (Math.floor($("#landing-container").width() || $(window).width()) + "px") || "100%")
    //   //   .attr("height", Math.floor($(window).height()*2) + "px")
    //   //   // .style("height", "100%")
    //   //   .on("load", function(){
    //   //     d3.event.stopPropagation();
    //   //     d3.event.preventDefault();
    //   //     let iframe = d3.select(this);
    //   //     // console.log("load", $(iframe.node()).prop('scrollHeight'), iframe.node().contentWindow.document.body.scrollHeight);
    //   //     // $("#landing-content iframe").height(iframe.node().contentWindow.document.body.scrollHeight);
    //   //     iframe.attr("height", iframe.node().contentWindow.document.body.scrollHeight + "px");  
    //   //   })
    //   //   .attr("src", html + ".html");
    // });

    addCitiesImg();

    function addCitiesImg() {
      d3.queue(2)
        .defer(d3.json, `./data/cities.json`)
        .await(function (error, cities) {
          if (error) throw error;
          // console.log(cities);
          let citiesImgWrapper = d3.select("#cities-img-wrapper");
          citiesImgWrapper.selectAll("*").remove();
          cities.map((d) => {
            let cityImgWrapper = citiesImgWrapper.append("div").attr("class", "city-img-wrapper");
            let cityImg = cityImgWrapper.append("div").attr("class", "city-img")
              .on("click", function () {
                $("#landing-content").removeClass("hidden");
                window.vibrant.city = d.city
                // $(".city").text(d.city);
                // $("#summary-text").html();
                // $("#region-def").text(d.regionDef);
                // $("#under-counties-text").text(d.underCountiesText);
                // $("#under-traded-text").text(d.underTradedText);
                // $("#under-trends-text").text(d.underTrendsText);
                // $("#under-network-text").text(d.underNetworkText);
                // $("#above-local-text").text(d.aboveLocalText);
                // $("#under-local-text").text(d.underLocalText);
                // $("#under-swot-text").text(d.underSWOTText);
                // d3.select("#counties-img").attr("src", `./img/Counties_${d.city}.gif`);
                let page = 'landing';
                window.history.pushState({
                  "page": page,
                  "city": window.vibrant.city
                }, page, "?page=" + page+"&city="+window.vibrant.city);
                loadContent(window.vibrant.city);
              });
            cityImg.append("img").attr("src", `./img/${d.city.toLowerCase()}.jpg`);
            cityImg.append("p").text(`${d.city}, ${d.state}`);
          });

          if(window.vibrant.city) {
            let page = 'landing';
            loadContent(window.vibrant.city);
          }
        });
    }


    function loadContent(activeCity) {
      $('#landing-content').empty().load("landingcity-" + activeCity.toLowerCase() + ".html", function (d) {
        // $("#network-wrapper iframe").width($("#landingcity").width());

        // _loadTraded(activeCity);

        // function _loadTraded(activeCity) {
        //   new BubbleLegend({
        //     element: d3.select('#traded-bubble-legend div'), //.node(),
        //     class: "traded-bubble-legend-tooltip"
        //   });

        //   build(activeCity);

        //   function build(activeCity) {
        //     d3.queue(2)
        //       // .defer(d3.csv, `./data/${activeCity}_Table.csv`)
        //       .defer(d3.csv, `./data/${activeCity}_Master_Traded.csv`)
        //       .defer(d3.csv, `./data/color_legend2.csv`) //linked to color_legend2 to show you the issue
        //       .await(function ready(error, master, colors) {
        //         if (error) throw error;

        //         buildBubble(master, colors);
        //         // buildTable(master);
        //       });
        //   }

        //   function buildBubble(data, colors) {
        //     const chart = new TradedBubble({
        //       element: d3.select('#traded-bubble-wrapper'), //document.querySelector('#traded-bubble-wrapper'),
        //       data: data,
        //       colors: colors
        //     });
        //   }
        // }

        _loadTraded(activeCity);
        _loadNetworks(activeCity);
      });
      // _loadTraded(activeCity);
      // // _loadTrends(activeCity);
      // // _loadLocal(activeCity);
      // // _loadSwot(activeCity);
      // // setTimeout(()=>{
      // _loadNetworks(activeCity);
      // // }, 1000);
    }

    function _loadTraded(activeCity) {
      new BubbleLegend({
        element: d3.select('#traded-bubble-legend div'), //.node(),
        class: "traded-bubble-legend-tooltip"
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
            // buildTable(master);
          });
      }


      //Traded: NAICS=naics, Description=Label, Employees=2015, Relative Size=RS_2015, % Total=Pct_Total.
      // function buildTable(data) {
      //   const table = new TradedTable({
      //     element: d3.select('#traded-table-wrapper'),
      //     data: data,
      //     count: 25
      //   });
      // }



      function buildBubble(data, colors) {
        const chart = new TradedBubble({
          element: d3.select('#traded-bubble-wrapper'), //document.querySelector('#traded-bubble-wrapper'),
          data: data,
          colors: colors
        });
      }
    }

    function _loadTrends(activeCity) {
      new BubbleLegend({
        element: d3.select('#trends-bubble-legend div'), //.node(),
        class: "trends-bubble-legend-tooltip"
      });


      function buildTable(data, colors) {
        const table = new TrendsTable({
          element: d3.select('#trends-table-wrapper'),
          data: data,
          colors: colors,
          count: 25,
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
    }

    function _loadNetworks(activeCity) {
      $('#local-view').off().on('click', function () {
        build(activeCity);
      });
      $('#national-view').off().on('click', function () {
        build("national");
      });

      new BubbleLegend({
        element: d3.select('#network-bubble-legend div'), //.node(),
        class: "network-bubble-legend-tooltip"
      });
      const otherHeight = $("#header").outerHeight(true) + $("#footer").outerHeight(true);
      const height = $(window).height() - otherHeight;
      // $("#page-wrapper").addClass('no-min-height').css('height', height);

      build(activeCity);

      function build(activeCity) {
        var el = d3.select("#network-wrapper");
        el.selectAll("*").remove();
        var w = $(window);
        el.append("iframe")
          .attr("width", Math.floor($("#landing-container").width() || $(window).width()) || "100%")
          .attr("height", Math.floor(height) + "px")
          .attr("src", activeCity.toLowerCase() + ".html");
      }
    }

    function _loadLocal(activeCity) {
      new BubbleLegend({
        element: d3.select('#local-bubble-legend div'), //.node(),
        class: "local-bubble-legend-tooltip"
      });


      function buildTable(data, colors) {
        const table = new LocalTable({
          element: d3.select('#local-table-wrapper'),
          data: data,
          colors: colors,
          count: 25
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
    }

    function _loadSwot(activeCity) {
      build(activeCity);

      function build(activeCity) {
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
    }


    if ($.isFunction(callback)) {
      callback();
    }
  }

})(d3, $, window);