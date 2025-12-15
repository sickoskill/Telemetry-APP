let running = false;
let time = 0;
let interval = null;
let intervalgeo = null;
let lat = 50.1;
let lon = 8.4;


function toggletimer() {
    running = !running;

    if (running) {
        interval = setInterval(() => {
            time += 10; 

            let ms = Math.floor((time % 1000) / 10);
            let sec = Math.floor(time / 1000) % 60;
            let min = Math.floor(time / 60000) % 60;
            let h   = Math.floor(time / 3600000);

            document.getElementById("stopwatch-value").innerText =
                format(h) + ":" + format(min) + ":" + format(sec) + "." + format(ms);

        }, 10);
    } else {
        clearInterval(interval);
        time = 0;
        document.getElementById("stopwatch-value").innerText = "00:00:00.00";
    }
}

function format(num) {
    if (num < 10) return "0" + num;
    return num;
}


let intervalGeo = setInterval(() => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
             lat = position.coords.latitude;
            lon = position.coords.longitude;


            document.getElementById("x-coord-value").innerText = lat;
            document.getElementById("y-coord-value").innerText = lon;
        },
        (error) => {
            document.getElementById("x-coord-value").innerText = "Error " + error;
            document.getElementById("y-coord-value").innerText = "Error " + error;

        },
        {
            enableHighAccuracy: true
        }
    );
}, 3000); 



function formatTime(date) {
    return date.toISOString().slice(0,16);
}

function getFutureData(data, minutesAhead) {
    const now = new Date(data.current.time);
    const target = new Date(now.getTime() + minutesAhead * 60 * 1000);
    const targetISO = formatTime(target);

    const index = data.hourly.time.findIndex(t => t.slice(0,16) === targetISO);

    if(index !== -1){
        return {
            time: data.hourly.time[index],
            temperature: data.hourly.temperature_2m[index],
            precipitation: data.hourly.precipitation[index],
            wind_speed: data.hourly.wind_speed_10m[index],
            humidity: data.hourly.relative_humidity_2m[index]
        };
    } else {
        return null;
    }
}
async function fetchWeather() {
    const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=Europe/Berlin` +
        '&current=temperature_2m,relative_humidity_2m,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m' +
        '&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,rain,showers,snowfall,weather_code,visibility,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,uv_index,surface_temperature,is_day' +
        '&daily=temperature_2m_max,uv_index_max';

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        document.getElementById("temperature-value").innerText = data.current.temperature_2m;
        console.log("Jetzt:", data.current.temperature_2m + "°C, Regen:", data.current.precipitation + "mm, Wind:", data.current.wind_speed_10m + "km/h, Luftfeuchtigkeit:", data.current.relative_humidity_2m + "%");

        const next1h = getFutureData(data, 60);
        const next5h = getFutureData(data, 300);

        if(next1h) console.log("In 1 Stunde:", next1h.temperature + "°C, Regen:", next1h.precipitation + "mm, Wind:", next1h.wind_speed + "km/h, Luftfeuchtigkeit:", next1h.humidity + "%");
        if(next5h) console.log("In 5 Stunden:", next5h.temperature + "°C, Regen:", next5h.precipitation + "mm, Wind:", next5h.wind_speed + "km/h, Luftfeuchtigkeit:", next5h.humidity + "%");

        console.log("==============================\n");

    } catch (error) {
        document.getElementById("temperature-value").innerText = "Error" + error;
    }
}

setInterval(fetchWeather, 3000);

function toggleweatherapp(){

}
