;
(function (d3, $, window) {
  'use strict';

  if (!window.vibrant) {
    window.vibrant = {};
  }

  window.loadLocal = function loadLocal(callback) {
    run(undefined, callback);
  }

  var format = d3.format(',');
  function setNumberFormat(any){
    return format(+any || 0) || 0;
  }

  class BubbleChart {
    constructor(opts) {
      this.data = opts.data;
      this.element = opts.element;
      this.color = range(["#a6761d", "#666666", "#377eb8", "#984ea3", "#73c000", "#ff7f00", "#e31a1c", "#e6ab02"]);
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
      var radius = d3.scaleLinear().range([5, 25]).domain(d3.extent(data, (d) => +d["Relative Size"]));

      // Scale the range of the data in the domains
      x.domain(data.map((d) => d["Industry"]));

      y.domain([d3.min(data, (d) => -d["Relative Size"]), d3.max(data, (d) => -d["Relative Size"])]);

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
      //   //   return x(d["Relative Size"]person);
      //   // })
      //   // .attr("width", x.bandwidth())
      //   // .attr("y", function (d) {
      //   //   return y(d["Relative Size"]);
      //   // })
      //   // .attr("height", (d) => this.height - y(d["Relative Size"]));
      //   .attr("y", (d) => y(Math.min(0, -d["Relative Size"])))
      //   // .attr("y", (d) => y(Math.min(0, d["Relative Size"])))
      //   .attr("x", (d) => x(d["Relative Size"]person))
      //   .attr("height", (d) => Math.abs(y(d["Relative Size"])-y(0)))
      //   .attr("width", x.bandwidth());
      let padding = this.padding;

      this.container.selectAll(".bubble")
        .data(data)
        .enter().append("circle")
        .attr("class", "bubble")
        .style("stroke", "#000")
        .style("stroke-width", "0")
        .style('fill', (d, i) => d['Color'] || this.color(i))
        .attr("cy", (d) => d["Relative Size"] > 0 ? y(Math.min(0, -d["Relative Size"])) : (y(Math.min(0, -d["Relative Size"])) + Math.abs(y(d["Relative Size"]) - y(0))))
        // .attr("y", (d) => y(Math.min(0, d["Relative Size"])))
        .attr("cx", (d) => x(d["Industry"]) + x.bandwidth() / 2)
        // .attr("height", (d) => Math.abs(y(d["Relative Size"])-y(0)))
        // .attr("width", x.bandwidth())
        .attr("r", (d, i) => radius(d["Relative Size"]))
        .style("cursor", "pointer")
        .on("mouseover", (d) => {
          tooltip.html(`<p>${d["Industry"]}</p><p>Relative Size: ${d["Relative Size"]}</p><p>Employees: ${d["Employees"]}</p>`);
          tooltip.style("visibility", "visible");
        })
        .on("mousemove", function (d) {
          // var coords = d3.mouse(this);
          var top = d["Relative Size"] > 0 ? y(Math.min(0, -d["Relative Size"])) : (y(Math.min(0, -d["Relative Size"])) + Math.abs(y(d["Relative Size"]) - y(0)))// || (d3.event.pageY - padding.top)
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

      var searchBar = element.append('div');
        searchBar.append('input')
          .attr('placeholder', 'Search by Industry...')
          .attr('type', 'text')
          .attr('id', 'local-table-search')
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

      // local-table-wrapper
      var table = element.append('table');
      var titles = d3.keys(data[0]).filter((d)=>d!=='Color');
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
        // .defer(d3.csv, `./data/${activeData}_Table.csv`)
        // .defer(d3.csv, `./data/${activeData}_Master_Traded.csv`)
        .defer(d3.csv, `./data/${activeData}_Master_Local.csv`)
        .defer(d3.csv, `./data/color_legend.csv`)
        .await(ready);
      //   d3.csv(`./data/${activeData}_SWOT_${type}.csv`, function (error, data) {
      //     if (error) throw error;

      //   });
      function ready(error, master, colors) {
        if (error) throw error;
        // console.log(table, master);
        var data = [];
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
        master.sort((a, b) => +b['2015'] - +a['2015']);
        master.map((d,i) => {
          data.push({
            "Color":  colorsByGroup[d.naics[0]].Color || "gray",
            "Industry": d["Label"],
            // "Distance from Average": 0,
            "Employees": setNumberFormat(d["2015"]),//tableByNaics[d.naics] ? +tableByNaics[d.naics]["Employees"] : "",
            "Relative Size": (+d["RS_2015"]).toFixed(2),//tableByNaics[d.naics] ? +tableByNaics[d.naics]["Relative Size (RS)"] : "",
            "Local Trend": (+d["Local_Trend"]*100).toFixed(2)+"%",
            "Nat’l Trend": (+d["Natl_Trend"]*100).toFixed(2)+"%"
          });
        })
        // console.log(masterByNaics, tableByNaics);

        //Industry)"]}</p><p>Relative Size: ${d["Relative Size"]}</p><p>Employees: ${d["Employees"
        
        buildTable(data);

        data.sort((a, b) => +b['Relative Size'] - +a['Relative Size']);
        var bubble = data.splice(0,10).concat(data.splice(data.length-10,data.length));

        buildBubble(bubble);

      }
    }



    if ($.isFunction(callback)) {
      callback();
    }
    // $("#loading-wrapper").addClass("hidden");
  }

})(d3, $, window);