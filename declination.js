function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById("location").innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    document.getElementById("location").innerHTML = `Latitude: ${latitude} <br>Longitude: ${longitude}`;

    // Call the function to calculate declination
    document.getElementById("declination").innerHTML="Declination: " + geomag.field(latitude, longitude).declination;
    console.log(geomag.field(latitude, longitude));
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById("location").innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById("location").innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            document.getElementById("location").innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById("location").innerHTML = "An unknown error occurred."
            break;
    }
}

function calculateDeclination(lat, lon) {
    // Here, you would make an API call to a service that provides magnetic declination
    // This is a placeholder; you'll need to replace it with a real API call
    fetch(`https://api.example.com/declination?lat=${lat}&lon=${lon}`)
    .then(response => response.json())
    .then(data => {
        document.getElementById("declination").innerHTML = `Declination: ${data.declination}`;
    })
    .catch(error => {
        document.getElementById("declination").innerHTML = "Error fetching declination data.";
        console.error('Error:', error);
    });
}
