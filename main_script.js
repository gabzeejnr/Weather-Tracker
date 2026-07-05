window.addEventListener("DOMContentLoaded", () => {
    navigator.geolocation.getCurrentPosition( position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        getWeather(lat, lon);
    },
    (error) => {
        console.error(error.message);
    });
});

import { weatherMap } from "./utils.js";

// ========================================
// DOM ELEMENTS ===========================
// ========================================

import {
    overlay, date, time,
    buttonClicked, cityInput, errorMessage,
    tempValue, humValue, windValue,
    weatherStateText, weatherStateIcon, tempFeels
} from "./selectors.js";

// MODE TOGGLE
const toggleBtn = document.querySelector("#theme-toggle");
document.querySelector("#year").textContent = new Date().getFullYear();

// ========================================
// APIS ===================================
// ========================================

// GETTING COORDINATES ========================
async function getCoordinates() {
    const city = cityInput.value.trim();
    if (!city) return;

    if (errorMessage) errorMessage.style.display = "none";

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;
    
    let data;
    try {
        overlay.style.display = "grid"
        const response = await fetch(url);
        if (!response.ok) {
            if (errorMessage) {
                errorMessage.textContent = "Failed to fetch co-ordinates";
                errorMessage.style.display = "block";
                overlay.style.display = "none"
            }
            throw new Error(`HTTP Error Status: ${response.status}`);
        }
        data = await response.json();
        console.log(data, "coordinates");
        errorMessage.innerHTML = "<span>Successfully fetched co-ordinates.<span>";
        errorMessage.style.cssText = `
        text-align: center;
        gap: .5rem;
        color: rgb(41, 233, 41)`;
    } catch (error) {
        console.error('Failed to get data:', error.message);
        return;
    }
    finally {
        buttonClicked.disabled = false;
    }

    if (!data || !data.results || data.results.length === 0) {
        console.log("City not found");
        if (errorMessage) {
            overlay.style.display = "none";
            errorMessage.textContent = "City not found. Try another search.";
            errorMessage.style.display = "block";
            errorMessage.style.color = "rgb(255, 50, 50)";

             weatherStateText.textContent = "";
        weatherStateIcon.classList = "";
            tempValue.textContent = "";
            tempFeels.textContent = "";
            humValue.textContent = "";
            windValue.textContent = "";
        }
        return;
    }
    const latitude = data.results[0].latitude;
    const longitude = data.results[0].longitude;

    getWeather(latitude, longitude);
}

// GETTING WEATHER ========================
async function getWeather(lat, lon) {
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,wind_speed_10m,relative_humidity_2m,weather_code`;
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status}`)
        };
        errorMessage.innerHTML += "<span>Successfully fetched weather.</span>";

        const data = await response.json();
        console.log(data, "weather");

        const {
            temperature_2m,
            apparent_temperature,
            relative_humidity_2m,
            wind_speed_10m,
            weather_code
        } = data.current;

        const weather = weatherMap[weather_code] ?? {
            text: "Unknown Weather",
            icon: "fa-circle-question"
        };

        weatherStateText.textContent = weather.text;
        weatherStateIcon.classList = `fa-solid ${weather.icon}`
        tempValue.textContent = `${temperature_2m} °C`;
        tempFeels.textContent = `Feels like ${apparent_temperature}°C`;
        humValue.textContent = `${relative_humidity_2m}%`;
        windValue.textContent = `${wind_speed_10m} km/h`;
    } catch (error) {
        console.error('Failed to get data:', error.message);
    }
    finally {
        overlay.style.display = "none";
    }
};

// ========================================
// EVENT LISTENERS ========================
// ========================================

// ENTER KEY ==============================

toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const themeIcon = toggleBtn.querySelector("i");
    
    themeIcon.className = document.body.classList.contains("dark-theme")
        ? "fa-solid fa-moon"
        : "fa-solid fa-sun";

});

cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        getCoordinates();
    }
});

// SEARCH BUTTON ==============================
buttonClicked.addEventListener("click", () => {
    buttonClicked.disabled = true;
    getCoordinates();
})

// ========================================
// DATE & TIME ============================
// ========================================

// TIME ===================================
function myClock() {
    setInterval(() => {
        const now = new Date();
        const dayName = new Intl.DateTimeFormat('en-Us', { weekday: "long" }).format(now);
        const DayNumber = now.getDate();

        const timeString = new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(now);

        time.textContent = `${dayName} ${DayNumber}, ${timeString}`;
    }, 1000)
}
myClock();

// MONTH ==================================
const month = new Intl.DateTimeFormat("en-US", {
    month: "long"
}).format(new Date());

date.innerText += `Live Weather Tracker - ${month}`;