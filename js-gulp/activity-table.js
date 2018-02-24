class ActivityTable {
  constructor(opts) {
    this.element = opts.element;
    this.count = opts.count
    this.prepareData(opts.data);
    this.draw();
  }

  prepareData(_data) {

    var format = d3.format(',');

    function setNumberFormat(any) {
      return format(+any || 0) || 0;
    }

    var data = [];

    _data.map((d) => {
      d["Relative Size (RS)"] = (+d["Relative Size (RS)"]).toFixed(2);
      d["Employees"] = setNumberFormat(d["Employees"]);
      data.push({
        "NAICS": d["naics"],
        "Description": d["Label"],
        "Employees": setNumberFormat(+d["2015"]),
        "Relative Size": (+d["RS_2015"]).toFixed(2),
        "% Total": (+d["Pct_Total"] * 100).toFixed(2) + "%"
      });
    });

    data.sort((a, b) => +(b['Employees'].replace(/[^-.0-9]+/g, '')) - +(a['Employees'].replace(/[^-.0-9]+/g, ''))); //descending
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
            rows.sort((a, b) => +(a[d].replace(/[^-.0-9]+/g, '')) - +(b[d].replace(/[^-.0-9]+/g, '')));
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
            rows.sort((a, b) => +(b[d].replace(/[^-.0-9]+/g, '')) - +(a[d].replace(/[^-.0-9]+/g, '')));
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