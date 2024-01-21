
let declination = 0;



let stinger={};
stinger["north"]={};
stinger["south"]={};
stinger["east"]={};
stinger["west"]={};
//format is file, degree at which it's meant to be played, cent adjustment
//position 0° aka North is A, 90° aka East is C, 180° aka South is D#, 270° aka West is F#
let files={
  "chord_organ.wav": {position:0, centAdjustment:0},
  "chord_strings_low.wav": {position:0, centAdjustment:10},
  "chord_strings_high.wav": {position:0, centAdjustment:2},
  "chord_vox_low.wav": {position:0, centAdjustment:32},
  "chord_vox_high.wav": {position:0, centAdjustment:0},
  "chord_8_bit.wav": {position:0, centAdjustment:14},
  "north01.wav": {position: 0, centAdjustment: 0},
  "east01.wav": {position:90, centAdjustment: 0},
  "south01.wav": {position:180, centAdjustment: 0},
  "west01.wav": {position:270, centAdjustment: 0},
  "tubularBellsHitA.wav": {position:0, centAdjustment:0},
  "vibraphoneHitC.wav": {position:90, centAdjustment:0},
  "xylophoneHitDsharp.wav": {position:180, centAdjustment:0},
  "celestaHitFsharp.wav": {position:270, centAdjustment:0}
  };


let stingerSets={
  "Classic":{
    "north": "north01.wav",
    "east": "east01.wav",
    "south": "south01.wav",
    "west": "west01.wav",
  },
  "Mallet":{
    "north": "tubularBellsHitA.wav",
    "east": "vibraphoneHitC.wav",
    "south": "xylophoneHitDsharp.wav",
    "west": "celestaHitFsharp.wav",
  }
}





function changeChordVoicesToLoad(){
  chordVoicesToLoad = [];
  for (i = 0; i < 3; i++) {
    if (document.getElementById("chordVoice" + i).checked == true) {
      chordVoicesToLoad.push(i);
    }
  }
}

//set up listeners
for (i = 0; i < 3; i++) {
  document.getElementById("chordVoice" + i).addEventListener("change", function() {
    changeChordVoicesToLoad();
    loadChord(chordFileSelect.value,chordVoicesToLoad);
  });
}


function loadStinger(stingerSet){
  WebAudiox.loadBuffer(context, stingerSets[stingerSet]["north"], function(buffer){
    stinger["north"]["bufferData"] = buffer;
  });

  WebAudiox.loadBuffer(context, stingerSets[stingerSet]["east"], function(buffer){
    stinger["east"]["bufferData"] = buffer;
  });

  WebAudiox.loadBuffer(context, stingerSets[stingerSet]["south"], function(buffer){
    stinger["south"]["bufferData"] = buffer;
  });

  WebAudiox.loadBuffer(context, stingerSets[stingerSet]["west"], function(buffer){
    stinger["west"]["bufferData"] = buffer;
  });
}

let context;
let tuna;
let lineOut;
let preFXbus;

let overdrive;
let delay;

//remember that you have to work backwards with audio nodes. We create them in reverse below.
//stinger -> shared stinger gain stage -> pre fx bus gain stage -> lineOut
//when the effect is applied:
//stinger -> shared stinger gain stage -> pre fx bus gain stage -> fx -> lineOut

function initAudio(){

  // create WebAudio API context
  context = new AudioContext();
  tuna = new Tuna(context);
  // Create lineOut
  lineOut = new WebAudiox.LineOut(context)

  //fx bus
    
  overdrive = new tuna.Overdrive({
    outputGain: -1,         //0 to 1+
    drive: 1,              //0 to 1
    curveAmount: 0.1,          //0 to 1
    algorithmIndex: 2,       //0 to 5, selects one of our drive algorithms
    bypass: 0
  });
  overdrive.connect(lineOut.destination);


  delay = new tuna.Delay({
    feedback: 0.4,    //0 to 1+
    delayTime: 300,    //1 to 10000 milliseconds
    wetLevel: 1,     //0 to 1+
    dryLevel: 1,       //0 to 1+
    cutoff: 20000,      //cutoff frequency of the built in lowpass-filter. 20 to 22050
    bypass: false
  });
  delay.connect(overdrive);

  //create a pre-fx bus


  preFXbus = context.createGain();
  preFXbus.connect(delay);
  //create a stinger bus



  
  loadStinger("Classic");


  console.log("playing");
  let clickHereID = document.getElementById("taphere");
  clickHereID.innerHTML = "Playing.";
  
  loadChord(chordFileSelect.value,chordVoicesToLoad);

    

}

