const form = document.querySelector('form');
const button = form.querySelector('button');
const weather = document.querySelector('.weather');
const forecast = document.querySelector('.forecast');

function imageLoadHandler(element) {
    element.querySelectorAll('img').forEach(img => img.addEventListener('load', () => (img.style.opacity = 1)));
}

function renderWeather(data) {
    const {temp} = data.main;
    const {name} = data;
    const {main, description, icon} = data.weather[0];

    weather.innerHTML = `
        <div>
            <p>${Math.round(temp)}°C</p>
            <p>${name}</p>
            <p>${main}</p>
        </div>
        <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${description}." width="200" height="200">
    `;

    imageLoadHandler(weather);
}

function renderForecast(data) {
    const today = new Date().toLocaleDateString('en-CA');
    const dates = {};
    const dayForecasts = [];
    const {list} = data;

    for (const item of list) {
        const [date, time] = item.dt_txt.split(' ');
        const {temp} = item.main;
        const {main, description, icon} = item.weather[0];
        if (!dates[date]) dates[date] = [];
        dates[date].push({time, temp, main, description, icon});
    }

    for (const [day, forecasts] of Object.entries(dates)) {
        if (day === today) continue;

        const iconCount = {};
        let totalTemp = 0;
        let dayForecast;

        for (const forecast of forecasts) {
            const {temp, icon} = forecast;
            totalTemp += temp;
            const count = (iconCount[icon] || 0) + 1;
            iconCount[icon] = count;
            if (!dayForecast || count > iconCount[dayForecast.icon]) dayForecast = forecast;
        }

        const avg = Math.round(totalTemp / forecasts.length);
        const {main, description, icon} = dayForecast;
        const [year, month, date] = day.split('-');
        const weekday = new Date(year, month - 1, date).toLocaleDateString('en-CA', {weekday: 'long'});
        dayForecasts.push({avg, main, description, icon, weekday});
    }

    forecast.innerHTML = dayForecasts
        .map(
            ({main, avg, icon, description, weekday}) => `
        <div class="card">
            <p>${main}</p>
            <p>${avg}°C</p>
            <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${description}." width="200" height="200">
            <p>${weekday}</p>
        </div>
    `,
        )
        .join('');

    imageLoadHandler(forecast);
}

function renderError(message) {
    weather.innerHTML = `<p class="error">✘ ${message}</p>`;
    forecast.replaceChildren();
}

async function fetchData(endpoint, city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&units=metric&appid=${API_KEY}`);
    const {ok, status} = response;
    if (!ok) {
        if (status === 404) throw new Error('City not found.');
        throw new Error('Unable to load weather data. Please try again.');
    }
    return response.json();
}

async function handleSubmit(event) {
    event.preventDefault();
    const city = form.city.value.trim();
    if (!city) return renderError('Please enter a city name.');
    button.textContent = 'Searching...';
    button.disabled = true;
    try {
        const [weatherData, forecastData] = await Promise.all([fetchData('weather', city), fetchData('forecast', city)]);
        renderWeather(weatherData);
        renderForecast(forecastData);
    } catch (error) {
        console.error(error);
        renderError(error.message);
    } finally {
        button.textContent = 'Search';
        button.disabled = false;
    }
}

form.addEventListener('submit', handleSubmit);
