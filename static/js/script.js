// 🌈 Weather-based backgrounds (day base, night CSS handle karega)
const backgrounds = {
  Clear: "linear-gradient(to right, #fceabb, #f8b500)",
  Clouds: "linear-gradient(to right, #bdc3c7, #2c3e50)",
  Rain: "linear-gradient(to right, #4e54c8, #8f94fb)",
  Fog: "linear-gradient(to right, #757f9a, #d7dde8)",
  Mist: "linear-gradient(to right, #757f9a, #d7dde8)",
  Snow: "linear-gradient(to right, #83a4d4, #b6fbff)",
  Thunderstorm: "linear-gradient(to right, #141e30, #243b55)",
  Drizzle: "linear-gradient(to right, #89f7fe, #66a6ff)"
};

/* ===============================
   🔍 SEARCH BY CITY
================================ */
function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const result = document.getElementById("result");

  if (!city) {
    result.innerHTML = "❗ Please enter a city name";
    return;
  }

  result.innerHTML = "⏳ Loading weather...";

  fetch(`/weather?city=${city}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        result.innerHTML = data.error;
        return;
      }

      renderWeatherUI(data);
      loadHourlyForecast(data.lat, data.lon);
      loadDailyForecast(data.lat, data.lon);
    });
}

/* ===============================
   📍 USE MY LOCATION
================================ */
function getWeatherByLocation() {
  const result = document.getElementById("result");
  result.innerHTML = "📍 Detecting your location...";

  if (!navigator.geolocation) {
    result.innerHTML = "❌ Geolocation not supported";
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;

    fetch(`/weather/location?lat=${latitude}&lon=${longitude}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          result.innerHTML = data.error;
          return;
        }

        renderWeatherUI(data);
        loadHourlyForecast(latitude, longitude);
        loadDailyForecast(latitude, longitude);
      });
  });
}

/* ===============================
   🌞 / 🌙 DAY–NIGHT THEME
================================ */
function applyDayNightTheme(time, sunrise, sunset) {
  const toMinutes = t => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const current = toMinutes(time.slice(-5));
  const rise = toMinutes(sunrise);
  const set = toMinutes(sunset);

  document.body.classList.remove("day", "night");

  if (current >= rise && current < set) {
    document.body.classList.add("day");
  } else {
    document.body.classList.add("night");
  }
}

/* ===============================
   🎨 MAIN UI RENDER
================================ */
function renderWeatherUI(data) {
  // base background
  document.body.style.background =
    backgrounds[data.weather] || "#eaeaea";

  // day / night
  applyDayNightTheme(data.time, data.sunrise, data.sunset);

  // weather-specific night themes
  document.body.classList.remove("rainy-night", "foggy-night");
  if (!document.body.classList.contains("day")) {
    if (data.weather === "Rain" || data.weather === "Thunderstorm") {
      document.body.classList.add("rainy-night");
    }
    if (data.weather === "Fog" || data.weather === "Mist") {
      document.body.classList.add("foggy-night");
    }
  }

  // sun / moon icon
  const isDay = document.body.classList.contains("day");
  const skyIcon = isDay ? "☀️" : "🌙";

  document.getElementById("result").innerHTML = `
    <div class="weather-info">
      <div style="font-size:40px; margin-bottom:6px;">${skyIcon}</div>
      <h3>${data.city}, ${data.country}</h3>

      <div class="temp">${data.temp}°C</div>
      <div class="meta">${data.weather}</div>
      <div class="meta">🕒 ${data.time}</div>

      <div class="extra">
        <div>💧 ${data.humidity}%</div>
        <div>🌅 ${data.sunrise}</div>
        <div>🌇 ${data.sunset}</div>
      </div>
    </div>

    <div class="hourly">
      <h4>Hourly Forecast</h4>
      <div class="hourly-scroll" id="hourly"></div>
    </div>

    <div class="daily">
      <h4>Daily Forecast</h4>
      <div id="daily"></div>
    </div>
  `;
}

/* ===============================
   ⏱️ HOURLY FORECAST
================================ */
function loadHourlyForecast(lat, lon) {
  fetch(`/forecast?lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(list => {
      const box = document.getElementById("hourly");
      box.innerHTML = "";

      list.slice(0, 6).forEach((item, i) => {
        const card = document.createElement("div");
        card.className = "hour-card";
        card.style.animationDelay = `${i * 0.12}s`;

        card.innerHTML = `
          <div><strong>${item.time}</strong></div>
          <div>🌡️ ${item.temp}°C</div>
          <div>${item.weather}</div>
        `;

        box.appendChild(card);
      });
    });
}

/* ===============================
   📅 DAILY FORECAST
================================ */
function loadDailyForecast(lat, lon) {
  fetch(`/forecast/daily?lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(days => {
      const dailyBox = document.getElementById("daily");
      dailyBox.innerHTML = "";

      days.forEach(d => {
        const date = new Date(d.date).toDateString().slice(0, 10);

        dailyBox.innerHTML += `
          <div class="daily-card">
            <div>${date}</div>
            <div>${d.weather}</div>
            <div>🌡️ ${d.temp}°C</div>
          </div>
        `;
      });
    });
}

/* ===============================
   📱 MOBILE SWIPE GESTURE
================================ */
let startX = 0;

document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  const diff = endX - startX;

  if (diff > 80) {
    // swipe right → refresh location
    getWeatherByLocation();
  }
  if (diff < -80) {
    // swipe left → focus search
    document.getElementById("cityInput")?.focus();
  }
});

/* ===============================
   🌍 AUTO LOAD ON START
================================ */
window.onload = () => {
  getWeatherByLocation();
};





