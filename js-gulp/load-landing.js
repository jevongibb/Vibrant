;
(function (d3, $, window) {
  'use strict';

  if (!window.vibrant) {
    window.vibrant = {};
  }

  window.loadLanding = function loadLanding(callback) {
    run(undefined, callback);
  }



  function run(data, callback) {
    var activeCity = 'Austin';

    addCitiesImg();
    function addCitiesImg(){
      d3.queue(2)
      .defer(d3.json, `./data/cities.json`)
      .await(function(error, cities) {
        if (error) throw error;
        // console.log(cities);
        let citiesImgWrapper = d3.select("#cities-img-wrapper");
        citiesImgWrapper.selectAll("*").remove();
        cities.map((d)=>{
          let cityImgWrapper = citiesImgWrapper.append("div").attr("class", "city-img-wrapper");
          let cityImg = cityImgWrapper.append("div").attr("class", "city-img")
          .on("click", function(){
            $("#landing-content").removeClass("hidden");
            $(".city").text(d.city);
            d3.select("#counties-img").attr("src", `./img/Counties_${d.city}.gif`);
          });
          cityImg.append("img").attr("src", `./img/${d.city.toLowerCase()}.jpg`);
          cityImg.append("p").text(`${d.city}, ${d.state}`);
        });
      });
    }

    function loadContent(city){
      
    }

    if ($.isFunction(callback)) {
      callback();
    }
  }

})(d3, $, window);