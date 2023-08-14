let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let oscillator=[];
let octaves=8;
cutoffFreq= 22000;
var musicOn=false;
let movement=false;

//let the variable threshHold be taken from querystring params, otherwise it's 5
let threshold = 5;
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.has('threshold')){
    threshold = urlParams.get('threshold');
    //convert threshold to a number
    threshold = +threshold;
}


function button1() {
    // Your code for function1 here
    console.log("You tapped the left half!");
    if (musicOn){
        stopTone()
    } else{
        playTone(0)
}   }


// Function to play the tone
function playTone(bearing) {
    
  const frequency = ((440/360)* bearing) + 440;
  const frequencyDisplay = document.getElementById("frequencyDisplay");

    consoleText = "";
  // If the oscillator has any elements, update its frequency
  if (oscillator.length > 0) {
    let consoleText = "frequency: " + frequency.toFixed(2) + "<br>";
    toRelocateLower=0;
    
    //freqsToPlay = [];
    for (let i = 0; i < octaves; i++){
        individualFrequency = frequency * (2 ** (i));
        if (individualFrequency>=cutoffFreq){
            toRelocateLower += 1;
            consoleText += "*" + individualFrequency.toFixed(2) + " -> "
            toTry = (2 ** toRelocateLower)
            //anotherToTry = (((individualFrequency % 880)/16) + 55)// * (4-i)
            individualFrequency = frequency /toTry;

            consoleText += " (" + toTry.toFixed(2)+ ") " 
            

        }
        //freqsToPlay.push(individualFrequency)
        consoleText += individualFrequency.toFixed(2) + "<br>"
        oscillator[i].connect(audioContext.destination);
        if (movement==false){
          individualFrequency=0;
        }

        oscillator[i].frequency.setValueAtTime(individualFrequency, audioContext.currentTime);
    }
if (musicOn==false){
    musicOn=true;
    }

frequencyDisplay.innerHTML = consoleText;
}
  // If the oscillator doesn't exist, create a new one
  else {
    console.log("creating a new oscillator set")
    musicOn=true;
    for (let i = 0; i < octaves; i++){
        individualFrequency = frequency * (2 ** (i));
        oscillator[i] = audioContext.createOscillator();
        oscillator[i].type = "square"; // You can experiment with different waveforms
        oscillator[i].frequency.setValueAtTime(individualFrequency, audioContext.currentTime);
        oscillator[i].connect(audioContext.destination);
        oscillator[i].start();
    }
  }
}



function stopTone() {
    for (let i = 0; i < octaves; i++){
      //oscillator[i].stop();
     oscillator[i].disconnect();
     // oscillator[i] = null;
    }
    musicOn=false;
  }
  
  // Check for DeviceOrientation API support
if ('DeviceOrientationEvent' in window) {
  window.addEventListener('deviceorientationabsolute', handleOrientation);
} else {
  alert('DeviceOrientationEvent is not supported on this browser.');
}

let bearing=0;
let rawBearing=0;
let oldBearing=0;
function handleOrientation(event) {
// Check if alpha (compass direction) is available
    

  bearing = 360 - event.alpha;

  rawBearing=event.alpha;
  // Round the bearing to an integer
  prettyBearing = Math.round(bearing);
  const bearingElement = document.getElementById('bearing');
  bearingElement.innerHTML = bearing;
  

  // Update the display
  //const bearingElement = document.getElementById('bearing');
  //bearingElement.textContent = prettyBearing + '° MusicOn: ' + musicOn;
  if (musicOn){
      playTone(bearing);
  }
}

//an interval that runs every 100 ms. If it notices a change in bearing greater than 10 degrees, it will log that to console

setInterval(function(){
  if (oldBearing > 127 && bearing <= 127) {
    oldBearing = 360 - oldBearing;
  }
  
  if (bearing > 127 && oldBearing <= 127) {
    newBearing = 360 - newBearing;
  }
  else{
    newBearing = bearing;
  }

  bearingChange = Math.abs(newBearing-oldBearing) 
  if (bearingChange>=threshold){
    movement=true;
    console.log("bearing change: " + (bearing-oldBearing));
    }else{
    movement=false;
  }
  oldBearing=bearing;
}, 100);
