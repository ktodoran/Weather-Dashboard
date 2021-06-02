
//Declare Variable to Store Searched City
var city="";
// Misc Declared Variables
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidity= $("#humidity");
var currentWSpeed=$("#wind-speed");
var currentUVIndex= $("#uv-index");
var sCity=[];
// Searches Entry To See If It Exists In The Storage
function find(c){
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}
//API Key
var APIKey="a0aca8a89948154a4182dcecc780b513";
// Display Current and Future Weather
    function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}

function currentWeather(city){
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){
        console.log(response);
        var weatherIcon= response.weather[0].icon;
        var iconLink="https://openweathermap.org/img/wn/"+weatherIcon +"@2x.png";
        var date=new Date(response.dt*1000).toLocaleDateString();
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconLink+">");
        // Change temp to Fahrenheit
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2)+"&#8457");
        // Display the Humidity
        $(currentHumidity).html(response.main.humidity+"%");
        //Convert and Display Wind in MPH
        var ws=response.wind.speed;
        var windMPH=(ws*2.237).toFixed(1);
        $(currentWSpeed).html(windMPH+"MPH");

        UVIndex(response.coordinates.lon,response.coordinates.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityName"));
            console.log(sCity);
            if (sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityName",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityName",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}
// This function returns the UVI Index response.
function UVIndex(ln,lt){
    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(currentUVIndex).html(response.value);
            });
}
    
// Display the 5 Day Forecast
function forecast(city){
    var dayOver= false;
    var queryForecastURL="https://api.openweathermap.org/data/2.5/forecast?id="+city+"&appid="+APIKey;
    $.ajax({
        url:queryForecastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var icon= response.list[((i+1)*8)-1].weather[0].icon;
            var iconLink="https://openweathermap.org/img/wn/"+icon+".png";
            var tempK= response.list[((i+1)*8)-1].main.temp;
            var tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity= response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconLink+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fHumidity"+i).html(humidity+"%");
        }
        
    });
}

//Dynamically add the passed city on the search history
function addToList(c){
    var listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}
//Display last city if clicked
function invokePastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}

function loadLastCity(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityName"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityName"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}
//Clear the search history from the page
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityName");
    document.location.reload();

}
//Click Handlers
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadLastCity);
$("#clear-history").on("click",clearHistory);