let debug=false
//if querystring contains debug=true then set the innerHTML of sliderContainer to this: '<input type="range" min="0" max="1000" value="360" class="slider" onmousedown="button1()" id="slider">'
if (window.location.search.includes("debug=true")) {
  document.getElementById("sliderContainer").innerHTML = '<input type="range" min="0" max="1000" value="360" class="slider" id="slider">';
  debug=true
}





let chordPitchShiftFactor = 1;
var modulus=0;




function toggleMute(){
  for (i = 0; i < sound.length; i++) {
    sound[i].mute(!sound[i]._muted);
  }
  let clickHereID = document.getElementById("taphere");
  if (clickHereID.innerHTML == "tap compass to start") {
    clickHereID.innerHTML = "tap compass to mute";
  } else {
    clickHereID.innerHTML = "tap compass to start";
  }
}


started=false;

const terriblecompass = document.getElementById("terriblecompass");

let sound=[];   
let noteOffsets=[]; 
for (i = 0; i < 13; i++) {
  noteOffsets.push(((2**(1/12))**i)); //this has to do with equal temprament
}

var chordRates=[];

function loadChord(chordFile,whichNotes){//whichNotes is an array of numbers that correspond to the notes in the chord. 0 is the root, 1 is the third, 2 is the fifth, etc.
  //first let's define the base chord. Below is a major chord

  possibleChordRates=[noteOffsets[0], noteOffsets[4], noteOffsets[7]]; //a major chord
  baseChordRates=[];
  for (i=0; i<whichNotes.length; i++){
    baseChordRates.push(possibleChordRates[whichNotes[i]]);

  }
  //baseChordRates=[noteOffsets[0]]; //a single note
  //half and double each of these and add all nine to chordRates

  chordRates=[];
  for (i = 0; i < baseChordRates.length; i++) {//each one of these below is an octave. You need at least 2 to do the Shepard tone illusion but 3+ makes it smoother.I find this arrangement is best for solo voices at least
  // chordRates.push(baseChordRates[i]/8);
    chordRates.push(baseChordRates[i]/4);
    chordRates.push(baseChordRates[i]/2);
    chordRates.push(baseChordRates[i]);
  //  chordRates.push(baseChordRates[i]*2);
  // chordRates.push(baseChordRates[i]*4);
    //chordRates.push(baseChordRates[i]*2);
    
  }
  //sort this array by size
  chordRates.sort(function(a, b){return a - b});

  //const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  //const bus = audioContext.createGain();
  //bus.connect(audioContext.destination);
  if (files[chordFile].centAdjustment) {
    chordPitchShiftFactor = 2 ** (files[chordFile].centAdjustment / 1200); // 1200 cents in an octave
  } 
  console.log(chordFile);
  WebAudiox.loadBuffer(context, chordFile, function(buffer){
    //stop and disconnect any sounds if present
    for (i = 0; i < sound.length; i++) {
      if (sound[i] && sound[i]["bufferSource"]) {//if there's already an instrument playing, stop and disconnect it before we overwrite.
        sound[i]["bufferSource"].stop();
        sound[i]["bufferSource"].disconnect();
      }
    }
    sound=[];
    for (i=0; i<chordRates.length; i++){
      sound[i] ={};
      sound[i]["bufferSource"] = context.createBufferSource();
      sound[i]["gain"] = context.createGain();
      sound[i]["bufferSource"].connect(sound[i]["gain"]);
      sound[i]["gain"].connect(preFXbus);
      sound[i]["bufferSource"].loop = true;
      sound[i]["gain"].gain.value = chordVolume;
      sound[i]["bufferSource"].playbackRate.value = chordRates[i] * chordPitchShiftFactor;
      // init AudioBufferSourceNode
      sound[i]["bufferSource"].buffer = buffer;
      // start the sound now
      sound[i]["bufferSource"].start(0);
  
    }
    directionChanged();
  });
}


