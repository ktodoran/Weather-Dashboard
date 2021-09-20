$(document).ready(function () {
    // Global Variables
    // API key
    var APIKey = "2e7106f9963865fdfaacade04c8a3b8e";

    var citiesInput = document.querySelector("#citiesText");
    var citiesForm = document.querySelector("#citiesForm");
    var citiesList = document.querySelector("#citiesList");
    var citiesCountSpan = document.querySelector("#citiesCount");
    var cityEntered = "Indianapolis";
    var lastSearched = "";
    var idValue = "";
    var cities = [];

    
    var today = moment().format("MMMM Do YYYY");

 
    init();

    renderCities();

    function renderCities() {
     
        citiesList.innerHTML = "";
        citiesCountSpan.textContent = cities.length;

      
        for (var i = 0; i < cities.length; i++) {
            var cityName = cities[i];

            var li = document.createElement("li");
            li.setAttribute("data-city", cityName);

            var button = document.createElement("button");
            button.textContent = cityName;
            li.appendChild(button);
            citiesList.appendChild(li);
        }

        storeCities();
    }

    citiesHistory.addEventListener("click", function (event) {
        event.preventDefault();

        var element = event.target;
        console.log(element); ``

        if (element.matches("button") === true) {
            var citySelected = element.parentElement.getAttribute("data-city");
            console.log(citySelected);

            cityEntered = citySelected;
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
        cityEntered = citiesText;
        lastSearched = citiesText;

        getWeather();

        renderCities();
    });

    function getWeather() {
        console.log(cityEntered);

        var searchCity = cityEntered;

        console.log("This is the value of Search City" + searchCity);
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

                var cityName = apiResult.name;
                cityName = cityName + " (" + today + ") ";
                $("#cardtitle").text(cityName);

                $("#wind").text("Wind Speed: " + apiResult.wind.speed);
                $("#humidity").text("Humidity: " + apiResult.main.humidity);

                var tempF = (apiResult.main.temp - 273.15) * 1.8 + 32;

                $("#temp").text("Temperature (K) " + apiResult.main.temp);
                $("#tempF").text("Temperature (F) " + tempF.toFixed(2));

                var tempDiv = $("<div>")
                    .addClass("tempF")
                    .text(tempF.toFixed(2) + " Temperature (F)");
                console.log("tempDiv " + tempDiv);

                var newIcon = $("#cardimage").attr(
                    "src",
                    "https://openweathermap.org/img/w/" +
                    apiResult.weather[0].icon +
                    ".png"
                );
                newIcon = $("#cardimage").addClass("card-img-top");
                console.log("newIcon " + newIcon);
                $("#cardimage").append(newIcon);

                getUVIndex(apiResult);
            });
    }

    function getUVIndex(apiResult) {
        console.log(apiResult);
        var savedResult = apiResult;

        console.log("Saved Variable Results passed to getUVINdex" + savedResult);
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

        $.ajax({
            url: uvQueryRL,
            method: "GET",
        })
            .then(function (oneAPIResult) {
   
                console.log(oneAPIResult);

                $("#uvindex").text(oneAPIResult.current.uvi);

                if (oneAPIResult.current.uvi < 2) {
                    $("#uvindex").addClass("bg-green");
                }

                if (
                    oneAPIResult.current.uvi >= 2.01 &&
                    oneAPIResult.current.uvi <= 5.0
                ) {
                    $("#uvindex").addClass("bg-yellow");
                }

                if (oneAPIResult.current.uvi >= 5.01) {
                    $("#uvindex").addClass("bg-red");
                }

                console.log("UV Index: " + oneAPIResult.current.uvi);

                for (let j = 0; j < 5; j++) {
                    const looper = oneAPIResult.daily[j];
                    var counter = 0;

                    counter = j;
                    console.log("Counter value (J): " + counter);

                    // Forecast Date
                    var today = moment().format("MMMM Do YYYY");
                    var forecastDate = moment()
                        .add(counter + 1, "days")
                        .format("MMMM Do YYYY");

                    idValue = "#forecastDate" + parseInt(counter);
                    console.log("Forecast id and date= " + forecastDate + "ID= " + idValue);
                    $(idValue).text(forecastDate);

                    idValue = "#forecastimage" + parseInt(counter);
                    var forecastIcon = $(idValue).attr(
                        "src",
                        "https://openweathermap.org/img/w/" +
                        oneAPIResult.daily[j].weather[0].icon +
                        ".png"
                    );
                    forecastIcon = $(idValue).addClass("card-img-top");
                    console.log("forecastIcon " + forecastIcon);
                    $(idValue).append(forecastIcon);

                    idValue = "#forecasthumidity" + parseInt(counter);
                    $(idValue).text("Humidity: " + oneAPIResult.daily[j].humidity);

                    var tempF = (oneAPIResult.daily[j].temp.day - 273.15) * 1.8 + 32;

                    $("#temp").text("Temperature (K) " + oneAPIResult.daily[j].temp);

                    idValue = "#forecasttemp" + parseInt(counter);

                    $(idValue).text("Temperature (F) " + tempF.toFixed(2));

                    var tempDiv = $("<div>")
                        .addClass("tempF")
                        .text(tempF.toFixed(2) + " Temperature (F)");
                    console.log("tempDiv " + tempDiv);
                }
            });
    }

    function init() {

        var storedCities = JSON.parse(localStorage.getItem("storedCities"));

        if (storedCities !== null) {
            cities = storedCities;

            lastSearched = JSON.parse(localStorage.getItem("lastCity"));
            cityEntered = lastSearched;

            getWeather();
        }
    }

    function storeCities() {

        localStorage.setItem("storedCities", JSON.stringify(cities));
        localStorage.setItem("lastCity", JSON.stringify(cityEntered));
    }
});