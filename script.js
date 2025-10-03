const COUNTRY_API = 'https://api.sampleapis.com/countries/countries'
const LOCATION_API = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'

const searchInput = document.getElementById('search-input')
const searchButton = document.getElementById('search-button')
const weatherInfo = document.getElementById('weather-info')

async function getCountryFlagData() {
    const data = await fetch(COUNTRY_API)
    const map = new Map()
    for (const country of await data.json()) {
        map.set(country.abbreviation, country.media.flag)
    }
    return map
}

const flagData = await getCountryFlagData()

async function searchLocationData(searchString) {
    const sanitizedString = searchString
        .split(/\s+/)
        .map((string) => string.replace(/\W+/g, ''))
        .filter((string) => string !== '')
        .join('+')
    const url = `${LOCATION_API}?name=${sanitizedString}`
    return fetch(url).then((data) => data.json())
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
    if (locationData.results) {
        const firstMatch = locationData.results[0]
        const weatherData = await searchWeatherData({
            latitude: firstMatch.latitude,
            longitude: firstMatch.longitude,
            current: 'temperature_2mn'
        })
        const flag = flagData.get(firstMatch.country_code)
        weatherInfo.innerHTML = `
            ${firstMatch.name}
            <img height="20px" src="${flag}"/>:
            ${weatherData.current.temperature_2m}°C
        `
        console.log('Location Data:', locationData.results)
        console.log('Weather Data:', weatherData)
    }
    searchInput.value = ''
}

searchInput.onkeydown = (event) => {
    if (event.key === 'Enter') {
        searchButton.click()
    }
}