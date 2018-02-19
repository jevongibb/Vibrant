;
(function (d3, $, window) {
  'use strict';

  if (!window.vibrant) {
    window.vibrant = {};
  }

  window.loadSwot = function loadSwot(callback) {
    run(undefined, callback);
  }


  function run(data, callback) {
    var activeCity = 'Austin';
    var color = {
      strengths: {
        caption: "#4472c4",
        thead: "#8ea9db",
        tbody: "#d9e1f2"
      },
      weaknesses: {
        caption: "#ffc000",
        thead: "#ffd966",
        tbody: "#fff2cc"
      },
      opportunities: {
        caption: "#70ad47",
        thead: "#a9d08e",
        tbody: "#e2efda"
      },
      threats: {
        caption: "#ff0000",
        thead: "#ff7c80",
        tbody: "#ffcccc"
      }
    };

    $('.dropdown-visible').off().on('click', function () {
      $('.dropdown-hidden').toggleClass('visibility-visible');
      // $(this).find('.fa').toggleClass('fa-angle-down').toggleClass('fa-angle-up');
    });
    $('.dropdown-item').off().on('click', function () {
      activeCity = $(this).data('value');
      $('.dropdown-value').text(activeCity);
      $('.dropdown-hidden').toggleClass('visibility-visible');
      buildTable(activeCity, "strengths");
      buildTable(activeCity, "weaknesses");
      buildTable(activeCity, "opportunities");
      buildTable(activeCity, "threats");
    });


    buildTable(activeCity, "strengths");
    buildTable(activeCity, "weaknesses");
    buildTable(activeCity, "opportunities");
    buildTable(activeCity, "threats");

    function buildTable(activeCity, type) {
      d3.csv(`./data/${activeCity}_SWOT_${type}.csv`, function (error, data) {
        if (error) throw error;

        // data.sort((a, b) => +b['Employees'] - +a['Employees']); //descending
        var sortAscending = true;
        var element = d3.select(`#swot-${type}-wrapper`);
        element.selectAll("table").remove();


        var table = element.append('table');
        var titles = d3.keys(data[0]);

        table.append('caption').text(type.toUpperCase()).style('background', color[type].caption);

        var headers = table.append('thead').append('tr')
          .selectAll('th')
          .data(titles).enter()
          .append('th')
          .style('background', color[type].thead)
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
                rows.sort((a, b) => +(a[d].replace(/[^0-9]+/g, '')) - +(b[d].replace(/[^0-9]+/g, '')));
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
                rows.sort((a, b) => +(b[d].replace(/[^0-9]+/g, '')) - +(a[d].replace(/[^0-9]+/g, '')));
              }
              sortAscending = true;
              this.className = 'des';
            }

          });

        var rows = table.append('tbody').selectAll('tr')
          .data(data).enter()
          .append('tr')
          .style('background', color[type].tbody)
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
      });
    }



    if ($.isFunction(callback)) {
      callback();
    }
    // $("#loading-wrapper").addClass("hidden");
  }

})(d3, $, window);