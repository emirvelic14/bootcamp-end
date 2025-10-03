const COUNTRY_API = 'https://api.sampleapis.com/countries/countries'
const LOCATION_API = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'
const WEATHER_PARAMETERS = [
    'temperature_2m',
    'wind_speed_10m',
    'relative_humidity_2m',
    'cloud_cover',
    'rain',
    'snowfall'
].join(',')

const searchInput = document.getElementById('search-input')
const searchButton = document.getElementById('search-button')
const matchList = document.getElementById('match-list')
const weatherBox = document.getElementById('weather-box')

const flagData = new Map()
const countryData = await fetch(COUNTRY_API)
for (const country of await countryData.json()) {
    flagData.set(country.abbreviation, country.media.flag)
}

async function searchLocationData(searchString) {
    const sanitizedString = searchString
        .split(/\s+/)
        .map((string) => string.replace(/\W+/g, ''))
        .filter((string) => string !== '')
        .join('+')
    if (sanitizedString !== '') {
        const url = `${LOCATION_API}?name=${sanitizedString}`
        return fetch(url).then((data) => data.json())
    }
}

async function searchWeatherData(options) {
    const optionsString = Object.entries(options)
        .map((option) => option.join('='))
        .join('&')
    const url = `${WEATHER_API}?${optionsString}`
    return fetch(url).then((data) => data.json())
}

searchButton.onclick = async () => {
    const locationData = await searchLocationData(searchInput.value)
    searchInput.value = ''
    matchList.innerHTML = ''
    weatherBox.innerHTML = ''
    if (locationData && locationData.results) {
        for (const location of locationData.results) {
            const matchElement = createMatchElement(location)
            matchList.appendChild(matchElement)
        }
    }
}

function createMatchElement(location) {
    const matchElement = document.createElement('li')
    const matchFlag = document.createElement('img')
    const matchName = document.createElement('h3')
    matchElement.className = 'match-element'
    matchFlag.className = 'match-flag'
    matchName.className = 'match-name'
    matchFlag.src = flagData.get(location.country_code)
    matchName.textContent = location.name
    matchElement.onclick = async () => {
        const weatherData = await searchWeatherData({
            latitude: location.latitude,
            longitude: location.longitude,
            current: WEATHER_PARAMETERS
        })
        searchInput.value = ''
        matchList.innerHTML = ''
        weatherBox.innerHTML = `
            ${location.name}
            ${weatherData.current.temperature_2m}°C
            ${weatherData.current.wind_speed_10m}->
            ${weatherData.current.relative_humidity_2m};
        `
    }
    matchElement.appendChild(matchFlag)
    matchElement.appendChild(matchName)
    return matchElement
}

searchInput.onkeydown = (event) => {
    if (event.key === 'Enter') {
        searchButton.click()
    }
}