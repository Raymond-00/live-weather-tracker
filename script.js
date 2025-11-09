const apiKey = "5a8888e84335e1fb332f5be02ba912e6";
const btn = document.getElementById("getWeatherBtn");
const geoBtn = document.getElementById("geoBtn");
const cityInput = document.getElementById("cityInput");
const weatherInfo = document.getElementById("weatherInfo");
const ctx = document.getElementById("weatherChart").getContext("2d");

let chart;

// Fetch weather by city name
btn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeatherByCity(city);
});

// Fetch weather by geolocation
geoBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      err => {
        weatherInfo.textContent = "Unable to access location.";
      }
    );
  } else {
    weatherInfo.textContent = "Geolocation not supported.";
  }
});

async function fetchWeatherByCity(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    displayWeather(data);
  } catch (err) {
    weatherInfo.textContent = err.message;
    if (chart) chart.destroy();
  }
}

async function fetchWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    if (!res.ok) throw new Error("Location not found");
    const data = await res.json();
    displayWeather(data);
  } catch (err) {
    weatherInfo.textContent = err.message;
    if (chart) chart.destroy();
  }
}

function displayWeather(data) {
  const cityName = data.city.name;
  const country = data.city.country;
  const current = data.list[0].main;

  weatherInfo.innerHTML = `
    <strong>${cityName}, ${country}</strong><br/>
    Temperature: ${current.temp} °C<br/>
    Humidity: ${current.humidity}%<br/>
    Condition: ${data.list[0].weather[0].description}
  `;

  const labels = data.list.slice(0, 8).map(item =>
    new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  );
  const temps = data.list.slice(0, 8).map(item => item.main.temp);
  const humidity = data.list.slice(0, 8).map(item => item.main.humidity);

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temps,
          borderColor: "rgba(255,99,132,1)",
          backgroundColor: "rgba(255,99,132,0.2)",
          fill: true,
          tension: 0.3
        },
        {
          label: "Humidity (%)",
          data: humidity,
          borderColor: "rgba(54,162,235,1)",
          backgroundColor: "rgba(54,162,235,0.2)",
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      }
    }
  });
}