function playStinger(chordPos){
  console.log("chordPos: " , chordPos)
  let direction = compassDirectionToSpecificName(globalBearing);
  //if chordPos is a number higher than the length of baseChordRates, do nothing
  if (chordPos >= direction.length) { //you clicked a blank square
    console.log("HARUMPH!")
  }else{
    directionToSing=direction[chordPos];
    //if N, change to north, etc.
    if (directionToSing == "N") {
      directionToSing = "north";
    }
    if (directionToSing == "E") {
      directionToSing = "east";
    }
    if (directionToSing == "S") {
      directionToSing = "south";
    }
    if (directionToSing == "W") {
      directionToSing = "west";
    }
    mySliderValue = parseInt(globalBearing);
   
   //south and west are the lower octave, north and east are the higher octave
    var position = files[directionToSing + "01.wav"]["position"];
    mySliderValue = mySliderValue - files[directionToSing + "01.wav"]["position"]; 
    let modulation = 2 ** (mySliderValue / 360 )
    
    //play a single note
    i = chordPos;
    var finalRate=baseChordRates[i] * modulation * chordPitchShiftFactor;
    console.log("global Bearing: " , globalBearing, "mySliderValue: " , mySliderValue, "directionToSing: " , directionToSing);
   console.log(baseChordRates[i], modulation, chordPitchShiftFactor, "finalRate: " , finalRate, " position: " , position);
    //console.log(finalRate)

    // Create a new buffer source for the stinger
    let source = context.createBufferSource();
    let gainNode = context.createGain();
    source.connect(gainNode);
    gainNode.connect(preFXbus);

    // I want each instance of the sound to set its own volume so we don't mess with the beautiful feedback dynamics we've got going in the
    source.buffer = stinger[directionToSing]["bufferData"];
    source.playbackRate.value = finalRate;
    
    gainNode.gain.value = stingerVolume;
    
    source.onended = function () {
      source.disconnect();
      source.onended = null; // Remove the event listener to prevent memory leaks
    };
    source.start(0);


  }
}


function compassDirectionToSpecificName(direction) {
  // Define the cardinal and intermediate directions
  const directions = [
    "N", "NNE", "NE", "ENE",
    "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW",
    "W", "WNW", "NW", "NNW"
  ];

  // Calculate the index based on the direction
  const index = Math.round(((direction % 360) / 22.5)) % 16;

  // Get the specific direction name
  return directions[index];
}
  

function directionChanged(){
  modulus=globalBearing;
  const HTMLconsole = document.getElementById("console");
  //modulation = modulus / 360 + 1; // old, non-equal-tempered version
  //instead let's do an equal-tempered version
  let modulation = 2 ** (modulus / 360 )
  for (i = 0; i < chordRates.length; i++) { 
    let myValue = chordRates[i] * modulation * chordPitchShiftFactor;
    //console.log(myValue);
    sound[i]["bufferSource"].playbackRate.value= myValue; 
  }
  terriblecompass.style.transform = `rotate(${360-modulus}deg)`

  //hertz = 440 * modulation;

  //ILLUSION CREATED HERE
  //for the highest element in sound[]: the volume should decrease to 0 as the slider value approaches 360
  //likewise the lowest element in sound[]: the volume should increase to 1 as the slider value approaches 360
  fade =modulus/360;

  for (i = 0; i < baseChordRates.length; i++) {
    sound[i]["gain"].gain.value=(chordVolume * fade);
  }

  //now let's do the same with the top three sounds in the array
  for (i = sound.length-baseChordRates.length; i < sound.length; i++) {
    sound[i]["gain"].gain.value=(chordVolume * (1- fade));
  }



  HTMLconsole.innerHTML = ", Heading: " + parseInt(modulus) + "°";
  let finalDirection = compassDirectionToSpecificName(modulus);
  let letter=[];
  letter[0] = document.getElementById("letter0");
  letter[1] = document.getElementById("letter1");
  letter[2] = document.getElementById("letter2");
  for (i = 0; i < 3; i++) {
    if (i < finalDirection.length) {
      letter[i].innerHTML = finalDirection[i];
    } else {
      letter[i].innerHTML = "&nbsp;";
    }
  } 
    //HTMLconsole.innerHTML = sliderValue + "<br>modulus: " + modulus + "<br>modulation: " + modulation + "<br>fade: " + fade + '<br>1-fade: ' + (1-fade) + '<br>hertz: ' + hertz + " hz <br>---<br>";//+ allVolumesHTML;


}


function handleOrientation(event) {
 
  // Check if alpha (compass direction) is available
      
    bearing = event.webkitCompassHeading || Math.abs(event.alpha - 360);
    bearing = bearing + declination;
    if (bearing > 360) {
      bearing = bearing - 360;
    }
    if (bearing < 0) {
      bearing = bearing + 360;
    }
    globalBearing=bearing;
    if (started==true){
      directionChanged();
    }
  }

