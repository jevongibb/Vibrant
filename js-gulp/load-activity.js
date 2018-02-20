;
(function (d3, $, window) {
  'use strict';

  if (!window.vibrant) {
    window.vibrant = {};
  }

  window.loadActivity = function loadActivity(callback) {
    run(undefined, callback);
  }

  var format = d3.format(',');
  function setNumberFormat(any){
    return format(+any || 0) || 0;
  }
  
  Array.prototype.contains = function (v) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] === v) return true;
    }
    return false;
  };

  class BubbleChart {
    constructor(opts) {
      this.data = opts.data;
      this.element = opts.element;
      this.color = d3.scaleOrdinal().range(["#a6761d", "#666666", "#377eb8", "#984ea3", "#73c000", "#ff7f00", "#e31a1c", "#e6ab02"]);
      this.draw();
    }


    draw() {
      // define width, height and margin
      this.width = this.element.offsetWidth || 400;
      this.height = this.element.offsetHeight || 400;
      this.margin = {
        top: 0,
        right: 10,
        bottom: 0,
        left: 0
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
        .attr('class', 'item activity-bubble-tooltip')
        .style("visibility", "hidden");
      // create the other stuff
      this.createBubbles(this.data);
    }

    setData(newData) {
      this.data = newData;
      // full redraw needed
      this.draw();
    }
    //testing - https://bl.ocks.org/steveharoz/8c3e2524079a8c440df60c1ab72b5d03
    createBubbles(data) {//https://bl.ocks.org/HarryStevens/f636199a46fc4b210fbca3b1dc4ef372
      var that = this;
      var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id((d) => d.index))
        .force("collide", d3.forceCollide((d) => d.radius + 1).iterations(12))
        // // .force("charge", d3.forceManyBody().strength(-1000))
        // // .force("link", d3.forceLink(links).distance(200))
        .force("charge", d3.forceManyBody().strength(-1)) //.strength(1)
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
        .force("y", d3.forceY(0))
        .force("x", d3.forceX(0));
        // .force("forceX", d3.forceX().strength(.1).x(this.width * .5))
        // .force("forceY", d3.forceY().strength(.1).y(this.height * .5));

      var link = this.container.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke", "transparent")



      var node = this.container.append("g")
        .attr("class", "nodes")
        .selectAll(".node")
        .data(data.nodes)
        .enter().append("g")
        .attr("class", "node");

      // node.append("title")
      //   .text((d) => d.text);

      let padding = this.padding;
      node.append("circle")
        .attr("r", (d) => d.radius || 0)
        .style("fill", (d) => {
          // d._color = this.color(d.cluster);
          // if(d._color!=d.color){
          //   console.log(d);
          // }
          return this.color(d.cluster) || d.color;
        })
        .style("cursor", "pointer")
        .on("mouseover", (d) => {
          that.tooltip.text(d.text);
          that.tooltip.style("visibility", "visible");
        })
        .on("mousemove", function (d) {
          if(padding.top<=0){
            that.tooltip.style("top", (d.y) + "px").style("left", ((d3.event.pageX - padding.left) + 10) + "px");
          } else {
            that.tooltip.style("top", ((d3.event.pageY - padding.top) - 10) + "px").style("left", ((d3.event.pageX - padding.left) + 10) + "px");
          }
        })
        .on("mouseout", () => that.tooltip.style("visibility", "hidden"))
        .call(d3.drag()
          .on("start", (d) => {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            that.tooltip.style("visibility", "hidden");
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (d) => {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
          })
          .on("end", (d) => {
            if (!d3.event.active) simulation.alphaTarget(0);
            that.tooltip.style("visibility", "visible");
            d.fx = null;
            d.fy = null;
          }));
      
      node.append("text")
        .attr("class","first-row")
        .attr("dy", ".3em")
        .style("fill", "white")
        .style("text-anchor", "middle")
        .style("cursor", "default")
        .style("pointer-events", "none")
        // .text((d) => d.text)
        // .call(wrap, 50)
        // .each(function(d,i){
        //   wrap(d3.select(this), d.radius);
        // });
        // .style("font-size", function(d) { return Math.min(2 * d.radius, (2 * d.radius - 8) / this.getComputedTextLength() * 24) + "px"; })
        .text((d) => {
          d.secondRow = "";
          let arr = d.text.trim().split(" ");
          if (arr[3] && arr[2] && arr[1] && (arr[0].length + 1 + arr[1].length + 1 + arr[2].length + 1 + arr[3].length) < d.radius / 3) {
            d.isFirstRow = true;
            arr.map((c,i)=>{
              if (i>3) {
                d.secondRow = d.secondRow + " " + c;
              }
            });
            return arr[0] + " " + arr[1] + " " + arr[2] + " " + arr[3];//d.text.substring(0, d.radius / 3);
          }
          if (arr[2] && arr[1] && (arr[0].length + 1 + arr[1].length + 1 + arr[2].length) < d.radius / 3) {
            d.isFirstRow = true;
            arr.map((c,i)=>{
              if (i>2) {
                d.secondRow = d.secondRow + " " + c;
              }
            });
            return arr[0] + " " + arr[1] + " " + arr[2];//d.text.substring(0, d.radius / 3);
          }
          if (arr[1] && (arr[0].length + 1 + arr[1].length) < d.radius / 3) {
            d.isFirstRow = true;
            arr.map((c,i)=>{
              if (i>1) {
                d.secondRow = d.secondRow + " " + c;
              }
            });
            return arr[0] + " " + arr[1];//d.text.substring(0, d.radius / 3);
          }
          if (arr[0].length < d.radius / 3) {
            d.isFirstRow = true;
            arr.map((c,i)=>{
              if (i>1) {
                d.secondRow = d.secondRow + " " + c;
              }
            });
            return arr[0];
          }
          d.isFirstRow = false;
          return "";
        });
      // https://bl.ocks.org/mbostock/1846692
      // .text(function(d) { return d.name; })
      // .style("font-size", function(d) { return Math.min(2 * d.radius, (2 * d.radius - 8) / this.getComputedTextLength() * 24) + "px"; })

      node.append("text")
        .attr("class","second-row")
        .attr("dy", ".3em")
        .style("fill", "white")
        .style("text-anchor", "middle")
        .style("cursor", "default")
        .style("pointer-events", "none")
        .text((d) => {
          let arr = d.secondRow.trim().split(" ");
          // console.log(arr);
          if (arr.length===1 && arr[0]==='') {
            d.isSecondRow = false;
            return "";
          }
          if (d.isFirstRow && arr[2] && arr[1] && (arr[0].length + 1 + arr[1].length + 1 + arr[2].length) < d.radius / 3) {
            d.isSecondRow = true;
            return arr[0] + " " + arr[1] + " " + arr[2];//d.text.substring(0, d.radius / 3);
          }
          if (d.isFirstRow && arr[1] && (arr[0].length + 1 + arr[1].length) < d.radius / 3) {
            d.isSecondRow = true;
            return arr[0] + " " + arr[1];//d.text.substring(0, d.radius / 3);
          }
          if (d.isFirstRow && arr[0].length < d.radius / 3) {
            d.isSecondRow = true;
            return arr[0];
          }
          d.isSecondRow = false;
          return "";
          // let arr = d.text.split(" ");
          // if (arr[0].length > d.radius / 3) {
          //   d.isSecondRow = false;
          //   return "";
          // }
          // d.isSecondRow = true;
          // return d.text.substring(d.radius / 3, 2*d.radius / 3);
        });


      // function wrap (text, width) {//+
      //   // console.log(width);
      //   text.each(function() {
      //     var breakChars = ['/', '&', '-'],
      //       text = d3.select(this),
      //       textContent = text.text(),
      //       spanContent;
      //     breakChars.forEach(char => {
      //       // Add a space after each break char for the function to use to determine line breaks
      //       textContent = textContent.replace(char, char + ' ');
      //     });
      //     var words = textContent.split(/\s+/).reverse(),
      //       word,
      //       line = [],
      //       lineNumber = 0,
      //       lineHeight = 1.1, // ems
      //       x = text.attr('x'),
      //       y = text.attr('y'),
      //       dy = parseFloat(text.attr('dy') || 0),
      //       tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');
      //     while (word = words.pop()) {
      //       line.push(word);
      //       tspan.text(line.join(' '));
      //       if (tspan.node().getComputedTextLength() > width) {
      //         line.pop();
      //         spanContent = line.join(' ');
      //         breakChars.forEach(char => {
      //           // Remove spaces trailing breakChars that were added above
      //           spanContent = spanContent.replace(char + ' ', char);
      //         });
      //         tspan.text(spanContent);
      //         line = [word];
      //         tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
      //       }
      //     }
      //   });
      // }

      // function wrap(text, width) {//-
      //   text.each(function() {
      //     var text = d3.select(this),
      //         words = text.text().split(/\s+/).reverse(),
      //         word,
      //         line = [],
      //         lineNumber = 0,
      //         lineHeight = 1.1, // ems
      //         y = text.attr("y"),
      //         dy = parseFloat(text.attr("dy")),
      //         tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      //     while (word = words.pop()) {
      //       line.push(word);
      //       tspan.text(line.join(" "));
      //       if (tspan.node().getComputedTextLength() > width) {
      //         line.pop();
      //         tspan.text(line.join(" "));
      //         line = [word];
      //         tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      //       }
      //     }
      //   });
      // }

      var ticked = function () {

        // node
        //   // .attr("transform", (d) => {
        //   //   d.x = Math.max(d.radius, Math.min(that.width - d.radius, d.x));
        //   //   d.y = Math.max(d.radius, Math.min(that.height - d.radius, d.y));
        //   //   return `translate(${d.x},${d.y})`;
        //   // }) // not good - jumping
        // .select("circle")
        // // .attr("cx", (d) => d.x)
        // // .attr("cy", (d) => d.y);
        // .attr("cx", (d) => {
        //   // console.log(d.x = Math.max(d.radius, Math.min(that.width - d.radius, d.x)));
        //   return d.x = Math.max(d.radius, Math.min(that.width - d.radius, d.x));
        // })
        // .attr("cy", (d) => {
        //   return d.y = Math.max(d.radius, Math.min(that.height - d.radius, d.y));
        // });

        node.each(function(d){
          let el = d3.select(this);
          d.x = Math.max(d.radius, Math.min(that.width - d.radius, d.x));
          d.y = Math.max(d.radius, Math.min(that.height - d.radius, d.y));
          el.select("circle")
          .attr("cx", d.x)
          .attr("cy", d.y);
          el.select(".first-row")
          .attr("x", d.x)
          .attr("y", d.isSecondRow ? d.y-6 : d.y);
          el.select(".second-row")
          .attr("x", d.x)
          .attr("y", d.isSecondRow ? d.y+6 : d.y);
        });

        // node.select("text")
        // .attr("x", (d) => d.x)
        // .attr("y", (d) => d.y);

        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);
      }

      simulation
        .nodes(data.nodes)
        .on("tick", ticked);

      simulation.force("link")
        .links(data.links);

    }
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
      // buildBubble(activeCity);
      // buildTable(activeCity);
    });

    // or semantic ui
    // $('.activity-ui.dropdown').dropdown({
    //   "set selected": ["Austin"],
    //   onChange: function (value, text, $selectedItem) {
    //     console.log(value);
    //     buildBubble();
    //   },
    // });

    addBubbleLegend();

    function addBubbleLegend() {
      let activityBubbleLegend = d3.select('#activity-bubble-legend div');
      activityBubbleLegend.selectAll('*').remove();
      // let padding = activityBubbleLegend.node().getBoundingClientRect();
      let tooltip = activityBubbleLegend
        .append("div")
        .attr("class", "activity-bubble-legend-tooltip")
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
      d3.queue(2)
        // .defer(d3.csv, `./data/${activeCity}_Table.csv`)
        .defer(d3.csv, `./data/${activeCity}_Master_Traded.csv`)
        .defer(d3.csv, `./data/color_legend.csv`)
        .await(ready);

        function ready(error, master, colors) {
          if (error) throw error;

          buildBubble(master, colors);
          buildTable(master);
        }
    }


    //Activity: NAICS=naics, Description=Label, Employees=2015, Relative Size=RS_2015, % Total=Pct_Total.
    function buildTable(_data) {
      // d3.csv(`./data/${activeCity}_Table.csv`, function (error, data) {
      // d3.csv(`./data/${activeCity}_Master_Traded.csv`, function (error, _data) {
      //   if (error) throw error;

        var data = [];
        
        _data.map((d)=>{
          d["Relative Size (RS)"] = (+d["Relative Size (RS)"]).toFixed(2);
          d["Employees"] = setNumberFormat(d["Employees"]);
          data.push({
            "NAICS":d["naics"],
            "Description":d["Label"],
            "Employees":setNumberFormat(+d["2015"]),
            "Relative Size":(+d["RS_2015"]).toFixed(2),
            "% Total":(+d["Pct_Total"]*100).toFixed(2)+"%"
          });
        });
        
        data.sort((a, b) => +(b['Employees'].replace(/[^-0-9]+/g, '')) - +(a['Employees'].replace(/[^-0-9]+/g, ''))); //descending

        var sortAscending = true;
        var element = d3.select('#activity-table-wrapper');
        element.selectAll("*").remove();


        var searchBar = element.append('div');
        searchBar.append('input')
          .attr('placeholder', 'Search by Description...')
          .attr('type', 'text')
          .attr('id', 'activity-table-search')
          .on('keyup', function () {
            let text = this.value.trim().toLowerCase();
            let i = 0;
            rows.each(function (d) {
              let el = d3.select(this);
              const isVisible = d["Description"].toLowerCase().indexOf(text) != -1;
              el.style("background", i % 2 ? "#fff" : "#eee")
                .style("display", isVisible ? "table-row" : "none");
              if (isVisible) {
                i++;
              }
            });
            //   let _data = data.filter((d)=> d["Description"].indexOf(text) != -1);
            //   console.log(_data);
            // table.append('tbody').selectAll('tr').remove()
            // rows = table.append('tbody').selectAll('tr')
            //   .data(_data).enter()
            //   .append('tr');
            // rows.selectAll('td')
            //   .data(function (d) {
            //     return titles.map(function (k) {
            //       return {
            //         'value': d[k],
            //         'name': k
            //       };
            //     });
            //   }).enter()
            //   .append('td')
            //   .attr('data-th', function (d) {
            //     return d.name;
            //   })
            //   .text(function (d) {
            //     return d.value;
            //   });

          });
        
        
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
              if (i === 1) {
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
                rows.sort((a, b) => +(a[d].replace(/[^-0-9]+/g, '')) - +(b[d].replace(/[^-0-9]+/g, '')));
              }
              sortAscending = false;
              this.className = 'aes';
            } else {
              if (i === 1) {
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
                rows.sort((a, b) => +(b[d].replace(/[^-0-9]+/g, '')) - +(a[d].replace(/[^-0-9]+/g, '')));
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
          .attr('data-th', (d)=> d.name)
          .text((d) => d.value);
      // });
    }

    

    function buildBubble(_data, colors) {
      // this.color = d3.scaleOrdinal().range(["#a6761d", "#666666", "#377eb8", "#984ea3", "#73c000", "#ff7f00", "#e31a1c", "#e6ab02"]); => this.color(d.cluster)
      var colorsByGroup = colors
          .reduce(function (acc, cur, i) {
            acc[cur.Group] = cur;
            return acc;
          }, {});

      var width = $('#activity-bubble-wrapper').width() || 960,
        height = $('#activity-bubble-wrapper').height() || 550,
        padding = 1.5, // separation between same-color nodes
        clusterPadding = 6, // separation between different-color nodes
        maxRadius = 12;

      var data=[];
      _data.map((d)=>{
        data.push({
          text:d["Label"],
          size:+d["2015"],
          group:d["Group"],
        });
      });
      // var color = d3.scale.ordinal()
      //   .range(["#a6761d", "#666666", "#377eb8", "#984ea3", "#73c000", "#ff7f00", "#e31a1c", "#e6ab02"]);


      // d3.text(`./data/${activeCity}_Bubbles.csv`, function (error, text) {
      //   if (error) throw error;
        // var colNames = "text,size,group\n" + text;
        // var data = d3.csvParse(colNames);
        // data.forEach(function (d) {
        //   d.size = +d.size;
        // });


        //unique cluster/group id's
        var cs = [];
        data.forEach(function (d) {
          if (!cs.contains(d.group)) {
            cs.push(d.group);
          }
        });

        var n = data.length, // total number of nodes
          m = cs.length; // number of distinct clusters

        //create clusters and nodes
        var clusters = new Array(m);
        var nodes = [];
        for (var i = 0; i < n; i++) {
          nodes.push(create_nodes(data, i));
        }


        function create_nodes(data, node_counter) {
          var i = cs.indexOf(data[node_counter].group),
            r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
            d = {
              color: colorsByGroup[i].Hex,
              cluster: i,
              index: node_counter,
              radius: data[node_counter].size * .002,
              text: data[node_counter].text,
              x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
              y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
            };
          if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
          return d;
        };

        // console.log(nodes);
        const chart = new BubbleChart({
          element: d3.select('#activity-bubble-wrapper').node(),//document.querySelector('#activity-bubble-wrapper'),
          data: {
            nodes: nodes,
            links: []
          }
        });
        // $(window).on('resize', () => chart.draw()); => need many resources for redrawing


        // Move d to be adjacent to the cluster node.
        function cluster(alpha) {
          return function (d) {
            var cluster = clusters[d.cluster];
            if (cluster === d) return;
            var x = d.x - cluster.x,
              y = d.y - cluster.y,
              l = Math.sqrt(x * x + y * y),
              r = d.radius + cluster.radius;
            if (l != r) {
              l = (l - r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              cluster.x += x;
              cluster.y += y;
            }
          };
        }

        // Resolves collisions between d and all other circles.
        function collide(alpha) {
          var quadtree = d3.geom.quadtree(nodes);
          return function (d) {
            var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
              nx1 = d.x - r,
              nx2 = d.x + r,
              ny1 = d.y - r,
              ny2 = d.y + r;
            quadtree.visit(function (quad, x1, y1, x2, y2) {
              if (quad.point && (quad.point !== d)) {
                var x = d.x - quad.point.x,
                  y = d.y - quad.point.y,
                  l = Math.sqrt(x * x + y * y),
                  r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
                if (l < r) {
                  l = (l - r) / l * alpha;
                  d.x -= x *= l;
                  d.y -= y *= l;
                  quad.point.x += x;
                  quad.point.y += y;
                }
              }
              return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
          };
        }
      // });


    }


    if ($.isFunction(callback)) {
      callback();
    }

  }

})(d3, $, window);