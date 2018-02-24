class LocalTable {
  constructor(opts) {
    this.element = opts.element;
    this.count = opts.count;
    this.prepareData(opts.data, opts.colors);
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
    if (this.count) {
      data = data.slice(0, this.count);
    }
    this.data = data;
  }

  draw() {
    var element = this.element;
    var data = this.data;
    var sortAscending = true;

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
    var titles = d3.keys(data[0]).filter((d) => d !== 'color');
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
            rows.sort((a, b) => +((a[d] + "").replace(/[^-.0-9]+/g, '')) - +((b[d] + "").replace(/[^-.0-9]+/g, '')));
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
            rows.sort((a, b) => +((b[d] + "").replace(/[^-.0-9]+/g, '')) - +((a[d] + "").replace(/[^-.0-9]+/g, '')));
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

}