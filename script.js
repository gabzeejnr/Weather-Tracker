const buttonClicked = document.getElementById("search");
const cityInput = document.querySelector("#city-input");
let errorMessage = document.querySelector(".error-reply");
const tempValue = document.querySelector(".temp .main-value");
const humValue = document.querySelector(".humi .main-value");
const windValue = document.querySelector(".wind .main-value");

async function getCoordinates() {
    const city = document.getElementById("city-input").value.trim();
    if (!city) return;

    if (errorMessage) errorMessage.style.display = "none";

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;
    
    let data;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (errorMessage) {
                errorMessage.textContent = "Failed to fetch co-ordinates";
                errorMessage.style.display = "block";
            }
            throw new Error(`HTTP Error Status: ${response.status}`);
        }
        data = await response.json();
        console.log(data);
        errorMessage.innerHTML = "<span>Successfully fetched co-ordinates.<span>";
        errorMessage.style.cssText = `
        text-align: center;
        gap: .5rem;
        color: rgb(41, 233, 41)`;
    } catch (error) {
        console.error('Failed to get data:', error.message);
        return;
    }

    if (!data || !data.results || data.results.length === 0) {
        console.log("City not found");
        if (errorMessage) {
            errorMessage.textContent = "City not found. Try another search.";
            errorMessage.style.display = "block";
            errorMessage.style.color = "rgb(255, 50, 50)"
        }
        return;
    }
    const latitude = data.results[0].latitude;
    const longitude = data.results[0].longitude;

    getWeather(latitude, longitude);
}

//API CALL
async function getWeather(lat, lon) {
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m`;
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status}`)
        };
        errorMessage.innerHTML += "<span>Successfully fetched weather.</span>";

        const data = await response.json();
        console.log(data);

        const {
            temperature_2m,
            relative_humidity_2m,
            wind_speed_10m
        } = data.current;

        tempValue.textContent = `${temperature_2m} °C`;
        humValue.textContent = `${relative_humidity_2m}%`;
        windValue.textContent = `${wind_speed_10m} km/h`;
    } catch (error) {
        console.error('Failed to get data:', error.message);
    };
};

cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        getCoordinates();
    }
});

buttonClicked.addEventListener("click", () => {
    getCoordinates();
})


const date = document.querySelector(".date-left");
const time = document.querySelector(".time-right");

let month = "";

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

function getMonth(monthIndex) {
    switch (monthIndex) {
        case 1:
            month = "February";
            break;
        case 2:
            month = "March";
            break;
        case 3:
            month = "April";
            break;
        case 4:
            month = "May";
            break;
        case 5:
            month = "June";
            break;
        case 6:
            month = "July";
            break;
        case 7:
            month = "August";
            break;
        case 8:
            month = "September";
            break;
        case 9:
            month = "October";
            break;
        case 10:
            month = "November";
            break;
        case 11:
            month = "December";
            break;

        default:
            month = "January";
            break;
    }

    return month;
}
date.innerText += `Live Weather Tracker - ${getMonth(new Date().getMonth())}`;