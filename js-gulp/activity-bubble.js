class ActivityBubble {
  constructor(opts) {
    this.element = opts.element;
    this.color = d3.scaleOrdinal().range(["#a6761d", "#666666", "#377eb8", "#984ea3", "#73c000", "#ff7f00", "#e31a1c", "#e6ab02"]);
    this.prepareData(opts.data, opts.colors);
    this.draw();
  }

  prepareData(_data, colors) {

    Array.prototype.contains = function (v) {
      for (var i = 0; i < this.length; i++) {
        if (this[i] === v) return true;
      }
      return false;
    };

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

    var data = [];
    _data.map((d) => {
      data.push({
        text: d["Label"],
        size: +d["2015"],
        group: d["Group"],
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

    this.graph = {
      nodes: nodes,
      links: []
    }


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

  draw() {
    // define width, height and margin
    let element = this.element
    let elementNode = element.node();
    this.padding = elementNode.getBoundingClientRect();
    element.selectAll('.item').remove();
    this.width = elementNode.offsetWidth || 400;
    this.height = elementNode.offsetHeight || 400;
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
    this.createBubbles(this.graph);
  }

  setData(newGraph) {
    this.graph = newGraph;
    // full redraw needed
    this.draw();
  }
  //testing - https://bl.ocks.org/steveharoz/8c3e2524079a8c440df60c1ab72b5d03
  createBubbles(graph) { //https://bl.ocks.org/HarryStevens/f636199a46fc4b210fbca3b1dc4ef372
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
      .data(graph.links)
      .enter()
      .append("line")
      .attr("stroke", "transparent")



    var node = this.container.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(graph.nodes)
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
        that.tooltip.style("top", (d.y) + "px").style("left", ((d3.event.pageX - padding.left) + 10) + "px");
        // if (padding.top <= 0) {
        //   that.tooltip.style("top", (d.y) + "px").style("left", ((d3.event.pageX - padding.left) + 10) + "px");
        // } else {
        //   that.tooltip.style("top", ((d3.event.pageY - padding.top) - 30) + "px").style("left", ((d3.event.pageX - padding.left) + 10) + "px");
        // }
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
      .attr("class", "first-row")
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
          arr.map((c, i) => {
            if (i > 3) {
              d.secondRow = d.secondRow + " " + c;
            }
          });
          return arr[0] + " " + arr[1] + " " + arr[2] + " " + arr[3]; //d.text.substring(0, d.radius / 3);
        }
        if (arr[2] && arr[1] && (arr[0].length + 1 + arr[1].length + 1 + arr[2].length) < d.radius / 3) {
          d.isFirstRow = true;
          arr.map((c, i) => {
            if (i > 2) {
              d.secondRow = d.secondRow + " " + c;
            }
          });
          return arr[0] + " " + arr[1] + " " + arr[2]; //d.text.substring(0, d.radius / 3);
        }
        if (arr[1] && (arr[0].length + 1 + arr[1].length) < d.radius / 3) {
          d.isFirstRow = true;
          arr.map((c, i) => {
            if (i > 1) {
              d.secondRow = d.secondRow + " " + c;
            }
          });
          return arr[0] + " " + arr[1]; //d.text.substring(0, d.radius / 3);
        }
        if (arr[0].length < d.radius / 3) {
          d.isFirstRow = true;
          arr.map((c, i) => {
            if (i >= 1) {
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
      .attr("class", "second-row")
      .attr("dy", ".3em")
      .style("fill", "white")
      .style("text-anchor", "middle")
      .style("cursor", "default")
      .style("pointer-events", "none")
      .text((d) => {
        let arr = d.secondRow.trim().split(" ");
        // console.log(arr);
        if (arr.length === 1 && arr[0] === '') {
          d.isSecondRow = false;
          return "";
        }
        if (d.isFirstRow && arr[2] && arr[1] && (arr[0].length + 1 + arr[1].length + 1 + arr[2].length) < d.radius / 3) {
          d.isSecondRow = true;
          return arr[0] + " " + arr[1] + " " + arr[2]; //d.text.substring(0, d.radius / 3);
        }
        if (d.isFirstRow && arr[1] && (arr[0].length + 1 + arr[1].length) < d.radius / 3) {
          d.isSecondRow = true;
          return arr[0] + " " + arr[1]; //d.text.substring(0, d.radius / 3);
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

      node.each(function (d) {
        let el = d3.select(this);
        d.x = Math.max(d.radius, Math.min(that.width - d.radius, d.x));
        d.y = Math.max(d.radius, Math.min(that.height - d.radius, d.y));
        el.select("circle")
          .attr("cx", d.x)
          .attr("cy", d.y);
        el.select(".first-row")
          .attr("x", d.x)
          .attr("y", d.isSecondRow ? d.y - 6 : d.y);
        el.select(".second-row")
          .attr("x", d.x)
          .attr("y", d.isSecondRow ? d.y + 6 : d.y);
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
      .nodes(graph.nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(graph.links);

  }
}