class swotTable {
  constructor(opts) {
    this.type = opts.type;
    this.activeCity = opts.activeCity;
    this.color = {
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
    this.draw();
  }

  draw() {
    let activeCity = this.activeCity;
    let type = this.type;
    let color = this.color;

    d3.csv(`./data/${activeCity}_SWOT_${type}.csv`, function (error, data) {
      if (error) throw error;

      // data.sort((a, b) => +b['Employees'] - +a['Employees']); //descending
      var sortAscending = true;
      var element = d3.select(`#swot-${type}-wrapper`);
      element.selectAll(".table").remove();


      var table = element.append('div').attr('class', 'table');
      var titles = d3.keys(data[0]);

      table.append('div').attr('class','caption').text(type.toUpperCase()).style('background', color[type].caption);

      var headers = table.append('div').attr('class', 'thead').append('div').attr('class', 'tr')
        .selectAll('.th')
        .data(titles).enter()
        .append('div').attr('class', 'th content-cutted')
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

        });

      var rows = table.append('div').attr('class', 'tbody').selectAll('.tr')
        .data(data).enter()
        .append('div').attr('class', 'tr')//.append('tr')
        .style('background', color[type].tbody)
      rows.selectAll('.td')
        .data(function (d) {
          return titles.map(function (k) {
            return {
              'value': d[k],
              'name': k
            };
          });
        }).enter()
        .append('div').attr('class', 'td content-cutted')
        .attr('data-th', (d) => d.name)
        .text((d) => d.value);
    });
  }

}


// class swotTable {
//   constructor(opts) {
//     this.type = opts.type;
//     this.activeCity = opts.activeCity;
//     this.color = {
//       strengths: {
//         caption: "#4472c4",
//         thead: "#8ea9db",
//         tbody: "#d9e1f2"
//       },
//       weaknesses: {
//         caption: "#ffc000",
//         thead: "#ffd966",
//         tbody: "#fff2cc"
//       },
//       opportunities: {
//         caption: "#70ad47",
//         thead: "#a9d08e",
//         tbody: "#e2efda"
//       },
//       threats: {
//         caption: "#ff0000",
//         thead: "#ff7c80",
//         tbody: "#ffcccc"
//       }
//     };
//     this.draw();
//   }

//   draw() {
//     let activeCity = this.activeCity;
//     let type = this.type;
//     let color = this.color;

//     d3.csv(`./data/${activeCity}_SWOT_${type}.csv`, function (error, data) {
//       if (error) throw error;

//       // data.sort((a, b) => +b['Employees'] - +a['Employees']); //descending
//       var sortAscending = true;
//       var element = d3.select(`#swot-${type}-wrapper`);
//       element.selectAll("table").remove();


//       var table = element.append('table');
//       var titles = d3.keys(data[0]);

//       table.append('caption').text(type.toUpperCase()).style('background', color[type].caption);

//       var headers = table.append('thead').append('tr')
//         .selectAll('th')
//         .data(titles).enter()
//         .append('th')
//         .style('background', color[type].thead)
//         .text((d) => d)
//         .on('click', function (d, i) {
//           headers.attr('class', 'header');
//           if (sortAscending) {
//             if (i === 1) {
//               // rows.sort(function(a, b) { return b[d] < a[d]; });
//               rows.sort((a, b) => { //sort string ascending
//                 if (a[d] < b[d]) {
//                   return -1;
//                 }
//                 if (a[d] > b[d]) {
//                   return 1;
//                 }
//                 return 0; //default return value (no sorting)
//               });
//             } else {
//               rows.sort((a, b) => +(a[d].replace(/[^-.0-9]+/g, '')) - +(b[d].replace(/[^-.0-9]+/g, '')));
//             }
//             sortAscending = false;
//             this.className = 'aes';
//           } else {
//             if (i === 1) {
//               // rows.sort(function(a, b) { return b[d] > a[d]; });
//               rows.sort((b, a) => {
//                 if (a[d] < b[d]) {
//                   return -1;
//                 }
//                 if (a[d] > b[d]) {
//                   return 1;
//                 }
//                 return 0; //default return value (no sorting)
//               });
//             } else {
//               rows.sort((a, b) => +(b[d].replace(/[^-.0-9]+/g, '')) - +(a[d].replace(/[^-.0-9]+/g, '')));
//             }
//             sortAscending = true;
//             this.className = 'des';
//           }

//         });

//       var rows = table.append('tbody').selectAll('tr')
//         .data(data).enter()
//         .append('tr')
//         .style('background', color[type].tbody)
//       rows.selectAll('td')
//         .data(function (d) {
//           return titles.map(function (k) {
//             return {
//               'value': d[k],
//               'name': k
//             };
//           });
//         }).enter()
//         .append('td').append('div')
//         .attr('data-th', (d) => d.name)
//         .text((d) => d.value);
//     });
//   }

// }