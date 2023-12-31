function onClick(){

    lg = document.getElementById('log');      
    lg.innerHTML = "Starting :";
    
    
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        
        // for IOS devices
        document.getElementById("log").innerText = "IOS! ";
        
        // get device orientation sensor data
        DeviceOrientationEvent.requestPermission().then(response => {
            if (response === 'granted') {
                window.addEventListener('deviceorientation', OrientationHandler, true);
            }else if (result.state === 'prompt') {
                document.getElementById("log").innerText = "Need prompt!";
            }else{
                document.getElementById("log").innerText += "Not Supported!";
            }
        }).catch(console.error)
        
        // get accelerometer data
        DeviceMotionEvent.requestPermission().then(response => {
            if (response === 'granted') {
                window.addEventListener('devicemotion', MotionHandler, true);
            }else if (result.state === 'prompt') {
                document.getElementById("log").innerText = "Need prompt!";
            }else{
                document.getElementById("log").innerText += "Not Supported!";
            }
        }).catch(console.error)
        
    } else {
        
        // for non ios devices
        document.getElementById("log").innerText = "NonIOS! ";
        
        // get device orientation sensor data
        window.addEventListener('deviceorientation', OrientationHandler, true);
        // get accelerometer data
        window.addEventListener('devicemotion', MotionHandler, true);
    }

}

// Handlers for data

function OrientationHandler(eventData){

    // gamma is the left-to-right tilt in degrees
    document.getElementById('gamma').innerHTML = "gamma " + eventData.gamma;

    // beta is the front-to-back tilt in degrees
    document.getElementById('beta').innerHTML = "beta " + eventData.beta;

    // alpha is the compass direction the device is facing in degrees
    document.getElementById('alpha').innerHTML = "alpha " + eventData.alpha;
}

function MotionHandler(eventData){
    
    // Acceleration
    document.getElementById('accx').innerHTML = "accx " + eventData.acceleration.x;
    document.getElementById('accy').innerHTML = "accy " + eventData.acceleration.y;
    document.getElementById('accz').innerHTML = "accz " + eventData.acceleration.z;

    // Rotation rate
    document.getElementById('rotx').innerHTML = "rotx " + eventData.rotationRate.alpha;
    document.getElementById('roty').innerHTML = "roty " + eventData.rotationRate.beta;
    document.getElementById('rotz').innerHTML = "rotz " + eventData.rotationRate.gamma;
}
