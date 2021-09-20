$(document).ready(function () {
    var APIKey = "2e7106f9963865fdfaacade04c8a3b8e";
    var citiesInput = document.querySelector("#citySearch");
    var citiesForm = document.querySelector("#cityForm");
    var citiesList = document.querySelector("#cityList");
    var citiesCountSpan = document.querySelector("#citySpanCount");
    var cityWanted = "Fort Wayne";
    var previousSearch = "";
    var idValue = "";
    var cities = [];    
    var rightNow = moment().format("MMMM Do YYYY");

 
    init();

    renderCities();

    function renderCities() {
     
        citiesList.innerHTML = "";
        citiesCountSpan.textContent = cities.length;

      
        for (var i = 0; i < cities.length; i++) {
            var city = cities[i];

            var li = document.createElement("li");
            li.setAttribute("data-city", city);

            var button = document.createElement("button");
            button.textContent = city;
            li.appendChild(button);
            citiesList.appendChild(li);
        }

        storeCities();
    }

    cityPast.addEventListener("click", function (event) {
        event.preventDefault();

        var element = event.target;
        console.log(element); ``

        if (element.matches("button") === true) {
            var citySearched = element.parentElement.getAttribute("data-city");
            console.log(citySearched);

            cityWanted = citySearched;
            getWeather();

            renderCities();
        }
    });

    citiesForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var citiesText = citiesInput.value.trim();

        if (citiesText === "") {
            return;
        }

        if (!cities.includes(citiesText)) {
            cities.push(citiesText);
        }

        citiesInput.value = "";
        cityWanted = citiesText;
        previousSearch = citiesText;

        getWeather();

        renderCities();
    });

    function getWeather() {
        console.log(cityWanted);

        var searchCity = cityWanted;

        console.log("This is the information for" + searchCity);
        var queryURL =
            "https://api.openweathermap.org/data/2.5/weather?q=" +
            searchCity +
            "&appid=" +
            APIKey;

        console.log(queryURL);

        $.ajax({
            url: queryURL,
            method: "GET",
        })
            .then(function (apiResult) {
                $("col-sm-10 text-left");
                console.log(apiResult);

                var city = apiResult.name;
                city = city + " (" + rightNow + ") ";
                $("#title").text(city);

                $("#wind").text("Wind Speed: " + apiResult.wind.speed);
                $("#humidity").text("Humidity: " + apiResult.main.humidity);

                var tempF = (apiResult.main.temp - 273.15) * 1.8 + 32;

                $("#temp").text("Temperature (K) " + apiResult.main.temp);
                $("#tempF").text("Temperature (F) " + tempF.toFixed(2));

                var tempDiv = $("<div>")
                    .addClass("tempF")
                    .text(tempF.toFixed(2) + " Temperature (F)");
                console.log("tempDiv " + tempDiv);

                var newIcon = $("#cardImage").attr(
                    "src",
                    "https://openweathermap.org/img/w/" +
                    apiResult.weather[0].icon +
                    ".png"
                );
                newIcon = $("#cardImage").addClass("card-img-top");
                console.log("newIcon " + newIcon);
                $("#cardImage").append(newIcon);

                getUVIndex(apiResult);
            });
    }

    function getUVIndex(apiResult) {
        console.log(apiResult);
        var savedResult = apiResult;

        console.log("Saved Variable Results passed to getUVIndex" + savedResult);
        console.log("Try for LAT:" + apiResult.coord.lat);
        console.log("Try for LON:" + apiResult.coord.lon);

        var uvQueryRL =
            "https://api.openweathermap.org/data/2.5/onecall?lat=" +
            apiResult.coord.lat +
            "&lon=" +
            apiResult.coord.lon +
            "&exclude=hourly,minutely&appid=" +
            APIKey;

        console.log("URL With LAT & LON" + uvQueryRL);

        $.aiax({
            url: uvQueryRL,
            method: "GET",
        })
            .then(function (oneAPIResult) {
   
                console.log(oneAPIResult);

                $("#UVIndex").text(oneAPIResult.current.uvi);

                if (oneAPIResult.current.uvi < 2) {
                    $("#UVIndex").addClass("bg-green");
                }

                if (
                    oneAPIResult.current.uvi >= 2.01 &&
                    oneAPIResult.current.uvi <= 5.0
                ) {
                    $("#UVIndex").addClass("bg-yellow");
                }

                if (oneAPIResult.current.uvi >= 5.01) {
                    $("#UVIndex").addClass("bg-red");
                }

                console.log("UV Index: " + oneAPIResult.current.uvi);

                for (let i = 0; i < 5; i++) {
                    const looper = oneAPIResult.daily[i];
                    var counter = 0;

                    counter = i;
                    console.log("Counter value (i): " + counter);

                    // Forecast Date
                    var rightNow = moment().format("MMMM Do YYYY");
                    var forecastDate = moment()
                        .add(counter + 1, "days")
                        .format("MMMM Do YYYY");

                    idValue = "#date" + parseInt(counter);
                    console.log("Forecast id and date= " + forecastDate + "ID= " + idValue);
                    $(idValue).text(forecastDate);

                    idValue = "#image" + parseInt(counter);
                    var forecastIcon = $(idValue).attr(
                        "src",
                        "https://openweathermap.org/img/w/" +
                        oneAPIResult.daily[i].weather[0].icon +
                        ".png"
                    );
                    forecastIcon = $(idValue).addClass("card-img-top");
                    console.log("forecastIcon " + forecastIcon);
                    $(idValue).append(forecastIcon);

                    idValue = "#humidity" + parseInt(counter);
                    $(idValue).text("Humidity: " + oneAPIResult.daily[i].humidity);

                    var tempF = (oneAPIResult.daily[i].temp.day - 273.15) * 1.8 + 32;

                    $("#temp").text("Temperature (K) " + oneAPIResult.daily[i].temp);

                    idValue = "#foreTemp" + parseInt(counter);

                    $(idValue).text("Temperature (F) " + tempF.toFixed(2));

                    var tempDiv = $("<div>")
                        .addClass("tempF")
                        .text(tempF.toFixed(2) + " Temperature (F)");
                    console.log("tempDiv " + tempDiv);
                }
            });
    }

    function init() {

        var storedCities = iSON.parse(localStorage.getItem("storedCities"));

        if (storedCities !== null) {
            cities = storedCities;

            previousSearch = iSON.parse(localStorage.getItem("lastCity"));
            cityWanted = previousSearch;

            getWeather();
        }
    }

    function storeCities() {

        localStorage.setItem("storedCities", iSON.stringify(cities));
        localStorage.setItem("lastCity", iSON.stringify(cityWanted));
    }
});