let globalBearing=0;

function startOrientation(){
  if (started == false) {
    console.log("trying to start orientation");
    if (typeof DeviceMotionEvent.requestPermission === 'function') { 
        // for IOS devices
        
        // get device orientation sensor data
        DeviceOrientationEvent.requestPermission().then(response => {
            if (response === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation, true);
            }
        }).catch(console.error)
    } else { //Android probably
        // get device orientation sensor data
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    }
    initAudio();//hopefully we can do this all in one click
    started=true;
  }

}

function getLocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
  } else {
     console.log("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  // Call the function to calculate declination
  declination = geomag.field(latitude, longitude).declination;
  document.getElementById("declination").innerHTML="Declination: " + declination + "°";
  console.log(latitude, longitude, declination);
}


if (debug==true) {
  const slider = document.getElementById("slider");
  // Add an event listener to monitor changes in the slider's value
  slider.addEventListener("input", function() {
    var modulus = this.value % 360;
    globalBearing=modulus;//I hate that we have to do this but I see no other option
    directionChanged();     
  });
}else{  
    
 
  //grab location to calculate declination
  getLocation();
  


}


const myButton = document.getElementById("frequencyDisplay");
const letter0 = document.getElementById("letter0");
const letter1 = document.getElementById("letter1");
const letter2 = document.getElementById("letter2");
const orientationButton = document.getElementById("orientationButton");


if ('ontouchstart' in window) {
  letter0.addEventListener("touchstart", function() {playStinger(0);});
  letter1.addEventListener("touchstart", function() {playStinger(1);});
  letter2.addEventListener("touchstart", function() {playStinger(2);});

  console.log("ontouchstart!");
  
  
  
} else {
  console.log("You're on a PC.")
  letter0.addEventListener("mousedown", function() {playStinger(0);});
  letter1.addEventListener("mousedown", function() {playStinger(1);});
  letter2.addEventListener("mousedown", function() {playStinger(2);});

  console.log("mousedown!");
}

//set up listeners for the two range-type inputs with chorusVolume and stingerVolume as their ids. Any change we will use to change volume of the chorus and stingers
const chordVolumeId = document.getElementById("chordVolume");
const stingerVolumeId = document.getElementById("stingerVolume");

//we do it this way so that the defaults can be set in HTML instead of here
let chordVolume=chordVolumeId.value/750;
let stingerVolume = stingerVolumeId.value/100;



chordVolumeId.addEventListener("input", function() {//listener for the chord volume slider
  
  chordVolume = this.value/750;
  console.log(chordVolume, this.value);
  for (i = 0; i < sound.length; i++) {
    sound[i]["gain"].gain.value=chordVolume;
  }
  directionChanged();//we do this to fix the illusion stuff

});

stingerVolumeId.addEventListener("input", function() {//listener for the stinger volume slider
    
    stingerVolume = this.value/100;
   
  
  });


var chordVoicesToLoad = [0,2]

var chordFileSelect = document.getElementById("chordFileSelect");
// Add an event listener to listen for changes
chordFileSelect.addEventListener("change", function() {
    loadChord(chordFileSelect.value,chordVoicesToLoad);
});

var stingerFileSelect = document.getElementById("stingerFileSelect");
// Add an event listener to listen for changes
stingerFileSelect.addEventListener("change", function() {
    loadStinger(stingerFileSelect.value);
});


let intervalID;
function startStingerContinuous(interval){
        //if intervalID is already a running interval, clear it
        if (intervalID) {
          clearInterval(intervalID);
        }

        //every x  seconds, play all three stingers in a row with a half second delay between each
        intervalID = setInterval(function(){ 
          playStinger(0);
          setTimeout(function(){ playStinger(1); }, 500);
          setTimeout(function(){ playStinger(2); }, 1000);
        }, interval);
      }
//listen to see if the checkbox id="autoplay" is checked. If it is, start the stinger continuous function using the value of the slider id="autoplayms"
const autoplay = document.getElementById("autoplay");
const autoplayms = document.getElementById("autoplayms");
const autoplaymsConsole = document.getElementById("autoplaymsConsole");
autoplay.addEventListener("change", function() {
  if (autoplay.checked == true) {
    startStingerContinuous(autoplayms.value);
    autoplaymsConsole.innerHTML = autoplayms.value + "ms";
  } else {
    clearInterval(intervalID);
  }
});

autoplayms.addEventListener("input", function() {
  //if autoplay is checked
  if (autoplay.checked == true) {
    startStingerContinuous(autoplayms.value);
    
  }
  autoplaymsConsole.innerHTML = autoplayms.value + "ms";

});


//----- effects business

let tunaParams = {};

// Load JSON and populate dropdown
fetch('tunaParams.JSON')
    .then(response => response.json())
    .then(data => {
        tunaParams = data;
        //sort the instruments alphabetically
        let sortedTunaParams = {};
        Object.keys(tunaParams).sort().forEach(function(key) {
          sortedTunaParams[key] = tunaParams[key];
        });
        
        const select = document.getElementById('effectSelect');
        for (const effect in sortedTunaParams) {
            let option = document.createElement('option');
            option.value = effect;
            option.textContent = effect;
            select.appendChild(option);
        }
    });

// Function to create form based on effect
function createEffectForm(effectName, effectParams) {
    const effectNameElement = document.getElementById('effectName');
    const container = document.getElementById('formContainer');
    effectNameElement.innerHTML = '<h3>' + effectName + '</h3>';
    container.innerHTML = '';

    const form = document.createElement('form');
    form.id = effectName + 'Form';

    for (const param in effectParams) {
        const inputDiv = document.createElement('div');

    // Create label
    const label = document.createElement('label');
    label.htmlFor = effectName + '_' + param;
    label.textContent = param + ': ';
    inputDiv.appendChild(label);

    // Determine input type and create input element
    let input;
    //if the param has a true or false as the default, create a checkbox
    if (effectParams[param]['default'] === true || effectParams[param]['default'] === false) {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = effectParams[param]['default'];
    } else if (effectParams[param].hasOwnProperty('options')) {
        // Dropdown for options
        input = document.createElement('select');
        const options = effectParams[param]['options'].split(', ');
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            input.appendChild(option);
        });
    } else if (effectParams[param].hasOwnProperty('min') && effectParams[param].hasOwnProperty('max')) {
        // Slider or number input
        input = document.createElement('input');
        input.type = 'range';
        input.min = effectParams[param]['min'];
        input.max = effectParams[param]['max'];
        input.step = effectParams[param]['step'] || 'any';
        input.value = effectParams[param]['default'];
    } else {
        // Text input
        input = document.createElement('input');
        input.type = 'text';
        input.value = effectParams[param]['default'];
    }

    input.id = effectName + '_' + param;
    inputDiv.appendChild(input);

    form.appendChild(inputDiv);
}

