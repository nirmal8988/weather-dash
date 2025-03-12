const apiKey = "8bdabd2dce266bdffd2af75db620d812";
const weatherIcons = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Snow: "❄️",
    Thunderstorm: "⛈️",
    Drizzle: "🌦️",
    Mist: "🌫️",
};
const aqiColors = ["#00E400", "#FFFF00", "#FF7E00", "#FF0000", "#8F3F97"];
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTYa1k04tUbyXM2vDga9wWrE3Ube027ak",
  authDomain: "weather-dash-50742.firebaseapp.com",
  projectId: "weather-dash-50742",
  storageBucket: "weather-dash-50742.firebasestorage.app",
  messagingSenderId: "1063691826892",
  appId: "1:1063691826892:web:53e2280ad0d8c1907b3469"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
async function fetchWeather(lat, lon) {
    try {
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );
        const weatherData = await weatherResponse.json();

        document.getElementById("location").innerHTML = `<div class="weather-icon">${weatherIcons[weatherData.weather[0].main] || "🌍"}</div><i class="fas fa-map-marker-alt"></i> ${weatherData.name}`;
        document.getElementById("temperature").innerHTML = `<div class="weather-icon">🌡️</div><i class="fas fa-thermometer-half"></i> ${weatherData.main.temp}°C`;
        document.getElementById("humidity").innerHTML = `<div class="weather-icon">💧</div><i class="fas fa-tint"></i> ${weatherData.main.humidity}%`;

        updateSpeedometer(weatherData.wind.speed);
        await fetchAQI(lat, lon);
        await fetchForecast(lat, lon);
        changeBackground(weatherData.weather[0].main);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Failed to fetch weather data. Please try again.");
    } finally {
        document.getElementById("loading-spinner").style.display = "none";
        document.getElementById("loading-message").style.display = "none";
    }
}

async function fetchAQI(lat, lon) {
    try {
        const aqiResponse = await fetch(
            `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
        const aqiData = await aqiResponse.json();
        const aqiValue = aqiData.list[0].main.aqi;
        const aqiStatus = ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqiValue - 1];
        document.getElementById("aqi").innerHTML = `<div class="weather-icon">🌫️</div><i class="fas fa-smog"></i> ${aqiStatus} (${aqiValue})`;
        renderAQIGraph(aqiValue);
    } catch (error) {
        console.error("Error fetching AQI data:", error);
        document.getElementById("aqi").innerHTML = `<div class="weather-icon">🌫️</div><i class="fas fa-smog"></i> AQI Unavailable`;
    }
}

async function fetchForecast(lat, lon) {
    try {
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );
        const forecastData = await forecastResponse.json();
        const forecastContainer = document.getElementById("forecast");
        forecastContainer.innerHTML = "";

        for (let i = 0; i < 5; i++) {
            const forecast = forecastData.list[i * 8];
            const date = new Date(forecast.dt * 1000).toLocaleDateString();
            const icon = weatherIcons[forecast.weather[0].main] || "🌍";
            const temp = forecast.main.temp;
            const description = forecast.weather[0].description;

            forecastContainer.innerHTML += `
                <div class="forecast-item">
                    <div class="weather-icon">${icon}</div>
                    <div>${date}</div>
                    <div>${temp}°C</div>
                    <div>${description}</div>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}

function renderAQIGraph(aqiValue) {
    const ctx = document.getElementById("aqi-graph").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["AQI"],
            datasets: [{
                label: "Air Quality Index",
                data: [aqiValue],
                backgroundColor: aqiColors[aqiValue - 1],
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return ["Good", "Fair", "Moderate", "Poor", "Very Poor"][value - 1];
                        }
                    }
                },
            },
        },
    });
}

function updateSpeedometer(speed) {
    const maxSpeed = 30;
    const rotation = (speed / maxSpeed) * 180 - 90;
    document.getElementById('wind-needle').style.transform = `rotate(${rotation}deg)`;
}

function generateShareLink() {
    const location = encodeURIComponent(document.getElementById("location").textContent);
    const temperature = encodeURIComponent(document.getElementById("temperature").textContent);
    const humidity = encodeURIComponent(document.getElementById("humidity").textContent);
    const aqi = encodeURIComponent(document.getElementById("aqi").textContent);

    const baseUrl = window.location.href.split("?")[0];
    const queryParams = new URLSearchParams({ location, temperature, humidity, aqi }).toString();
    const shareLink = `${baseUrl}?${queryParams}`;

    document.getElementById("share-link").value = shareLink;
    document.getElementById("share-link-container").classList.remove("hidden");
    document.querySelector('.social-share').classList.remove('hidden');
    document.getElementById("reset-button").classList.remove("hidden");
}

function shareViaWhatsApp() {
    const content = `Current Weather: ${document.getElementById("temperature").textContent}, 
    Humidity: ${document.getElementById("humidity").textContent}, 
    AQI: ${document.getElementById("aqi").textContent} - ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(content)}`);
}

function shareViaFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
}

function shareViaInstagram() {
    alert('Instagram sharing requires mobile app. Copy this link: ' + window.location.href);
}

function changeBackground(weatherCondition) {
    const gradients = {
        clear: "linear-gradient(to bottom, #87CEEB, #FFFFFF)",
        clouds: "linear-gradient(to bottom, #B0C4DE, #FFFFFF)",
        rain: "linear-gradient(to bottom, #4682B4, #FFFFFF)",
        snow: "linear-gradient(to bottom, #E0FFFF, #FFFFFF)",
    };
    document.body.style.background = gradients[weatherCondition.toLowerCase()] || gradients.clear;
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeather(latitude, longitude);
            },
            (error) => {
                console.error("Error getting location:", error);
                fetchWeather(51.5074, -0.1278);
            }
        );
    } else {
        fetchWeather(51.5074, -0.1278);
    }
}

document.getElementById("share-button").addEventListener("click", generateShareLink);
document.getElementById("share-link").addEventListener("click", () => {
    navigator.clipboard.writeText(document.getElementById("share-link").value);
    alert("Link copied to clipboard!");
});

document.getElementById("reset-button").addEventListener("click", () => {
    document.getElementById("share-link").value = "";
    document.getElementById("share-link-container").classList.add("hidden");
    document.querySelector('.social-share').classList.add('hidden');
    document.getElementById("reset-button").classList.add("hidden");
});

document.getElementById("loading-spinner").style.display = "block";
document.getElementById("loading-message").style.display = "block";
getLocation();
