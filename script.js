const COUNTRY_API = 'https://api.sampleapis.com/countries/countries'
const LOCATION_API = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'
const WEATHER_PARAMETERS = [
    'temperature_2m',
    'wind_speed_10m',
    'relative_humidity_2m',
    'cloud_cover',
    'rain',
    'snowfall',
].join(',')

const searchInput = document.getElementById('search-input')
const searchButton = document.getElementById('search-button')
const matchList = document.getElementById('match-list')
const weatherBox = document.getElementById('weather-box')
const weatherDetails = document.querySelector('.weather-details')
const container = document.querySelector('.container')
const notFound = document.querySelector('.not-found')

hideWeather()

function getImagePath(name) {
    return `images/${name}.png`
}

async function getCountryData() {
    const data = await fetch(COUNTRY_API)
    const countryData = {}
    for (const country of await data.json()) {
        countryData[country.abbreviation] = {
            name: country.name,
            flag: country.media.flag
        }
    }
    return countryData
}

const countryData = await getCountryData()

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

    openContainer()
    hideWeather()
    if (locationData && locationData.results) {
        for (const location of locationData.results) {
            const matchElement = createMatchElement(location)
            matchList.appendChild(matchElement)
        }

        notFound.style.display = 'none'
    } else {

        notFound.style.display = 'block'
        matchList.innerHTML = ''
    }
}

function createMatchElement(location) {
    const matchElement = document.createElement('li')
    const matchName = document.createElement('button')
    const matchFlag = document.createElement('img')
    matchElement.className = 'match-element'
    matchName.className = 'match-name'
    matchFlag.className = 'match-flag'
    matchName.textContent = location.name
    matchName.onclick = async () => {
        matchList.innerHTML = ''
        const weatherData = await searchWeatherData({
            latitude: location.latitude,
            longitude: location.longitude,
            current: WEATHER_PARAMETERS
        })
        updateWeather(location, weatherData.current)
    }
    const country = countryData[location.country_code]
    matchFlag.src = country.flag
    matchFlag.alt = country.name
    matchElement.appendChild(matchName)
    matchElement.appendChild(matchFlag)
    return matchElement
}

function updateWeather(location, weatherData) {
    const weatherImage = document.getElementById('weather-image')
    const weatherType = computeWeatherType(weatherData)
    weatherImage.src = getImagePath(weatherType)
    weatherImage.alt = `${weatherType} weather`
    const temperature = document.getElementById('temperature')
    temperature.textContent = `${parseInt(weatherData.temperature_2m)}°C`
    const locationName = document.getElementById('location-name')
    locationName.textContent = location.name
    const humidity = document.getElementById('humidity')
    humidity.textContent = `${weatherData.relative_humidity_2m}%`
    const wind = document.getElementById('wind')
    wind.textContent = `${weatherData.wind_speed_10m}km/h`

    showWeather()
    openContainer(true)
}

function openContainer(expandFully = false) {

    if (expandFully) {
        container.style.maxHeight = '520px'
    } else {
        container.style.maxHeight = '360px'
    }
    container.style.boxShadow = '0 18px 50px rgba(16,24,40,0.45)'
}

function hideWeather() {
    weatherBox.style.display = 'none'
    weatherDetails.style.display = 'none'
}

function showWeather() {
    weatherBox.style.display = 'block'
    weatherDetails.style.display = 'flex'
    notFound.style.display = 'none'
}

function computeWeatherType(data) {
    if (data.snow > 0) {
        return 'snowy'
    }
    if (data.rain > 0) {
        return 'rainy'
    }
    if (data.cloud_cover > 80) {
        return 'cloudy'
    }
    if (data.cloud_cover > 30) {
        return 'mixed'
    }
    return 'sunny'
}

searchInput.onkeydown = (event) => {
    if (event.key === 'Enter') {
        searchButton.click()
    }
}