container.appendChild(form);
}

let fxNode;
// Event listener for "Choose an effect" dropdown change to create form
document.getElementById('effectSelect').addEventListener('change', function(data) {
    const selectedEffect = this.value;
    const effectParams = data;
    createEffectForm(selectedEffect, tunaParams[selectedEffect]);

    //let's load an effect
    console.log("here:", selectedEffect, tunaParams[selectedEffect])
    //go through defaultParams and grab the default value for each property. Create a new object that is just the default values
    let defaultParams = {};
    for (const param in effectParams) {
        defaultParams[param] = effectParams[param]['default'];
    }
    

    //if fxNode is already connected to something, disconnect it
    if (fxNode) {
      fxNode.disconnect();
    }
    //create the effect node. A new Tuna instance of type selectedEffect with params from tunaParams[selectedEffect]
    fxNode = new tuna[selectedEffect](defaultParams);

    //connect the effect node to lineOut --actually let's do this basic overdrive so we always have some buffer
    fxNode.connect(overdrive);
    //disconnect the preFXbus from lineOut if connected
    if (preFXbus) {
      preFXbus.disconnect();
    }
    //connect the preFXbus to the fxNode
    preFXbus.connect(fxNode);


});


// Event listener for form input changes
document.getElementById('formContainer').addEventListener('input', function(event) {
    var value;
    if (event.target.type === 'checkbox') {
        // For checkboxes, use the 'checked' property
        value = event.target.checked;
    } else {
        // For other input types, use the 'value' property
        value = event.target.value;
    }
    console.log(event.target.id + ' has changed to ' + value);
    //a new variable for whatever is to the right of the underscore in event.target.id 
    let param = event.target.id.split('_')[1];

    //use the Number constructor to determine if the value is a number and if so, force it to be a number
    if (Number(value)) {
      value = Number(value);
    }
    //set the value of the param in the fxNode to the value of the input
    fxNode[param] = value;
});