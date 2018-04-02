class TrendsBubble {
  constructor(opts) {
    // console.log(opts);
    this.data = opts.data;
    this.year = opts.year || "";
    this.datas = opts.datas;
    this.years = opts.years || "";
    this.absMaxX = opts.absMaxX || 0;
    this.absMaxY = opts.absMaxY || 0;
    this.element = opts.element;
    // this.color = d3.scaleOrdinal().range(["#a6761d", "#666666", "#377eb8", "#984ea3", "#73c000", "#ff7f00", "#e31a1c", "#e6ab02"]);//d3.range(["#a6761d", "#666666", "#377eb8", "#984ea3", "#73c000", "#ff7f00", "#e31a1c", "#e6ab02"]);
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
    this.width = this.height;
    // set up parent element and SVG
    // this.element.innerHTML = '';
    let element = d3.select(this.element);
    element.select('svg').selectAll("*").remove(); //element.selectAll('.item').remove();
    this.padding = element.node().getBoundingClientRect();
    const svg = element.select('svg')
      .attr('class', 'item')
      .attr('width', this.width + (this.margin.left + this.margin.right))
      .attr('height', this.height + (this.margin.top + this.margin.bottom));

    // we'll actually be appending to a <g> element
    this.container = svg.append('g')
      .attr("width", this.width)
      .attr("height", this.height)
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.clip = svg.append('defs').append('clipPath')
      .attr('id', 'line-clip')
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height);

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

    function getTextWidth(text, font) { //https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript
      // re-use canvas object for better performance
      var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
      var context = canvas.getContext("2d");
      context.font = font || '24px "Helvetica Neue"';
      var metrics = context.measureText(text);
      return metrics.width;
    }
    // console.log(getTextWidth("hello there!", "bold 12pt arial"));


    // New algorithm for axes:
    // For ALL YEARS:
    // yMax = 30%, yMin = -30%.
    // xMax = 20%, yMin = -20%
    // include the line break at min and max for both axes
    // display values above/below max/min as ">30%" or "<30%" (or 20% for y Axis)

    let maxYLimit = 0.6;
    // let tooltip = this.tooltip;
    let that = this;
    // console.log(data);
    // set the ranges
    var x = d3.scaleLinear()
      .range([0, this.width])
    var y = d3.scaleLinear()
      .range([this.height, 0]);


    var radius = d3.scaleLinear().range([2, 18]).domain(d3.extent(that.data, (d) => +d.radius));

    // Scale the range of the data in the domains
    // const minX = d3.min(this.data, (d) => d["National Trend"]);
    // const maxX = d3.max(this.data, (d) => d["National Trend"]);
    // this.absMaxX = Math.max(Math.abs(minX), Math.abs(maxX))
    // // x.domain([-this.absMaxX, +this.absMaxX]);
    // const minY = d3.min(this.data, (d) => d["Local Trend"]);
    // const maxY = d3.max(this.data, (d) => d["Local Trend"]);
    // this.absMaxY = Math.max(Math.abs(minY), Math.abs(maxY))

    let xEndPercent = 0.225;
    let yEndPercent = 0.325;
    let breakXEnd = xEndPercent * this.absMaxX;
    let breakYEnd = yEndPercent * this.absMaxY;

    const breakXPoint = 0.21 * this.absMaxX;
    const breakYPoint = 0.31 * this.absMaxY;

    const breakXStart = 0.2 * this.absMaxX;
    const breakYStart = 0.3 * this.absMaxY;

    var maxOutsideRadius = 0;
    that.data.map((d) => {
      if (d["National Trend"] > breakXStart || d["National Trend"] < -breakXStart || d["Local Trend"] > breakYStart || d["Local Trend"] < -breakYStart) {
        maxOutsideRadius = +d.radius > maxOutsideRadius ? +d.radius : maxOutsideRadius;
      }
    });
    // const newMaxY = 0.3 * maxY;
    // const newMinY = 0.3 * minY;
    // const newMaxX = 0.2 * maxX;
    // const newMinX = 0.2 * minX;

    // y.domain([-this.absMaxY, +this.absMaxY]);
    // if (this.absMaxY > 0.5) {
    //   y.domain([-0.6, +0.6])
    // } else {
    //   y.domain([-this.absMaxY, this.absMaxY])
    // }

    x.domain([-breakXEnd, breakXEnd]);
    y.domain([-breakYEnd, breakYEnd]);
    var i = 6;
    while (i > 0) {
      if ((x(breakXEnd) - x(breakXPoint)) > radius(maxOutsideRadius) &&
        (y(breakYPoint) - y(breakYEnd)) > radius(maxOutsideRadius)) {
        i = 0;
      } else {
        xEndPercent = xEndPercent + 0.01;
        yEndPercent = yEndPercent + 0.01;
        breakXEnd = xEndPercent * this.absMaxX;
        breakYEnd = yEndPercent * this.absMaxY;
        x.domain([-breakXEnd, breakXEnd]);
        y.domain([-breakYEnd, breakYEnd]);
        i--;
      }
    }
    // console.log(xEndPercent, yEndPercent)
    // console.log(radius(maxOutsideRadiusCircles), x(breakXEnd)-x(breakXPoint))

    var line = d3.line()
      // .x((d) => x(d.x))
      .x((d) => {
        if (d.x > breakXStart) {
          return x(breakXPoint);
        } else if (d.x < -breakXStart) {
          return x(-breakXPoint);
        } else {
          return x(d.x);
        }
      })
      .y((d) => {
        if (d.y > breakYStart) {
          return y(breakYPoint);
        } else if (d.y < -breakYStart) {
          return y(-breakYPoint);
        } else {
          return y(d.y);
        }
      });



    // let absMin = Math.min(this.absMaxY, this.absMaxX);
    // console.log(this.year)
    // if (this.year == 2020) { //handleYear
    //   x.domain([-0.2 * this.absMaxX, +0.2 * this.absMaxX]);
    //   if (this.absMaxY > 0.5) {
    //     y.domain([-0.3 * maxYLimit, 0.3 * maxYLimit]);
    //     absMin = Math.min(0.3 * maxYLimit, 0.3 * this.absMaxX);
    //   } else {
    //     y.domain([-0.3 * this.absMaxY, 0.3 * this.absMaxY]);
    //     absMin = Math.min(0.3 * this.absMaxY, 0.3 * this.absMaxX);
    //   }
    // }

    // add the x Axis
    this.container.append("g")
      .attr("class", "x-axis axis")
      .attr("transform", `translate(0,${this.height})`)
      // .attr("transform", `translate(0,${y(0) || this.height})`)
      .call(d3.axisBottom(x).tickSize(-this.height).tickFormat((d) => {
        if (d > breakXStart || d < -breakXStart) {
          return "";
        }
        return d;

      })); //.tickFormat((d) => (d * 100).toFixed(0) + "%")); //https://bl.ocks.org/mbostock/9764126

    // add the y Axis
    this.container.append("g")
      // .attr("transform", `translate(${x(0) || 0},0)`)
      .attr("class", "y-axis axis")
      .call(d3.axisLeft(y).tickSize(-this.width).tickFormat((d) => {
        if (d > breakYStart || d < -breakYStart) {
          return "";
        }
        return d;
      })); ////.tickFormat((d) => d == maxYLimit ? "" : (d * 100).toFixed(0) + "%"));

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
      .attr("transform", `translate(${(-this.margin.left+10)},${(this.height/2)})rotate(-90)`)
      .text("Local Trend (% Change in # Employees)");

    this.container.append("text")
      .attr('class', 'label-axis label-x-axis')
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${(this.width/2)},${(this.height-(-this.margin.bottom+10))})`)
      .text("National Trend (% Change in # Employees)");


    // if (this.absMaxY > 0.5 && this.year != 2020) {
    this.container.append("text")
      .attr("class", "more-than-y-max")
      .attr("y", 8)
      .attr("x", -28)
      .text(">30%");
    // .text(">"+(maxY*100)+"%");
    this.container.append("circle")
      .attr('class', 'more-than-y-max')
      .attr("cx", x(0))
      .attr("cy", y(breakYStart) + 2.5) //12.5)
      .attr("r", 2);
    this.container.append("line")
      .attr('class', 'more-than-y-max')
      .attr("x1", x(0) - 5)
      .attr("x2", x(0) + 5)
      .attr("y1", y(breakYStart) + 5) //10 + 5)
      .attr("y2", y(breakYStart) - 5); //10 - 5);
    this.container.append("line")
      .attr('class', 'more-than-y-max')
      .attr("x1", x(0) - 5)
      .attr("x2", x(0) + 5)
      .attr("y1", y(breakYStart) + 5 + 5) //15 + 5)
      .attr("y2", y(breakYStart) - 5 + 5); //15 - 5);

    this.container.append("text")
      .attr("class", "less-than-y-min")
      .attr("y", this.height)
      .attr("x", -31)
      .text("<-30%");
    this.container.append("circle")
      .attr('class', 'less-than-y-min')
      .attr("cx", x(0))
      .attr("cy", y(-breakYStart) - 2.5) //this.height - 12.5)
      .attr("r", 2);
    this.container.append("line")
      .attr('class', 'less-than-y-min')
      .attr("x1", x(0) - 5)
      .attr("x2", x(0) + 5)
      .attr("y1", y(-breakYStart) + 5) //this.height - 10 + 5)
      .attr("y2", y(-breakYStart) - 5); //this.height - 10 - 5);
    this.container.append("line")
      .attr('class', 'less-than-y-min')
      .attr("x1", x(0) - 5)
      .attr("x2", x(0) + 5)
      .attr("y1", y(-breakYStart) + 5 - 5) //this.height - 15 + 5)
      .attr("y2", y(-breakYStart) - 5 - 5); //this.height - 15 - 5);

    this.container.append("text")
      .attr("class", "more-than-x-max")
      .attr("y", this.height + 10)
      .attr("x", this.width - 26 + 10)
      .text(">20%");
    this.container.append("circle")
      .attr('class', 'more-than-x-max')
      .attr("cy", y(0))
      .attr("cx", x(breakXStart) + 2.5) //this.width-12.5)
      .attr("r", 2);
    this.container.append("line")
      .attr('class', 'more-than-x-max')
      .attr("y1", y(0) - 5)
      .attr("y2", y(0) + 5)
      .attr("x1", x(breakXStart) + 5) //this.width-10 + 5)
      .attr("x2", x(breakXStart) - 5); //this.width-10 - 5);
    this.container.append("line")
      .attr('class', 'more-than-x-max')
      .attr("y1", y(0) - 5)
      .attr("y2", y(0) + 5)
      .attr("x1", x(breakXStart) + 5 + 5) //this.width-15 + 5)
      .attr("x2", x(breakXStart) - 5 + 5); //this.width-15 - 5);

    this.container.append("text")
      .attr("class", "less-than-x-min")
      .attr("y", this.height + 10)
      .attr("x", -10)
      .text("<-20%");
    this.container.append("circle")
      .attr('class', 'less-than-x-min')
      .attr("cy", y(0))
      .attr("cx", x(-breakXStart) - 2.5) //12.5)
      .attr("r", 2);
    this.container.append("line")
      .attr('class', 'less-than-x-min')
      .attr("y1", y(0) - 5)
      .attr("y2", y(0) + 5)
      .attr("x1", x(-breakXStart) + 5) //10 + 5)
      .attr("x2", x(-breakXStart) - 5); //10 - 5);
    this.container.append("line")
      .attr('class', 'less-than-x-min')
      .attr("y1", y(0) - 5)
      .attr("y2", y(0) + 5)
      .attr("x1", x(-breakXStart) + 5 - 5) //15 + 5)
      .attr("x2", x(-breakXStart) - 5 - 5); //15 - 5);

    // this.container.append("line")
    //   .attr('class', 'less-than-y-min')
    //   .attr("x1", x(-0.02))
    //   .attr("x2", x(0.02))
    //   .attr("y1", y(-1.53))
    //   .attr("y2", y(-1.47));
    // } else {

    // }


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
      .style("stroke", "#565352")
      .style("stroke-width", "1")
      .style('fill', (d, i) => d.color)
      .attr('clip-path', 'url(#line-clip)')
      .attr("cx", (d) => {
        if (d["National Trend"] > breakXStart) {
          return x(breakXPoint);
        } else if (d["National Trend"] < -breakXStart) {
          return x(-breakXPoint);
        } else {
          return x(d["National Trend"]);
        }
      })
      .attr("cy", (d) => {
        if (d["Local Trend"] > breakYStart) {
          return y(breakYPoint);
        } else if (d["Local Trend"] < -breakYStart) {
          return y(-breakYPoint);
        } else {
          return y(d["Local Trend"]);
        }
      })
      // .attr("cy", (d) => y(d["Local Trend"]))
      // .attr("cx", (d) => x(d["National Trend"]))
      .attr("r", (d) => radius(d.radius))
      .style("cursor", "pointer")
      .on("mouseover", function (d) {
        bubble.style('opacity', 1);
        d3.select(this).style('opacity', 1);
        const textWidth = getTextWidth(d['Industry']) || (that.width + 1);
        // console.log(textWidth);
        description.text(textWidth < that.width ? d['Industry'] : d['Industry'].substring(0, 65) + "...");
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
          .attr('clip-path', 'url(#line-clip)')
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
          .attr('clip-path', 'url(#line-clip)')
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
      .attr('clip-path', 'url(#line-clip)')
      .attr("x1", x(-breakXEnd))
      .attr("x2", x(+breakXEnd))
      .attr("y1", y(-breakYEnd))
      .attr("y2", y(+breakYEnd));
    // .attr("x1", x(-absMin))
    // .attr("x2", x(+absMin))
    // .attr("y1", y(-absMin))
    // .attr("y2", y(+absMin));
  }
}