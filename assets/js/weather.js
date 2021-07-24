Foundation.addToJquery($);
//initial city information to display display
var cityElem = "Fort Wayne";
//variable to prevent the initial page load search from showing up in recent searches (skip first run)
var queries = 0;
//load local storage items or set equal to empty array if nothing in localStorage
var searchedItemsArr = JSON.parse(localStorage.getItem("cities")) || [];

//Search city on user input
$("#search-city").click(function (event) {
    var cityToSearch = $("#user-search").val().trim();

    if (cityToSearch != "") {
        getCityCoordinates(cityToSearch);
    }
    else {
        $("#enter-city-modal").foundation();
        $("#enter-city-modal").foundation('open');
    }

    $("#user-search").val("");
});

//capture clicks on any button group elements from prior searches and fetch weather data for them.
$(".recent-searches").on("click", "button", function () {
    var buttonText = $(this).text();
    //set queries = 0 so it doesn't create a new recent search button or add it to recent searches
    queries = 0;
    getCityCoordinates(buttonText);
});

//get the latitude and longitude of the searched city and pass to function that gathers the weather information
function getCityCoordinates(city) {

    var coorApiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=7928ba41b57ce7723b35f96aa0990fef";

    fetch(coorApiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                queries++;
                //skip adding initial page load to searchedCities array
                if (queries != 1) {
                    searchedItemsArr.push(data.name);
                    saveRecentSearches();
                    addRecentSearches(data.name);
                }
                getCityWeather(data.coord.lat, data.coord.lon, data.name);
            });
        }
        else {
            //modal to alert them something went wrong
            $("#api-failure-modal").foundation();
            $("#api-failure-modal").foundation('open');
        }
    });

};

//grab the searched city's weather information
function getCityWeather(lat, long, name) {
    //empty current HTML contents of weather sections
    $("#current-weather").empty();
    $("#daily-weather").empty();

    var weatherAPILink = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + long + "&units=imperial&appid=7928ba41b57ce7723b35f96aa0990fef";

    fetch(weatherAPILink).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                //get current info from data
                var currentDay = moment(data.current.dt, "X").format("L");
                var cityInfo = (name + " (" + currentDay + ") ").toString();
                var currentIcon = "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png";
                var currentTemp = data.current.temp;
                var currentWind = data.current.wind_speed;
                var currentHumidity = data.current.humidity;
                var currentUV = data.current.uvi;

                //get next weather information day 1 loop through the array? yes
                for (var i = 1; i < 6; i++) {

                    var nextDate = moment(data.daily[i].dt, "X").format("L");
                    var nextIcon = "http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + "@2x.png";
                    var nextTemp = data.daily[i].temp.max;
                    var nextWind = data.daily[i].wind_speed;
                    var nextHumid = data.daily[i].humidity;
                    var nextUV = data.daily[i].uvi;

                    createFiveDayWeather(nextDate, nextIcon, nextTemp, nextWind, nextHumid, nextUV);
                }
                //pass current weather information to the current weather info box
                createCurrentWeatherInfo(cityInfo, currentIcon, currentTemp, currentWind, currentHumidity, currentUV);
            });
        }
        else {
            //modal to alert them something went wrong
            $("#api-failure-modal").foundation();
            $("#api-failure-modal").foundation('open');
        }
    });
};

//create current weather info box (take information from the api)
function createCurrentWeatherInfo(info, icon, temp, wind, humidity, uvi) {
    //create elements for main weather box
    var cityInfoElem = $("<h2>").text(info);
    var cityWeatherIconElem = $("<img>").attr("src", icon);
    var cityTempElem = $("<h5>").html("Temp: " + temp + "&#176;F");
    var cityWindElem = $("<h5>").html("Wind: " + wind + " MPH");
    var cityHumidElem = $("<h5>").html("Humidity: " + humidity + "%");
    var cityUVIElem = $("<h5>").text("UV Index: ");
    var cityUVIInfoElem = $("<span>").text(uvi);
    //apply class to UVI span element
    uviColor(uvi, cityUVIInfoElem);
    //append complimentary items prior to adding everything to info
    cityInfoElem.append(cityWeatherIconElem);
    cityUVIElem.append(cityUVIInfoElem);

    //append items to main weather info section
    $("#current-weather").append(cityInfoElem);
    $("#current-weather").append(cityTempElem);
    $("#current-weather").append(cityWindElem);
    $("#current-weather").append(cityHumidElem);
    $("#current-weather").append(cityUVIElem);
};

