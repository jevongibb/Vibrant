;
(function (d3, $, window) {
  'use strict';

  if (!window.vibrant) {
    window.vibrant = {};
  }

  window.loadTrends = function loadTrends(callback) {
    run(undefined, callback);
  }

  class BubbleChart {
    constructor(opts) {
      this.data = opts.data;
      this.year = opts.year || "";
      this.element = opts.element;
      this.color = d3.scaleOrdinal(d3['schemeCategory20']); //.range(["#a6761d", "#666666", "#377eb8", "#984ea3", "#73c000", "#ff7f00", "#e31a1c", "#e6ab02"]);
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

      this.tooltip = element
        .append("div")
        .attr('class', 'item trends-bubble-tooltip')
        .style("visibility", "hidden");
      // create the other stuff
      this.createBubbles(this.data);
    }

    setData(newData) {
      this.data = newData;
      // full redraw needed
      this.draw();
    }

    createBubbles(data) {
      let tooltip = this.tooltip;

      // console.log(data);
      // set the ranges
      var x = d3.scaleLinear()
        .range([0, this.width])
      var y = d3.scaleLinear()
        .range([this.height, 0]);
      var radius = d3.scaleLinear().range([2, 18]).domain(d3.extent(data, (d) => +d["Relative Size (RS)"]));
      // Scale the range of the data in the domains
      const minX = d3.min(data, (d) => d["National Trend"]);
      const maxX = d3.max(data, (d) => d["National Trend"]);
      const absMaxX = Math.max(Math.abs(minX), Math.abs(maxX))
      x.domain([-absMaxX, +absMaxX]);

      const minY = d3.min(data, (d) => d["Local Trend"]);
      const maxY = d3.max(data, (d) => d["Local Trend"]);
      const absMaxY = Math.max(Math.abs(minY), Math.abs(maxY))
      y.domain([-absMaxY, +absMaxY]);

      const absMin = Math.min(absMaxY, absMaxX);

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
        .text("Local Trend");

      this.container.append("text")
        .attr('class', 'label-axis label-x-axis')
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${(this.width/2)},${(this.height-(-this.margin.bottom+15))})`)
        .text("National Trend");

      var label = this.container.append("text")
        .attr("class", "year label")
        .attr("text-anchor", "end")
        .attr("y", this.height - 5)
        .attr("x", this.width - 5)
        .text(this.year);

      // let trendsWrapperPadding = d3.select("#trends-container").node().getBoundingClientRect();
      let padding = this.padding;//element.node().getBoundingClientRect();
      // console.log(padding);
      // if(padding && padding.top<0){
      //   padding.top=Math.abs(padding.top);
      // }
      this.container.selectAll(".bubble")
        .data(data)
        .enter().append("circle")
        .attr("class", "bubble")
        .style("stroke", "#000")
        .style("stroke-width", "0")
        .style('fill', (d, i) => this.color(i))
        .attr("cy", (d) => y(d["Local Trend"]))
        .attr("cx", (d) => x(d["National Trend"]))
        .attr("r", (d) => radius(d["Relative Size (RS)"]))
        .style("cursor", "pointer")
        .on("mouseover", (d) => {
          tooltip.html(`<p>${d.Industry}</p><p>Relative Size: ${d["Relative Size (RS)"]}</p><p>Local Trend: ${d["Local Trend"]}</p><p>National Trend: ${d["National Trend"]}</p>`);
          tooltip.style("visibility", "visible");
        })
        .on("mousemove", function (d) {
          // var coords = d3.mouse(this);
          // console.log(padding);/ -  - Math.abs(padding.top)
          // ((coords[1] - Math.abs(padding.top))
          tooltip.style("top", (y(d["Local Trend"])) + "px").style("left", ((d3.event.pageX - padding.left) + 10) + "px");
          // tooltip.style("top", ((d3.event.pageY-Math.abs(padding.top)) - 10) + "px").style("left", ((d3.event.pageX - padding.left) + 10) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"))


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

    function buildTable(data) {
      var sortAscending = true;
      var element = d3.select('#trends-table-wrapper');
      element.selectAll("*").remove();

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
            } else {
              rows.sort((a, b) => +(a[d].replace(/[^0-9]+/g, '')) - +(b[d].replace(/[^0-9]+/g, '')));
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
            } else {
              rows.sort((a, b) => +(b[d].replace(/[^0-9]+/g, '')) - +(a[d].replace(/[^0-9]+/g, '')));
            }
            sortAscending = true;
            this.className = 'des';
          }
          table.selectAll('tr').style("background", (d, i) => i % 2 ? "#eee" : "#fff");

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


    function buildBubble(data, year) {
      const chart = new BubbleChart({
        element: d3.select('#trends-bubble-wrapper').node(),//document.querySelector('#trends-bubble-wrapper'),
        data: data,
        year: year
      });
      $(window).on('resize', () => chart.draw());
    }

    function build(activeData) {
      d3.queue(2)
        .defer(d3.csv, `./data/${activeData}_Table.csv`)
        .defer(d3.csv, `./data/${activeData}_Master_Traded.csv`)
        // .defer(d3.csv, `./data/${activeData}_Master_Local.csv`)
        .await(ready);
      //   d3.csv(`./data/${activeData}_SWOT_${type}.csv`, function (error, data) {
      //     if (error) throw error;

      //   });
      function ready(error, table, master) {
        if (error) throw error;
        // console.log(table, master);
        var data = [];
        var bubbleByYear = {};
        var masterByNaics = master
          .reduce(function (acc, cur, i) {
            acc[cur.naics] = cur;
            return acc;
          }, {});
        var tableByNaics = table
          .reduce(function (acc, cur, i) {
            acc[cur.NAICS] = cur;
            return acc;
          }, {});

        const years = d3.keys(master[0]).filter((d) => d.indexOf("L_T_") !== -1).map((year) => {
          year = +year.replace(/[^0-9]+/g, '');
          bubbleByYear[year] = [];
          return year;
        });
        years.sort((a, b) => a - b);
        // console.log(years, bubbleByYear);
        master.sort((a, b) => {
          return (tableByNaics[b.naics] ? +tableByNaics[b.naics]["Employees"] : 0) - (tableByNaics[a.naics] ? +tableByNaics[a.naics]["Employees"] : 0)
        });
        master.map((d,i) => {
          data.push({
            "Industry": d["Label"],
            "Employees": tableByNaics[d.naics] ? tableByNaics[d.naics]["Employees"] : "",
            "Relative Size (RS)": tableByNaics[d.naics] ? tableByNaics[d.naics]["Relative Size (RS)"] : (""+i),
            "Local Trend": d["Local_Trend"],
            "Nat’l Trend": d["Natl_Trend"]
          });
          years.map((year) => {
            // if(bubble.length<50){
            bubbleByYear[year].push({
              "Industry": d["Label"],
              "Local Trend": +d["L_T_" + year] || 0, //+d["Local_Trend"],
              "National Trend": +d["N_T_" + year] || 0, //+d["Natl_Trend"],
              "Relative Size (RS)": tableByNaics[d.naics] ? +tableByNaics[d.naics]["Relative Size (RS)"] : (""+i)//(Math.random() + 1) * 5
            });
            // }
          });
        });
        data.sort((a, b) => +b['Employees'] - +a['Employees']);
        // console.log(masterByNaics, tableByNaics);

        years.map((year) => {
          bubbleByYear[year] = bubbleByYear[year].splice(0, 50);
        });

        $("#trends-time")
          .attr('min', years[0])
          .attr('max', years[years.length - 1])
          .on("input change", function () {
            const year = $(this).val();
            buildBubble(bubbleByYear[year], year);
          });

        buildTable(data);

        buildBubble(bubbleByYear[years[0]], years[0]);

      }
    }



    if ($.isFunction(callback)) {
      callback();
    }
    // $("#loading-wrapper").addClass("hidden");
  }

})(d3, $, window);