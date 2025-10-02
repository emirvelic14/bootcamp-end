const LOCATION_API = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'

const searchInput = document.getElementById('search-input')
const searchButton = document.getElementById('search-button')

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
        const weatherData = await searchWeatherData({
            latitude: locationData.results[0].latitude,
            longitude: locationData.results[0].longitude,
            hourly: 'temperature_2mn'
        })
        console.log(weatherData)
    }
    searchInput.value = ''
}