//create next weather info boxes
function createFiveDayWeather(date, icon, temp, wind, humidity, uvi) {
    //create elements for daily weather boxes
    var weatherCardCellElem = $("<div>").addClass("cell");
    var weatherCardElem = $("<div>").addClass("card flex-child-auto").attr("style", "margin: 10px 0px 10px 30px; padding: 10px;");
    var weatherCardDateElem = $("<h4>").text(date);
    var weatherCardIconElem = $("<img>").attr("src", icon);
    weatherCardIconElem.css("height", "60px");
    weatherCardIconElem.css("width", "60px");
    var weatherCardTempElem = $("<p>").html("Temp: " + temp + "&#176;F");
    var weatherCardWindElem = $("<p>").html("Wind: " + wind + " MPH");
    var weatherCardHumidElem = $("<p>").html("Humidity: " + humidity + "%");
    var weatherCardUVIElem = $("<p>").text("UV Index: ");
    var weatherCardUVISpanElem = $("<span>").text(uvi);

    uviColor(uvi, weatherCardUVISpanElem);

    weatherCardUVIElem.append(weatherCardUVISpanElem);

    weatherCardElem.append(weatherCardDateElem);
    weatherCardElem.append(weatherCardIconElem);
    weatherCardElem.append(weatherCardTempElem);
    weatherCardElem.append(weatherCardWindElem);
    weatherCardElem.append(weatherCardHumidElem);
    weatherCardElem.append(weatherCardUVIElem);

    weatherCardCellElem.append(weatherCardElem);

    $("#daily-weather").append(weatherCardCellElem);
};

//add a recent search to the page
function addRecentSearches(city) {
    //create search button
    var searchButton = $("<button>").addClass("button secondary").attr("style", "margin: 5px auto 15px auto").text(city);
    $("#recent-searches").append(searchButton);
};

//load recent searches to page
function loadRecentSearches() {
    $.each(searchedItemsArr, function (arr, object) {
        addRecentSearches(object);
    });
};

//save recent searches to local storage
function saveRecentSearches() {
    localStorage.setItem("cities", JSON.stringify(searchedItemsArr));
};

//clear recent searches and local storage
$("#clear-searches").click(function (event) {
    $("#recent-searches").empty();
    searchedItemsArr = [];
    saveRecentSearches();
});

//color the UV Index span element
function uviColor(uvi, uviElement) {
    //apply class to UVI span element
    if (uvi <= 2) {
        uviElement.addClass("is-low");
        uviElement.removeClass("is-moderate");
        uviElement.removeClass("is-high");
        uviElement.removeClass("is-very-high");
    }
    else if (uvi > 2 && uvi <= 5) {
        uviElement.removeClass("is-low");
        uviElement.addClass("is-moderate");
        uviElement.removeClass("is-high");
        uviElement.removeClass("is-very-high");
    }
    else if (uvi > 5 && uvi <= 7) {
        uviElement.removeClass("is-low");
        uviElement.removeClass("is-moderate");
        uviElement.addClass("is-high");
        uviElement.removeClass("is-very-high");
    }
    else {
        uviElement.removeClass("is-low");
        uviElement.removeClass("is-moderate");
        uviElement.removeClass("is-high");
        uviElement.addClass("is-very-high");
    }
};

//give page initial content
getCityCoordinates(cityElem);

//load past searches
loadRecentSearches();