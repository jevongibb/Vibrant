;
(function (d3, $, window) {
  'use strict';

  if (!window.vibrant) {
    window.vibrant = {};
  }

  window.loadLocal = function loadLocal(callback) {
    run(undefined, callback);
  }

  class BubbleChart {
    constructor(opts) {
      this.data = opts.data;
      this.element = opts.element;
      this.color = d3.scaleOrdinal(d3['schemeCategory20']); //.range(["#a6761d", "#666666", "#377eb8", "#984ea3", "#73c000", "#ff7f00", "#e31a1c", "#e6ab02"]);
      this.draw();
    }


    draw() {
      // define width, height and margin
      this.width = this.element.offsetWidth || 400;
      this.height = this.element.offsetHeight || 400;
      this.margin = {
        top: 30,
        right: 50,
        bottom: 70,
        left: 50
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
        .attr('class', 'item local-bubble-tooltip')
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
      var x = d3.scaleBand()
        .range([0, this.width])
        .padding(0.1);
      var y = d3.scaleLinear()
        .range([0, this.height]);
      var radius = d3.scaleLinear().range([5, 25]).domain(d3.extent(data, (d) => +d["Relative Size (RS)"]));

      // Scale the range of the data in the domains
      x.domain(data.map((d) => d["Industry"]));

      y.domain([d3.min(data, (d) => -d["Relative Size (RS)"]), d3.max(data, (d) => -d["Relative Size (RS)"])]);

      this.container.append("line")
        .style("stroke", "#000")
        .style("stroke-width", "2px")
        .attr("x1", 0)
        .attr("x2", this.width)
        .attr("y1", y(-1))
        .attr("y2", y(-1));

      this.container.append("text")
        .attr("x", this.width + 5)
        .attr("y", y(-1) + 4)
        .text("RS = 1");

      // // add the x Axis
      // this.container.append("g")
      //   .attr("transform", "translate(0," + this.height + ")")
      //   .call(d3.axisBottom(x));

      // // add the y Axis
      // this.container.append("g")
      //   .call(d3.axisLeft(y));

      // append the rectangles for the bar chart
      // this.container.selectAll(".bar")
      //   .data(data)
      //   .enter().append("rect")
      //   .attr("class", "bar")
      //   // .attr("x", function (d) {
      //   //   return x(d["Relative Size (RS)"]person);
      //   // })
      //   // .attr("width", x.bandwidth())
      //   // .attr("y", function (d) {
      //   //   return y(d["Relative Size (RS)"]);
      //   // })
      //   // .attr("height", (d) => this.height - y(d["Relative Size (RS)"]));
      //   .attr("y", (d) => y(Math.min(0, -d["Relative Size (RS)"])))
      //   // .attr("y", (d) => y(Math.min(0, d["Relative Size (RS)"])))
      //   .attr("x", (d) => x(d["Relative Size (RS)"]person))
      //   .attr("height", (d) => Math.abs(y(d["Relative Size (RS)"])-y(0)))
      //   .attr("width", x.bandwidth());
      let padding = this.padding;

      this.container.selectAll(".bubble")
        .data(data)
        .enter().append("circle")
        .attr("class", "bubble")
        .style("stroke", "#000")
        .style("stroke-width", "0")
        .style('fill', (d, i) => this.color(i))
        .attr("cy", (d) => d["Relative Size (RS)"] > 0 ? y(Math.min(0, -d["Relative Size (RS)"])) : (y(Math.min(0, -d["Relative Size (RS)"])) + Math.abs(y(d["Relative Size (RS)"]) - y(0))))
        // .attr("y", (d) => y(Math.min(0, d["Relative Size (RS)"])))
        .attr("cx", (d) => x(d["Industry"]) + x.bandwidth() / 2)
        // .attr("height", (d) => Math.abs(y(d["Relative Size (RS)"])-y(0)))
        // .attr("width", x.bandwidth())
        .attr("r", (d, i) => radius(d["Relative Size (RS)"]))
        .style("cursor", "pointer")
        .on("mouseover", (d) => {
          tooltip.html(`<p>${d["Industry"]}</p><p>Relative Size: ${d["Relative Size (RS)"]}</p><p>Employees: ${d["Employees"]}</p>`);
          tooltip.style("visibility", "visible");
        })
        .on("mousemove", function (d) {
          // var coords = d3.mouse(this);
          var top = d["Relative Size (RS)"] > 0 ? y(Math.min(0, -d["Relative Size (RS)"])) : (y(Math.min(0, -d["Relative Size (RS)"])) + Math.abs(y(d["Relative Size (RS)"]) - y(0)))// || (d3.event.pageY - padding.top)
          tooltip.style("top", (top) + "px").style("left", ((d3.event.pageX - padding.left) + 10) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"))

      // https://bl.ocks.org/HarryStevens/54d01f118bc8d1f2c4ccd98235f33848
      // function redraw(classes){
      //   // transition
      //   var t = d3.transition()
      //       .duration(750);
      //   // hierarchy
      //   var h = d3.hierarchy({children: classes})
      //       .sum(function(d) { return d.size; })
      //   //JOIN
      //   var circle = svg.selectAll("circle")
      //       .data(pack(h).leaves(), function(d){ return d.data.name; });
      //   var text = svg.selectAll("text")
      //       .data(pack(h).leaves(), function(d){ return d.data.name; });
      //   //EXIT
      //   circle.exit()
      //       .style("fill", "#b26745")
      //     .transition(t)
      //       .attr("r", 1e-6)
      //       .remove();
      //   text.exit()
      //     .transition(t)
      //       .attr("opacity", 1e-6)
      //       .remove();
      //   //UPDATE
      //   circle
      //     .transition(t)
      //       .style("fill", "#3a403d")
      //       .attr("r", function(d){ return d.r })
      //       .attr("cx", function(d){ return d.x; })
      //       .attr("cy", function(d){ return d.y; })
      //   text
      //     .transition(t)
      //       .attr("x", function(d){ return d.x; })
      //       .attr("y", function(d){ return d.y; });
      //   //ENTER
      //   circle.enter().append("circle")
      //       .attr("r", 1e-6)
      //       .attr("cx", function(d){ return d.x; })
      //       .attr("cy", function(d){ return d.y; })
      //       .style("fill", "#fff")
      //     .transition(t)
      //       .style("fill", "#45b29d")
      //       .attr("r", function(d){ return d.r });
      //   text.enter().append("text")
      //       .attr("opacity", 1e-6)
      //       .attr("x", function(d){ return d.x; })
      //       .attr("y", function(d){ return d.y; })
      //       .text(function(d){ return d.data.name; })
      //     .transition(t)
      //       .attr("opacity", 1);
      // }
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


    function buildTable(data) {
      var sortAscending = true;
      var element = d3.select('#local-table-wrapper');
      element.selectAll("*").remove();

      // local-table-wrapper
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
              rows.sort((a, b) => +((a[d]+"").replace(/[^0-9]+/g, '')) - +((b[d]+"").replace(/[^0-9]+/g, '')));
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
              rows.sort((a, b) => +((b[d]+"").replace(/[^0-9]+/g, '')) - +((a[d]+"").replace(/[^0-9]+/g, '')));
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


    function buildBubble(data) {
      const chart = new BubbleChart({
        element: document.querySelector('#local-bubble-wrapper'),
        data: data
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

        master.map((d,i) => {
          data.push({
            "Industry": d["Label"],
            "Distance from Average": 0,
            "Employees": tableByNaics[d.naics] ? +tableByNaics[d.naics]["Employees"] : "",
            "Relative Size (RS)": tableByNaics[d.naics] ? +tableByNaics[d.naics]["Relative Size (RS)"] : (""+i),
            "Local Trend": d["Pct_Total"],
            "Nat’l Trend": d["Natl_Trend"]
          });
        })
        // console.log(masterByNaics, tableByNaics);

        //Industry)"]}</p><p>Relative Size: ${d["Relative Size (RS)"]}</p><p>Employees: ${d["Employees"
        data.sort((a, b) => +b['Employees'] - +a['Employees']);
        buildTable(data);

        data.sort((a, b) => +b['Relative Size (RS)'] - +a['Relative Size (RS)']);
        var bubble = data.splice(0,10).concat(data.splice(data.length-10,data.length));
        // console.log(bubble);
//         // my data
//         var bubble = `salesperson,sales
// Bob,33
// Robin,12
// Anne,41
// Mark,16
// Joe,59
// Eve,38
// Karen,21
// Kirsty,25
// Chris,30
// Lisa,47
// Tom,5
// Stacy,20
// Charles,13
// Mary,29`;
//         bubble = d3.csvParse(bubble);
//         // bubble = bubble.splice(0,13);
//         bubble.forEach(function (d) {
//           d["Relative Size (RS)"] = +d["Relative Size (RS)"] - 15;
//         });
//         bubble.sort((a, b) => b["Relative Size (RS)"] - a["Relative Size (RS)"]);
        // bubble.push({
        //   "Industry": "",
        //   "Relative Size (RS)": 0,
        //   "Employees": 0
        // });
        buildBubble(bubble);

      }
    }



    if ($.isFunction(callback)) {
      callback();
    }
    // $("#loading-wrapper").addClass("hidden");
  }

})(d3, $, window);