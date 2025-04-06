const apiKey = "55ad90af73c7b309b655660b4c03de71";
  const weatherBackgrounds = {
    Clear: "url('https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80')",
    Clouds: "url('https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1200&q=80')",
    Rain: "url('https://images.unsplash.com/photo-1603034031582-d6bcd6000c47?auto=format&fit=crop&w=1200&q=80')",
    Snow: "url('https://images.unsplash.com/photo-1608889175119-6525b3f7b846?auto=format&fit=crop&w=1200&q=80')",
    Thunderstorm: "url('https://images.unsplash.com/photo-1505678261036-a3fcc5e884ee?auto=format&fit=crop&w=1200&q=80')",
    Mist: "url('https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80')",
    Haze: "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80')",
    Fog: "url('https://images.unsplash.com/photo-1490027351686-3700272290f0?auto=format&fit=crop&w=1200&q=80')",
    Smoke: "url('https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80')",
  };
  


const weatherIcons = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Snow: '❄️',
  Thunderstorm: '⛈️',
  Drizzle: '🌦️',
  Mist: '🌫️',
};

function getWeather() {
  const city = document.getElementById('cityInput').value;
  const resultDiv = document.getElementById('result');

  if (!city) {
    resultDiv.innerHTML = 'Please enter a city name.';
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  resultDiv.innerHTML = 'Loading...';

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('City not found');
      return response.json();
    })
    .then(data => {
      const temp = data.main.temp;
      const weather = data.weather[0].main;
      const humidity = data.main.humidity;
      const icon = weatherIcons[weather] || '🌈';

      resultDiv.innerHTML = `
        <p><strong>${data.name}</strong></p>
        <p>${icon} Temp: ${temp}°C</p>
        <p>☁️ Weather: ${weather}</p>
        <p>💧 Humidity: ${humidity}%</p>
      `;

      // 👇 Yeh part background change kar raha hai
      document.body.style.backgroundImage = weatherBackgrounds[weather] || "";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    })
    .catch(err => {
      resultDiv.innerHTML = 'City not found. Please try again.';
    );
}

function getWeatherByLocation() {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = 'Getting your location...';

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error('Location error');
            return response.json();
          })
          .then(data => {
            const temp = data.main.temp;
            const weather = data.weather[0].main;
            const humidity = data.main.humidity;
            const icon = weatherIcons[weather] || '🌈';

            resultDiv.innerHTML = `
              <p><strong>${data.name}</strong></p>
              <p>${icon} Temp: ${temp}°C</p>
              <p>☁️ Weather: ${weather}</p>
              <p>💧 Humidity: ${humidity}%</p>
            `;

            document.body.style.backgroundImage = weatherBackgrounds[weather] || "";
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center";
          })
          .catch(err => {
            resultDiv.innerHTML = 'Could not get weather for your location.';
          });
      },
      error => {
        resultDiv.innerHTML = 'Location access denied.';
      }
    );
  } else {
    resultDiv.innerHTML = 'Geolocation not supported by your browser.';
  }
}

