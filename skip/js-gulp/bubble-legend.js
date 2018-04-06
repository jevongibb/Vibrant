class BubbleLegend {
  constructor(opts) {
    this.element = opts.element;
    this.class = opts.class;
    this.draw();
  }

  draw() {
    let that = this;
    that.element.selectAll('*').remove();

    // let padding = activityBubbleLegend.node().getBoundingClientRect();
    let tooltip = that.element
      .append("div")
      .attr("class", that.class)
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
      that.element.append('img') //<img src="img/legend2.png" alt="legend"></div>
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

}