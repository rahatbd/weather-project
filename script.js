const form = document.querySelector('form');
const weather = document.querySelector('.weather');

function renderWeather(data) {
    const {temp} = data.main;
    const {name} = data;
    const {main: condition, icon} = data.weather[0];
    weather.innerHTML = `
        <div>
            <p>${Math.round(temp)}°C</p>
            <p>${name}</p>
            <p>${condition}</p>
        </div>
        <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${condition} icon.">
    `;
}

function renderError(message) {
    weather.innerHTML = `
        <div class="error">
            <p>✘ Could not load weather data.</p>
            <p>${message}</p>
        </div>
    `;
}

async function fetchWeather(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
    const {ok, status, statusText} = response;
    if (!ok) throw new Error(`Status: ${status} — ${statusText || 'Weather data not available'}.`);
    return response.json();
}

async function handleSubmit(event) {
    event.preventDefault();
    const city = form.city.value.trim();
    if (!city) return renderError('Please enter a city name.');
    try {
        const data = await fetchWeather(city);
        renderWeather(data);
    } catch (error) {
        console.error(error);
        renderError(error.message);
    }
}

form.addEventListener('submit', handleSubmit);
