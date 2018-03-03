class TrendsTable {
  constructor(opts) {
    this.element = opts.element;
    this.count = opts.count;
    this.callback = opts.callback;
    this.prepareData(opts.data, opts.colors);
    this.draw();
    if (this.callback) {
      // console.log(this.bubbleObj);
      this.callback(this.bubbleObj);
    }
  }

  prepareData(master, colors) {
    var buildBubble = this.callback;
    var format = d3.format(',');

    function setNumberFormat(any) {
      return format(+any || 0) || 0;
    }

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
    // var colorsByGroup = d3.scaleOrdinal().range(["#a6761d", "#666666", "#377eb8", "#984ea3", "#73c000", "#ff7f00", "#e31a1c", "#e6ab02"]);

    let years = d3.keys(master[0]).filter((d) => d.indexOf("L_T_") !== -1).map((year) => {
      year = +year.replace(/[^-.0-9]+/g, '');
      bubbleByYear[year] = [];
      return year;
    });
    const handleYear = years[years.length - 1] + 1;
    years.push(handleYear);
    bubbleByYear[handleYear] = [];

    years.sort((a, b) => a - b);
    // console.log(years, bubbleByYear);
    master.sort((a, b) => +b['2015'] - +a['2015']); //for bable
    master.map((d, i) => {
      let obj = {};
      years.map((year) => {
        obj.year = {};
        if (year == handleYear) {
          // console.log(d.naics[0], colorsByGroup);
          obj.year = {
            "color": colorsByGroup[d.Group].Hex || "gray",
            "Industry": d["Label"],
            "Local Trend": +d["Local_Trend"] || 0,
            "National Trend": +d["Natl_Trend"] || 0,
            "radius": +d["2015"],

            "Employees": +d["2015"],
            "Relative Size": +d["RS_2015"], //tableByNaics[d.naics] ? +tableByNaics[d.naics]["Relative Size"] : (""+i)//(Math.random() + 1) * 5
            "Nat’l Trend": +d["Natl_Trend"] || 0
          };
          // return;
        } else {
          obj.year = {
            "color": colorsByGroup[d.Group].Hex || "gray", //colorsByGroup([+d.Group])
            "Industry": d["Label"],
            "Local Trend": +d["L_T_" + year] || 0, //+d["Local_Trend"],
            "National Trend": +d["N_T_" + year] || 0, //+d["Natl_Trend"],
            "radius": +d["2015"],

            "Employees": +d["2015"],
            "Relative Size": +d["RS_2015"], //tableByNaics[d.naics] ? +tableByNaics[d.naics]["Relative Size"] : (""+i)//(Math.random() + 1) * 5
            "Nat’l Trend": +d["Natl_Trend"] || 0
          };
        }
        bubbleByYear[year].push(obj.year)
      });

      data.push({
        // "bubbleByYear": obj,
        "Industry": d["Label"],
        "Employees": setNumberFormat(d["2015"]), //tableByNaics[d.naics] ? tableByNaics[d.naics]["Employees"] : "",
        "Relative Size": (+d["RS_2015"]).toFixed(2), //tableByNaics[d.naics] ? tableByNaics[d.naics]["Relative Size (RS)"] : (""+i),
        "Local Trend (2020)": (+d["Local_Trend"] * 100).toFixed(2) + "%",
        "Nat’l Trend (2020)": (+d["Natl_Trend"] * 100).toFixed(2) + "%"
      });
    });

    // data.sort((a, b) => +b['Employees'].replace(/[^0-9]+/g, '') - +a['Employees'].replace(/[^0-9]+/g, ''));//for table
    // data.sort((a, b) => +(b['Employees'].replace(/[^0-9]+/g, '')) - +(a['Employees'].replace(/[^0-9]+/g, '')));
    // console.log(data, bubbleByYear);

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
    this.bubbleObj = bubbleObj;
    if (this.count) {
      data = data.slice(0, this.count);
    }
    this.data = data;
  }

  draw() {
    var sortAscending = true;
    var element = this.element;
    var data = this.data;
    var bubbleObj = this.bubbleObj;
    var buildBubble = this.callback;

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
    var titles = d3.keys(data[0]).filter(d => d !== "bubbleByYear");
    var tooltip = d3.select(".information-tooltip");
    var headers = table.append('thead').append('tr')
      .selectAll('th')
      .data(titles).enter()
      .append('th')
      // .html((d) => d)
      .each(function (d) {
        if (d == "Relative Size") {
          var el = d3.select(this);//.append("div");
          el.append("span").text(d).style("white-space","nowrap");
          el.append("img")
            .attr("src", "images/information.png")
            .attr("alt", "information")
            .attr("class", "information")
            .on("mouseover", function () {
              var box = d3.select(this).node().getBoundingClientRect();
              var tooltipNode = tooltip.node();
              const tooltipWidth = $(tooltipNode).outerWidth(true);
              const tooltipHeight = $(tooltipNode).outerHeight(true);
              const width = $(window).width();
              let w = ((d3.event.pageX || box.left) + 10);
              if ((w + tooltipWidth / 2) > width) {
                w = width - tooltipWidth - 10;
              } else {
                w = w - tooltipWidth / 2;
              }
              let h = ((d3.event.pageY || box.top) - 15) - tooltipHeight;
              tooltip.style("top", h + "px").style("left", w + "px");
              tooltip.style("visibility", "visible");
            })
            .on("mouseout", () => tooltip.style("visibility", "hidden"));
        } else {
          d3.select(this).text(d);
        }
      })
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
            rows.sort((a, b) => +(a[d].replace(/[^-.0-9]+/g, '')) - +(b[d].replace(/[^-.0-9]+/g, '')));
            bubbleObj.years.map((year) => {
              bubbleObj.bubbleByYear[year].sort((a, b) => +((a[d] + '').replace(/[^-.0-9]+/g, '')) - +((b[d] + '').replace(/[^-.0-9]+/g, '')));
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
            rows.sort((a, b) => +(b[d].replace(/[^-.0-9]+/g, '')) - +(a[d].replace(/[^-.0-9]+/g, '')));
            bubbleObj.years.map((year) => {
              bubbleObj.bubbleByYear[year].sort((a, b) => +((b[d] + '').replace(/[^-.0-9]+/g, '')) - +((a[d] + '').replace(/[^-.0-9]+/g, '')));
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
        buildBubble(bubbleObj); //buildBubble, bubbleObj = { bubbleByYear, years, year:selectedYear, yearLabel:selectedYear, absMaxX, absMaxY};
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

}