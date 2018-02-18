;
(function (d3, $, window) {
  'use strict';

  if (!window.vibrant) {
    window.vibrant = {};
  }

  window.loadTrends = function loadTrends(callback) {
    run(undefined, callback);
  }

  var format = d3.format(',');

  function setNumberFormat(any) {
    return format(+any || 0) || 0;
  }

  function getTextWidth(text, font) { //https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font || '24px "Helvetica Neue"';
    var metrics = context.measureText(text);
    return metrics.width;
  }
  // console.log(getTextWidth("hello there!", "bold 12pt arial"));

  class BubbleChart {
    constructor(opts) {
      // console.log(opts);
      this.data = opts.data;
      this.year = opts.year || "";
      this.datas = opts.datas;
      this.years = opts.years || "";
      this.absMaxX = opts.absMaxX || 0;
      this.absMaxY = opts.absMaxY || 0;
      this.element = opts.element;
      //this.color = d3.range(["#a6761d", "#666666", "#377eb8", "#984ea3", "#73c000", "#ff7f00", "#e31a1c", "#e6ab02"]);
      this.draw();
    }


    draw() {
      // define width, height and margin
      this.width = this.element.offsetWidth || 400;
      this.height = this.element.offsetHeight || 400;
      let min = Math.min(this.width, this.height);
      this.width = min;
      this.height = min;
      this.margin = {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40
      };
      this.width = this.width - (this.margin.left + this.margin.right);
      this.height = this.height - (this.margin.top + this.margin.bottom);
      // set up parent element and SVG
      // this.element.innerHTML = '';
      let element = d3.select(this.element);
      element.selectAll('.item').remove();
      this.padding = element.node().getBoundingClientRect();
      const svg = element.append('svg')
        .attr('class', 'item')
        .attr('width', this.width + (this.margin.left + this.margin.right))
        .attr('height', this.height + (this.margin.top + this.margin.bottom));

      // we'll actually be appending to a <g> element
      this.container = svg.append('g')
        .attr("width", this.width)
        .attr("height", this.height)
        .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

      // this.tooltip = element
      //   .append("div")
      //   .attr('class', 'item trends-bubble-tooltip')
      //   .style("visibility", "hidden");
      // create the other stuff
      this.createBubbles();
    }

    setData(newData) {
      this.data = newData;
      // full redraw needed
      this.draw();
    }

    createBubbles() {
      let maxY = 1.6;
      // let tooltip = this.tooltip;
      let that = this;
      // console.log(data);
      // set the ranges
      var x = d3.scaleLinear()
        .range([0, this.width])
      var y = d3.scaleLinear()
        .range([this.height, 0]);
      var line = d3.line()
        .x((d) => x(d.x))
        .y((d) => {
          if (d.y > maxY) {
            return y(maxY);
          } else if (d.y < -maxY) {
            return y(-maxY);
          } else {
            return y(d.y);
          }
        });
      var radius = d3.scaleLinear().range([2, 18]).domain(d3.extent(that.data, (d) => +d["Relative Size"]));

      // Scale the range of the data in the domains
      // const minX = d3.min(that.data, (d) => d["National Trend"]);
      // const maxX = d3.max(that.data, (d) => d["National Trend"]);
      // const absMaxX = Math.max(Math.abs(minX), Math.abs(maxX))
      x.domain([-this.absMaxX, +this.absMaxX]);
      // const minY = d3.min(that.data, (d) => d["Local Trend"]);
      // const maxY = d3.max(that.data, (d) => d["Local Trend"]);
      // const absMaxY = Math.max(Math.abs(minY), Math.abs(maxY))
      // y.domain([-this.absMaxY, +this.absMaxY]);
      if (this.absMaxY > 1.5) {
        y.domain([-1.6, +1.6])
      } else {
        y.domain([-this.absMaxY, this.absMaxY])
      }

      const absMin = Math.min(this.absMaxY, this.absMaxX);

      // add the x Axis
      this.container.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", `translate(0,${this.height})`)
        // .attr("transform", `translate(0,${y(0) || this.height})`)
        .call(d3.axisBottom(x).tickSize(-this.height));

      // add the y Axis
      this.container.append("g")
        // .attr("transform", `translate(${x(0) || 0},0)`)
        .attr("class", "y-axis axis")
        .call(d3.axisLeft(y).tickSize(-this.width));

      this.container.append("rect")
        .attr('class', 'around')
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", this.height)
        .attr("width", this.width);

      this.container.append("line")
        .attr('class', 'like-axis')
        .attr("x1", 0)
        .attr("x2", this.width)
        .attr("y1", y(0))
        .attr("y2", y(0));
      this.container.append("line")
        .attr('class', 'like-axis')
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y1", 0)
        .attr("y2", this.height);

      // now add titles to the axes
      this.container.append("text")
        .attr('class', 'label-axis label-y-axis')
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${(-this.margin.left+15)},${(this.height/2)})rotate(-90)`)
        .text("Local Trend (% Change in # Employees)");

      this.container.append("text")
        .attr('class', 'label-axis label-x-axis')
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${(this.width/2)},${(this.height-(-this.margin.bottom+15))})`)
        .text("National Trend (% Change in # Employees)");

      if (this.absMaxY > 1.5) {
        this.container.append("text")
          .attr("class", "more-than-y-max")
          .attr("y", 5)
          .attr("x", -22.5)
          .text(">1.5");
        // this.container.append("text")
        //   .attr("class", "less-than-y-min")
        //   .attr("y", this.height+5)
        //   .attr("x", -26)
        //   .text("<-1.5");
        this.container.append("circle")
          .attr('class', 'more-than-y-max')
          .style('fill', '#fff')
          .style('stroke-width', '0')
          .attr("cx", x(0))
          .attr("cy", y(1.52))
          .attr("r", 2);
        this.container.append("line")
          .attr('class', 'more-than-y-max')
          .attr("x1", x(-0.02))
          .attr("x2", x(0.02))
          .attr("y1", y(1.47))
          .attr("y2", y(1.53));
        this.container.append("line")
          .attr('class', 'more-than-y-max')
          .attr("x1", x(-0.02))
          .attr("x2", x(0.02))
          .attr("y1", y(1.51))
          .attr("y2", y(1.57));
        // this.container.append("line")
        //   .attr('class', 'less-than-y-min')
        //   .attr("x1", x(-0.02))
        //   .attr("x2", x(0.02))
        //   .attr("y1", y(-1.53))
        //   .attr("y2", y(-1.47));
      }


      var label = this.container.append("text")
        .attr("class", "year label")
        .attr("y", this.height - 5)
        .attr("x", this.width - 5)
        .text(this.year);

      var description = this.container.append("text")
        .attr("class", "description label")
        .attr("y", -10)
        .attr("x", 0)
        .text("");

      // let trendsWrapperPadding = d3.select("#trends-container").node().getBoundingClientRect();
      let padding = this.padding; //element.node().getBoundingClientRect();
      // console.log(padding);
      // if(padding && padding.top<0){
      //   padding.top=Math.abs(padding.top);
      // }
      var bubble = this.container.selectAll(".bubble")
        .data(that.data)
        .enter().append("circle")
        .attr("class", "bubble")
        .style("stroke", "#000")
        .style("stroke-width", "0")
        .style('fill', (d, i) => d['Color'] || this.color(i))
        .attr("cy", (d) => {
          if (d["Local Trend"] > maxY) {
            return y(maxY);
          } else if (d["Local Trend"] < -maxY) {
            return y(-maxY);
          } else {
            return y(d["Local Trend"]);
          }
        })
        .attr("cx", (d) => x(d["National Trend"]))
        .attr("r", (d) => radius(d["Relative Size"]))
        .style("cursor", "pointer")
        .on("mouseover", function (d) {
          bubble.style('opacity', 1);
          d3.select(this).style('opacity', 1);
          const textWidth = getTextWidth(d['Industry']) || (that.width + 1);
          // console.log(textWidth);
          description.text(textWidth < that.width ? d['Industry'] : d['Industry'].substring(0, 38) + "...");
          // .style("font-size",d['Industry'].length<50 ? "18px" : "16px")
          // .style("font-size", function(d) { 
          //   console.log(width, this.getComputedTextLength());
          //   return Math.min(width/24, this.getComputedTextLength()/24) + "px"; 
          // });

          // animated line - https://bl.ocks.org/shimizu/f7ef798894427a99efe5e173e003260d
          that.container.selectAll('.history').remove();
          let history = [];
          that.years.map((year) => {
            that.datas[year].map((c) => {
              if (d["Industry"] === c["Industry"]) {
                history.push({
                  x: c["National Trend"],
                  y: c["Local Trend"]
                });
              }
            });
          });
          // console.log(history);
          that.container.append("path")
            .data([history])
            .classed("history background-history", true)
            .attr("d", line);

          // "Industry": "Local Trend": "National Trend": "Relative Size":
          var t = d3.transition()
            .duration(1000)
            .ease(d3.easeLinear)
          // .on("start", function(d){ console.log("transiton start") })
          // .on("end", function(d){ console.log("transiton end") });
          // that.container.selectAll(".history").append("path").classed("history-background", true)
          var path = that.container.selectAll(".animated-history")
            .data([history]);
          path.enter().append("path").classed("history animated-history", true)
            .merge(path)
            .attr("d", line)
            // .attr("fill", "none")
            // .attr("stroke", "#333")
            .attr("stroke-dasharray", function (d) {
              return this.getTotalLength()
            })
            .attr("stroke-dashoffset", function (d) {
              return this.getTotalLength()
            })
          that.container.selectAll(".animated-history").transition(t)
            .attr("stroke-dashoffset", 0)
        })
        .on("mouseout", () => {
          description.text("");
          this.container.selectAll('.history').remove();
          bubble.style('opacity', 1);
        });
      // .on("mouseover", (d) => {
      //   tooltip.html(`<p>${d.Industry}</p><p>Relative Size: ${d["Relative Size"]}</p><p>Local Trend: ${d["Local Trend"]}</p><p>National Trend: ${d["National Trend"]}</p>`);
      //   tooltip.style("visibility", "visible");
      // })
      // .on("mousemove", function (d) {
      //   // var coords = d3.mouse(this);
      //   // console.log(padding);/ -  - Math.abs(padding.top)
      //   // ((coords[1] - Math.abs(padding.top))
      //   tooltip.style("top", (y(d["Local Trend"])) + "px").style("left", ((d3.event.pageX - padding.left) + 10) + "px");
      //   // tooltip.style("top", ((d3.event.pageY-Math.abs(padding.top)) - 10) + "px").style("left", ((d3.event.pageX - padding.left) + 10) + "px");
      // })
      // .on("mouseout", () => tooltip.style("visibility", "hidden"))


      this.container.append("line")
        .attr('class', 'like-diagonal')
        .attr("x1", x(-absMin))
        .attr("x2", x(+absMin))
        .attr("y1", y(-absMin))
        .attr("y2", y(+absMin));
    }
  }


  function run(data, callback) {
    var activeData = 'Austin';


    $('.dropdown-visible').off().on('click', function () {
      $('.dropdown-hidden').toggleClass('visibility-visible');
      // $(this).find('.fa').toggleClass('fa-angle-down').toggleClass('fa-angle-up');
    });
    $('.dropdown-item').off().on('click', function () {
      activeData = $(this).data('value');
      $('.dropdown-value').text(activeData);
      $('.dropdown-hidden').toggleClass('visibility-visible');
      build(activeData);
    });


    addBubbleLegend();

    function addBubbleLegend() {
      let activityBubbleLegend = d3.select('#trends-bubble-legend div');
      activityBubbleLegend.selectAll('*').remove();
      // let padding = activityBubbleLegend.node().getBoundingClientRect();
      let tooltip = activityBubbleLegend
        .append("div")
        .attr("class", "trends-bubble-legend-tooltip")
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

    function buildTable(data, bubbleObj) {
      var sortAscending = true;
      var element = d3.select('#trends-table-wrapper');
      element.selectAll("*").remove();

      var searchBar = element.append('div');
      searchBar.append('input')
        .attr('placeholder', 'Search by Industry...')
        .attr('type', 'text')
        .attr('id', 'trends-table-search')
        .on('keyup', function () {
          let text = this.value.trim().toLowerCase();
          let i = 0;
          rows.each(function (d) {
            let el = d3.select(this);
            const isVisible = d["Industry"].toLowerCase().indexOf(text) != -1;
            el.style("background", i % 2 ? "#fff" : "#eee")
              .style("display", isVisible ? "table-row" : "none");
            if (isVisible) {
              i++;
            }
          });
        });

      // trends-table-wrapper
      var table = element.append('table');
      var titles = d3.keys(data[0]);
      var headers = table.append('thead').append('tr')
        .selectAll('th')
        .data(titles).enter()
        .append('th')
        .text((d) => d)
        .on('click', function (d, i) {
          headers.attr('class', 'header');
          if (sortAscending) {
            if (i === 0) {
              // rows.sort(function(a, b) { return b[d] < a[d]; });
              rows.sort((a, b) => { //sort string ascending
                if (a[d] < b[d]) {
                  return -1;
                }
                if (a[d] > b[d]) {
                  return 1;
                }
                return 0; //default return value (no sorting)
              });
              bubbleObj.years.map((year) => {
                bubbleObj.bubbleByYear[year].sort((a, b) => { //sort string ascending
                  if (a[d] < b[d]) {
                    return -1;
                  }
                  if (a[d] > b[d]) {
                    return 1;
                  }
                  return 0; //default return value (no sorting)
                });
              });
            } else {
              rows.sort((a, b) => +(a[d].replace(/[^0-9]+/g, '')) - +(b[d].replace(/[^0-9]+/g, '')));
              bubbleObj.years.map((year) => {
                bubbleObj.bubbleByYear[year].sort((a, b) => +((a[d] + '').replace(/[^0-9]+/g, '')) - +((b[d] + '').replace(/[^0-9]+/g, '')));
              });
            }
            sortAscending = false;
            this.className = 'aes';
          } else {
            if (i === 0) {
              // rows.sort(function(a, b) { return b[d] > a[d]; });
              rows.sort((b, a) => {
                if (a[d] < b[d]) {
                  return -1;
                }
                if (a[d] > b[d]) {
                  return 1;
                }
                return 0; //default return value (no sorting)
              });
              bubbleObj.years.map((year) => {
                bubbleObj.bubbleByYear[year].sort((b, a) => {
                  if (a[d] < b[d]) {
                    return -1;
                  }
                  if (a[d] > b[d]) {
                    return 1;
                  }
                  return 0; //default return value (no sorting)
                });
              });
            } else {
              rows.sort((a, b) => +(b[d].replace(/[^0-9]+/g, '')) - +(a[d].replace(/[^0-9]+/g, '')));
              bubbleObj.years.map((year) => {
                bubbleObj.bubbleByYear[year].sort((a, b) => +((b[d] + '').replace(/[^0-9]+/g, '')) - +((a[d] + '').replace(/[^0-9]+/g, '')));
              });
            }
            sortAscending = true;
            this.className = 'des';
          }
          table.selectAll('tr').style("background", (d, i) => i % 2 ? "#eee" : "#fff");


          var absMaxX = 0;
          var absMaxY = 0;
          bubbleObj.years.map((year) => {
            let bubbleByYearSliced = bubbleObj.bubbleByYear[year].slice(0, 50);
            // let minX = d3.min(bubbleByYear[year], (d) => d["National Trend"]);
            // let maxX = d3.max(bubbleByYear[year], (d) => d["National Trend"]);
            // absMaxX = Math.max(absMaxX, Math.max(Math.abs(minX), Math.abs(maxX)));
            let minY = d3.min(bubbleByYearSliced, (d) => d["Local Trend"]);
            let maxY = d3.max(bubbleByYearSliced, (d) => d["Local Trend"]);
            absMaxY = Math.max(absMaxY, Math.max(Math.abs(minY), Math.abs(maxY)));
          });
          absMaxX = 0.5;
          bubbleObj.absMaxX = absMaxX;
          bubbleObj.absMaxY = absMaxY;
          buildBubble(bubbleObj); // bubbleObj = { bubbleByYear, years, year:selectedYear, yearLabel:selectedYear, absMaxX, absMaxY};
        });

      var rows = table.append('tbody').selectAll('tr')
        .data(data).enter()
        .append('tr')
        .style("background", (d, i) => i % 2 ? "#fff" : "#eee");
      rows.selectAll('td')
        .data(function (d) {
          return titles.map(function (k) {
            return {
              'value': d[k],
              'name': k
            };
          });
        }).enter()
        .append('td')
        .attr('data-th', (d) => d.name)
        .text((d) => d.value);
    }


    build(activeData);


    function buildBubble(bubbleObj) { //bubbleByYear, years, year, yearLabel, absMaxX, absMaxY
      let bubbleByYearSliced = bubbleObj.bubbleByYear[bubbleObj.year].slice(0, 50);
      const chart = new BubbleChart({
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

    function build(activeData) {
      d3.queue(2)
        // .defer(d3.csv, `./data/${activeData}_Table.csv`)
        .defer(d3.csv, `./data/${activeData}_Master_Traded.csv`)
        .defer(d3.csv, `./data/color_legend.csv`)
        .await(ready);
      //   d3.csv(`./data/${activeData}_SWOT_${type}.csv`, function (error, data) {
      //     if (error) throw error;

      //   });
      function ready(error, master, colors) {
        if (error) throw error;
        // console.log(table, master);
        var data = [];
        var bubbleByYear = {};
        var bubbleObj = {};
        var absMaxX = 0;
        var absMaxY = 0;
        var masterByNaics = master
          .reduce(function (acc, cur, i) {
            acc[cur.naics] = cur;
            return acc;
          }, {});
        var colorsByGroup = colors
          .reduce(function (acc, cur, i) {
            acc[cur.Group] = cur;
            return acc;
          }, {});

        let years = d3.keys(master[0]).filter((d) => d.indexOf("L_T_") !== -1).map((year) => {
          year = +year.replace(/[^0-9]+/g, '');
          bubbleByYear[year] = [];
          return year;
        });
        const handleYear = years[years.length - 1] + 1;
        years.push(handleYear);
        bubbleByYear[handleYear] = [];

        years.sort((a, b) => a - b);
        // console.log(years, bubbleByYear);
        master.sort((a, b) => +b['2015'] - +a['2015']);
        master.map((d, i) => {
          data.push({
            "Industry": d["Label"],
            "Employees": setNumberFormat(d["2015"]), //tableByNaics[d.naics] ? tableByNaics[d.naics]["Employees"] : "",
            "Relative Size": (+d["RS_2015"]).toFixed(2), //tableByNaics[d.naics] ? tableByNaics[d.naics]["Relative Size (RS)"] : (""+i),
            "Local Trend": (+d["Local_Trend"] * 100).toFixed(2) + "%",
            "Nat’l Trend": (+d["Natl_Trend"] * 100).toFixed(2) + "%"
          });
          years.map((year) => {
            if (year === handleYear) {
              // console.log(d.naics[0], colorsByGroup);
              bubbleByYear[year].push({
                "Color": colorsByGroup[d.naics[0]].Color || "gray",
                "Industry": d["Label"],
                "Local Trend": +d["Local_Trend"] || 0, //+d["Local_Trend"],
                "National Trend": +d["Natl_Trend"] || 0, //+d["Natl_Trend"],
                "Relative Size": +d["RS_2015"], //tableByNaics[d.naics] ? +tableByNaics[d.naics]["Relative Size"] : (""+i)//(Math.random() + 1) * 5

                "Employees": +d["2015"],
                "Nat’l Trend": +d["Natl_Trend"] || 0,
              });
              return;
            }
            // if(bubble.length<50){
            bubbleByYear[year].push({
              "Color": colorsByGroup[d.naics[0]].Color || "gray",
              "Industry": d["Label"],
              "Local Trend": +d["L_T_" + year] || 0, //+d["Local_Trend"],
              "National Trend": +d["N_T_" + year] || 0, //+d["Natl_Trend"],
              "Relative Size": +d["RS_2015"], //tableByNaics[d.naics] ? +tableByNaics[d.naics]["Relative Size"] : (""+i)//(Math.random() + 1) * 5

              "Employees": +d["2015"],
              "Nat’l Trend": +d["Natl_Trend"] || 0
            });
            // }
          });
        });
        // data.sort((a, b) => +(b['Employees'].replace(/[^0-9]+/g, '')) - +(a['Employees'].replace(/[^0-9]+/g, '')));
        // console.log(masterByNaics, tableByNaics);

        years.map((year) => {
          let bubbleByYearSliced = bubbleByYear[year].slice(0, 50);
          // let minX = d3.min(bubbleByYear[year], (d) => d["National Trend"]);
          // let maxX = d3.max(bubbleByYear[year], (d) => d["National Trend"]);
          // absMaxX = Math.max(absMaxX, Math.max(Math.abs(minX), Math.abs(maxX)));
          let minY = d3.min(bubbleByYearSliced, (d) => d["Local Trend"]);
          let maxY = d3.max(bubbleByYearSliced, (d) => d["Local Trend"]);
          absMaxY = Math.max(absMaxY, Math.max(Math.abs(minY), Math.abs(maxY)));
        });
        absMaxX = 0.5;
        // console.log(absMaxX, absMaxY);

        $("#trends-time")
          .attr('min', years[0])
          .attr('max', years[years.length - 1])
          .on("input change", function () {
            bubbleObj.year = $(this).val();
            bubbleObj.yearLabel = bubbleObj.year == handleYear ? '2020' : bubbleObj.year;
            buildBubble(bubbleObj);
          });

        bubbleObj = {
          bubbleByYear: bubbleByYear,
          years: years,
          year: years[0],
          yearLabel: years[0],
          absMaxX: absMaxX,
          absMaxY: absMaxY
        };

        buildTable(data, bubbleObj);
        buildBubble(bubbleObj);

      }
    }



    if ($.isFunction(callback)) {
      callback();
    }
    // $("#loading-wrapper").addClass("hidden");
  }

})(d3, $, window);