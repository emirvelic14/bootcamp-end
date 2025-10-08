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
const weatherDetails = document.querySelector('.weather-details')
const container = document.querySelector('.container')
const notFound = document.querySelector('.not-found')

function getImagePath(name) {
    return `images/${name}.png`
}

let selectedLocation = null

hideWeather()
searchInput.focus()

const countryData = {}

async function getCountryData() {
    const data = await fetch(COUNTRY_API)
    for (const country of await data.json()) {
        countryData[country.abbreviation] = {
            name: country.name,
            flag: country.media.flag
        }
    }
    return countryData
}

getCountryData()

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

async function searchWeatherData(location) {
    const options = {
        latitude: location.latitude,
        longitude: location.longitude,
        current: WEATHER_PARAMETERS
    }
    const optionsString = Object.entries(options)
        .map((option) => option.join('='))
        .join('&')
    const url = `${WEATHER_API}?${optionsString}`
    return fetch(url).then((data) => data.json())
}

searchButton.onclick = async () => {
    if (!searchInput.value) {
        searchInput.focus()
        return
    }
    searchInput.blur()
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

        matchList.style.display = 'block'
        notFound.style.display = 'none'
    } else {

        notFound.style.display = 'block'
    }
}

function createMatchElement(location) {
    const matchElement = document.createElement('li')
    const matchButton = document.createElement('button')
    const matchName = document.createElement('p')
    matchElement.className = 'match-element'
    matchButton.className = 'match-button'
    matchName.className = 'match-name'
    matchName.innerHTML = getDetailedMatchName(location)
    matchButton.onclick = async () => {
        localStorage.setItem('location', JSON.stringify(location))
        selectedLocation = matchButton
        matchList.style.display = 'none'
        const weatherData = await searchWeatherData(location)
        updateWeather(location, weatherData.current)
    }
    matchButton.appendChild(matchName)
    const country = countryData[location.country_code]
    if (country?.flag) {
        const matchFlag = document.createElement('img')
        matchFlag.className = 'match-flag'
        matchFlag.src = country.flag
        matchFlag.alt = `Flag of ${country.name}`
        matchButton.appendChild(matchFlag)
        matchFlag.onerror = () => {
            matchButton.removeChild(matchFlag)
        }
    }
    matchElement.appendChild(matchButton)
    matchElement.title = country.name
    return matchElement
}

function getDetailedMatchName(location) {
    return `<b>${location.name}</b> ${[1, 2, 3, 4]
        .map((number) => location[`admin${number}`])
        .filter((string) => string !== undefined)
        .join(' - ')}`
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
    wind.textContent = `${parseInt(weatherData.wind_speed_10m)}km/h`

    showWeather()
    openContainer(true)
}

function openContainer(expandFully = false) {

    if (expandFully) {
        container.style.height = '520px'
    } else {
        container.style.height = '380px'
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
    if (data.cloud_cover > 90) {
        return 'cloudy'
    }
    if (data.cloud_cover > 40) {
        return 'mixed'
    }
    return 'sunny'
}

async function loadLocalStorage() {
    const storedValue = localStorage.getItem('location')
    if (storedValue) {
        const location = JSON.parse(storedValue)
        const weatherData = await searchWeatherData(location)
        updateWeather(location, weatherData.current)
    }
}

searchInput.onkeydown = (event) => {
    if (event.key === 'Enter') {
        searchButton.click()
    }
}

document.getElementById('location-name').onclick = () => {
    if (selectedLocation) {
        matchList.style.display = 'block'
        openContainer()
        hideWeather()
        selectedLocation.focus()
    }
}

loadLocalStorage()