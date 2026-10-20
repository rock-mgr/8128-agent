async function getCurrentWeather() {
    // TODO: Use API api-open to use
    // axios to get the temperature/weather/psi
    // from data.gov.sg
    return {
        temperature: 25,
        unit:"c",
        condition:"sunny",
        psi:300
    }   
}

async function getCurrentLocation() {
    return "Singapore, Yishun";
}

module.exports = { 
    getCurrentLocation, getCurrentWeather
}