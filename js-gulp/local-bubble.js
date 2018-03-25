class LocalBubble {
  constructor(opts) {
    this.element = opts.element;
    this.prepareData(opts.data, opts.colors);
    // this.color = d3.scaleOrdinal().range(["#a6761d", "#666666", "#377eb8", "#984ea3", "#73c000", "#ff7f00", "#e31a1c", "#e6ab02"]);
    this.draw();
  }

  prepareData(master, colors) {

    var format = d3.format(',');

    function setNumberFormat(any) {
      return format(+any || 0) || 0;
    }

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
    // var colorsByGroup = d3.scaleOrdinal().range(["#a6761d", "#666666", "#377eb8", "#984ea3", "#73c000", "#ff7f00", "#e31a1c", "#e6ab02"]);
    master.sort((a, b) => +b['2015'] - +a['2015']);
    master.map((d, i) => {
      data.push({
        "color": colorsByGroup[d.Group].Hex || "gray", //colorsByGroup([+d.Group])
        "Industry": d["Label"],
        // "Distance from Average": 0,
        "Employees": setNumberFormat(d["2015"]), //tableByNaics[d.naics] ? +tableByNaics[d.naics]["Employees"] : "",
        "Relative Size": (+d["RS_2015"]).toFixed(2), //tableByNaics[d.naics] ? +tableByNaics[d.naics]["Relative Size (RS)"] : "",
        "Local Trend": (+d["Local_Trend"] * 100).toFixed(2) + "%",
        "Nat’l Trend": (+d["Natl_Trend"] * 100).toFixed(2) + "%"
      });
    });
    // console.log(masterByNaics, tableByNaics);

    data.sort((a, b) => +b['Relative Size'] - +a['Relative Size']);
    var bubble = data.splice(0, 10).concat(data.splice(data.length - 10, data.length));
    this.data = bubble;
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
      top: 30,
      right: 100,
      bottom: 70,
      left: 100
    };
    this.width = this.width - (this.margin.left + this.margin.right);
    this.height = this.height - (this.margin.top + this.margin.bottom);
    // set up parent element and SVG
    // this.element.innerHTML = '';
    const svg = element.append('svg')
      .attr('class', 'item')
      .attr('width', this.width + (this.margin.left + this.margin.right))
      .attr('height', this.height + (this.margin.top + this.margin.bottom));

    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 5)
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", 0)
      .attr("class", "arrowHead");
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
    var radius = d3.scaleLinear().range([5, 25]).domain(d3.extent(data, (d) => +d["Employees"].replace(/[^-.0-9]+/g, '')));

    // Scale the range of the data in the domains
    x.domain(data.map((d) => d["Industry"]));

    y.domain([d3.min(data, (d) => -d["Relative Size"]), d3.max(data, (d) => -d["Relative Size"])]);

    this.container.append("line")
      .attr("class", "arrow")
      .attr("marker-end", "url(#arrow)")
      .style("stroke", "#000")
      .style("stroke-width", "2px")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", y(-1))
      .attr("y2", -25);

      this.container.append("line")
      .attr("class", "arrow")
      .attr("marker-end", "url(#arrow)")
      .style("stroke", "#000")
      .style("stroke-width", "2px")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", y(-1))
      .attr("y2", this.height + 25);
      
      [
        {text:"Above", x:-25,y:y(-1)/2 - 14},
        {text:"Average", x:-25,y:y(-1)/2 + 0},
        {text:"Below", x:-25,y:(this.height + y(-1))/2 + 6},
        {text:"Average", x:-25,y:(this.height + y(-1))/2 + 20}
      ].map((d)=>{
        this.container.append("text")
          .attr("x", d.x)
          .attr("y", d.y)
          .attr("text-anchor", "middle")
          .text(d.text);
      });

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
      .style('fill', (d, i) => d.color)
      .attr("cy", (d) => d["Relative Size"] > 0 ? y(Math.min(0, -d["Relative Size"])) : (y(Math.min(0, -d["Relative Size"])) + Math.abs(y(d["Relative Size"]) - y(0))))
      // .attr("y", (d) => y(Math.min(0, d["Relative Size"])))
      .attr("cx", (d) => x(d["Industry"]) + x.bandwidth() / 2)
      // .attr("height", (d) => Math.abs(y(d["Relative Size"])-y(0)))
      // .attr("width", x.bandwidth())
      .attr("r", (d, i) => radius(d["Employees"].replace(/[^-0-9#]+/g, '')))
      .style("cursor", "pointer")
      .on("mouseover", (d) => {
        tooltip.html(`<p>${d["Industry"]}</p><p>Relative Size: ${d["Relative Size"]}</p><p>Employees: ${d["Employees"]}</p>`);
        tooltip.style("visibility", "visible");
      })
      .on("mousemove", function (d) {
        // var coords = d3.mouse(this);
        var top = d["Relative Size"] > 0 ? y(Math.min(0, -d["Relative Size"])) : (y(Math.min(0, -d["Relative Size"])) + Math.abs(y(d["Relative Size"]) - y(0))); // || (d3.event.pageY - padding.top)
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