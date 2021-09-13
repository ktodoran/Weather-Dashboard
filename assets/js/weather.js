$(document).ready(function () {
    // Global Variables

    // API key
    var APIKey = "2e7106f9963865fdfaacade04c8a3b8e";

    var citiesInput = document.querySelector("#citiesText");
    var citiesForm = document.querySelector("#citiesForm");
    var citiesList = document.querySelector("#citiesList");
    var citiesCountSpan = document.querySelector("#citiesCount");
    var cityEntered = "";
    var lastSearched = "";

    var idValue = "";

    var cities = [];

    // retrieve today's date using moment and format for output
    var today = moment().format("MMMM Do YYYY");

    // retrieve local storage
    init();

    renderCities();

    function renderCities() {
        // Clear citiesList element and update citiesCountSpan
        citiesList.innerHTML = "";
        citiesCountSpan.textContent = cities.length;

        // Render a new li for each city
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

    // When an element inside of the City List is clicked...
    citiesHistory.addEventListener("click", function (event) {
        event.preventDefault();

        var element = event.target;
        console.log(element); ``

        // If that element is a button...
        if (element.matches("button") === true) {
            // Get its data value and display forecast for that City
            var citySelected = element.parentElement.getAttribute("data-city");
            console.log(citySelected);

            // Call the function to retrieve the weather for the city entered in the search
            cityEntered = citySelected;
            getWeather();

            // Re-render the list
            renderCities();
        }
    });

    // When form is submitted for a newly searched City
    citiesForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var citiesText = citiesInput.value.trim();

        // Return from function early if submitted citiesText is blank
        if (citiesText === "") {
            return;
        }

        // Add new citiesText to cities array

        if (!cities.includes(citiesText)) {
            cities.push(citiesText);
        }

        citiesInput.value = "";
        cityEntered = citiesText;
        lastSearched = citiesText;

        // Call the function to retrieve the weather for the city entered in the search
        getWeather();

        // Re-render the list
        renderCities();
    });

    function getWeather() {
        console.log(cityEntered);

        var searchCity = cityEntered;

        console.log("This is the value of Search City" + searchCity);
        // Here we are building the URL we need to query the database
        var queryURL =
            "https://api.openweathermap.org/data/2.5/weather?q=" +
            searchCity +
            "&appid=" +
            APIKey;

        // Log the queryURL
        console.log(queryURL);
        // Here we run our AJAX call to the OpenWeatherMap API

        $.ajax({
            url: queryURL,
            method: "GET",
        })
            // Store all of the retrieved data in object called "apiResult"
            .then(function (apiResult) {
                $("col-sm-10 text-left");

                // Log the resulting object
                console.log(apiResult);

                // Transfer content to HTML
                var cityName = apiResult.name;
                cityName = cityName + " (" + today + ") ";
                $("#cardtitle").text(cityName);

                $("#wind").text("Wind Speed: " + apiResult.wind.speed);
                $("#humidity").text("Humidity: " + apiResult.main.humidity);

                // Convert the temp to fahrenheit
                var tempF = (apiResult.main.temp - 273.15) * 1.8 + 32;

                // add temp content to html
                $("#temp").text("Temperature (K) " + apiResult.main.temp);
                $("#tempF").text("Temperature (F) " + tempF.toFixed(2));

                var tempFdiv = $("<div>")
                    .addClass("tempF")
                    .text(tempF.toFixed(2) + " Temperature (F)");
                console.log("tempFdiv " + tempFdiv);

                // Build and display the icon
                var newIcon = $("#cardimage").attr(
                    "src",
                    "https://openweathermap.org/img/w/" +
                    apiResult.weather[0].icon +
                    ".png"
                );
                newIcon = $("#cardimage").addClass("card-img-top");
                console.log("newIcon " + newIcon);
                $("#cardimage").append(newIcon);

                // Use the latitude and longitude to get the UV Index
                getUVIndex(apiResult);
            });
    }

    function getUVIndex(apiResult) {
        console.log(apiResult);
        // Same API Key for latitude longitude
        var savedResult = apiResult;

        console.log("Saved Variable Results passed to getUVINdex" + savedResult);
        console.log("Try for LAT:" + apiResult.coord.lat);
        console.log("Try for LON:" + apiResult.coord.lon);

        // Here we are building the URL we need to query the database with lattitude and longitude
        var uvQueryRL =
            "https://api.openweathermap.org/data/2.5/onecall?lat=" +
            apiResult.coord.lat +
            "&lon=" +
            apiResult.coord.lon +
            "&exclude=hourly,minutely&appid=" +
            APIKey;

        // Log the queryURL
        console.log("URL With LAT & LON" + uvQueryRL);

        // AJAX call to the OpenWeatherMap OneCall API
        $.ajax({
            url: uvQueryRL,
            method: "GET",
        })
            // Returned data stored in an object we are calling "onecallapiResult"
            .then(function (onecallapiResult) {
                // Log the resulting object
                console.log(onecallapiResult);

                // Add the UVindex to the HTML
                $("#uvindex").text(onecallapiResult.current.uvi);

                //  check value and colorize according to requirement
                if (onecallapiResult.current.uvi < 2) {
                    $("#uvindex").addClass("bg-green");
                }

                if (
                    onecallapiResult.current.uvi >= 2.01 &&
                    onecallapiResult.current.uvi <= 5.0
                ) {
                    $("#uvindex").addClass("bg-yellow");
                }

                if (onecallapiResult.current.uvi >= 5.01) {
                    $("#uvindex").addClass("bg-red");
                }

                // Log the data in the console as well
                console.log("UV Index: " + onecallapiResult.current.uvi);

                // Now loop through the forecast array and display five days of forecast
                for (let j = 0; j < 5; j++) {
                    const looper = onecallapiResult.daily[j];
                    var counter = 0;

                    counter = j;
                    console.log("Counter value (J): " + counter);

                    // Build the card html

                    // Forecast Date
                    var today = moment().format("MMMM Do YYYY");
                    var forecastDate = moment()
                        .add(counter + 1, "days")
                        .format("MMMM Do YYYY");

                    idValue = "#forecastDate" + parseInt(counter);
                    console.log("Forecast id and date= " + forecastDate + "ID= " + idValue);
                    $(idValue).text(forecastDate);

                    // Next is the weather forecast icon
                    idValue = "#fcstimage" + parseInt(counter);
                    var fcstIcon = $(idValue).attr(
                        "src",
                        "https://openweathermap.org/img/w/" +
                        onecallapiResult.daily[j].weather[0].icon +
                        ".png"
                    );
                    fcstIcon = $(idValue).addClass("card-img-top");
                    console.log("fcstIcon " + fcstIcon);
                    $(idValue).append(fcstIcon);

                    idValue = "#fcsthumidity" + parseInt(counter);
                    $(idValue).text("Humidity: " + onecallapiResult.daily[j].humidity);

                    // Convert the temp to fahrenheit
                    var tempF = (onecallapiResult.daily[j].temp.day - 273.15) * 1.8 + 32;

                    // add temp content to html
                    $("#temp").text("Temperature (K) " + onecallapiResult.daily[j].temp);

                    idValue = "#fcsttemp" + parseInt(counter);

                    $(idValue).text("Temperature (F) " + tempF.toFixed(2));

                    var tempFdiv = $("<div>")
                        .addClass("tempF")
                        .text(tempF.toFixed(2) + " Temperature (F)");
                    console.log("tempFdiv " + tempFdiv);
                }
            });
    }

    function init() {
        // Get stored cities from localStorage - parsing the JSON to the array

        var storedCities = JSON.parse(localStorage.getItem("storedCities"));

        // If Cities were retrieved from localStorage, update the Cities array
        if (storedCities !== null) {
            cities = storedCities;

            lastSearched = JSON.parse(localStorage.getItem("lastCity"));
            cityEntered = lastSearched;

            getWeather();
        }
    }

    function storeCities() {
        // Stringify and set localStorage to Cities array and last city searched

        localStorage.setItem("storedCities", JSON.stringify(cities));
        localStorage.setItem("lastCity", JSON.stringify(cityEntered));
    }
});