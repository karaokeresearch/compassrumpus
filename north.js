let chordVolume=0.02;
let stingerVolume = 1;

let chordFile="chord_organ.wav";

portladDeclination = 15.8333333

// create WebAudio API context
let context = new AudioContext();
let tuna = new Tuna(context);

// Create lineOut
let lineOut = new WebAudiox.LineOut(context)


let debug=false
//if querystring contains debug=true then set the innerHTML of sliderContainer to this: '<input type="range" min="0" max="1000" value="360" class="slider" onmousedown="button1()" id="slider">'
if (window.location.search.includes("debug=true")) {
  document.getElementById("sliderContainer").innerHTML = '<input type="range" min="0" max="1000" value="360" class="slider" id="slider">';
  debug=true
}


//format is file, degree at which it's meant to be played, cent adjustment
let files={
      "chord_organ.wav": {position:0, centAdjustment:0},
      "chord_strings_low.wav": {position:0, centAdjustment:0},
      "chord_strings_high.wav": {position:0, centAdjustment:0},
      "chord_vox_low.wav": {position:0, centAdjustment:40},
      "chord_vox_high.wav": {position:0, centAdjustment:0},
      "chord_8_bit.wav": {position:0, centAdjustment:0},
      "north01.wav": {position: 0, centAdjustment: 0},
      "east01.wav": {position:90, centAdjustment: 0},
      "south01.wav": {position:180, centAdjustment: 0},
      "west01.wav": {position:270, centAdjustment: 0},
      };



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
noteOffsets=[];
const terriblecompass = document.getElementById("terriblecompass");

//first let's define the base chord. Below is a major chord
for (i = 0; i < 13; i++) {
  noteOffsets.push(((2**(1/12))**i)); //this has to do with equal temprament
}
baseChordRates=[noteOffsets[0], noteOffsets[4], noteOffsets[7]];
//half and double each of these and add all nine to chordRates

chordRates=[];
for (i = 0; i < baseChordRates.length; i++) {
 // chordRates.push(baseChordRates[i]/8);
  chordRates.push(baseChordRates[i]/4);
  chordRates.push(baseChordRates[i]/2);
  chordRates.push(baseChordRates[i]);
  chordRates.push(baseChordRates[i]*2);
 // chordRates.push(baseChordRates[i]*4);
  //chordRates.push(baseChordRates[i]*2);
   
}
//sort this array by size
chordRates.sort(function(a, b){return a - b});

//const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//const bus = audioContext.createGain();
//bus.connect(audioContext.destination);
sound=[];    
function button2() {
  // if files[chordFile] has a centAdjustment, then we need to adjust the rate
  if (files[chordFile].centAdjustment) {
    chordPitchShiftFactor = 2 ** (files[chordFile].centAdjustment / 1200); // 1200 cents in an octave
  } 
  console.log("button2")
  if (started == false) {
    console.log("playing");
    let clickHereID = document.getElementById("taphere");
    clickHereID.innerHTML = "tap compass to mute";
    
    WebAudiox.loadBuffer(context, chordFile, function(buffer){
      for (i = 0; i < chordRates.length; i++) {
        sound[i] ={};
        sound[i]["bufferSource"] = context.createBufferSource();
        sound[i]["gain"] = context.createGain();
        sound[i]["bufferSource"].connect(sound[i]["gain"]);
        sound[i]["gain"].connect(context.destination);
        sound[i]["bufferSource"].loop = true;
        sound[i]["gain"].gain.value = chordVolume;
        sound[i]["bufferSource"].playbackRate.value = chordRates[i] * chordPitchShiftFactor;
        // init AudioBufferSourceNode
        sound[i]["bufferSource"].buffer = buffer;
        // start the sound now
        sound[i]["bufferSource"].start(0);

      }
    });
     
    started = true;
    directionChanged()
  } else{
    toggleMute()
  }


 }




 
let stinger={};
stinger["north"]={};
stinger["south"]={};
stinger["east"]={};
stinger["west"]={};


WebAudiox.loadBuffer(context, "north01.wav", function(buffer){
  stinger["north"]["bufferData"] = buffer;
});

WebAudiox.loadBuffer(context, "south01.wav", function(buffer){
  stinger["south"]["bufferData"] = buffer;
});

WebAudiox.loadBuffer(context, "east01.wav", function(buffer){
  stinger["east"]["bufferData"] = buffer;
});

WebAudiox.loadBuffer(context, "west01.wav", function(buffer){
  stinger["west"]["bufferData"] = buffer;
});




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


    let source = context.createBufferSource();
    let gainNode = context.createGain();
    source.connect(gainNode);
    gainNode.connect(context.destination);

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
    console.log(myValue);
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



  HTMLconsole.innerHTML = parseInt(modulus) + "°";
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
      
    bearing = 360 - event.alpha;
    bearing = bearing + portladDeclination;
    if (bearing > 360) {
      bearing = bearing - 360;
    }
    if (bearing < 0) {
      bearing = bearing + 360;
    }
    globalBearing=bearing;
    directionChanged();
    
  }

let globalBearing=0;
  
  if (debug==true) {

    const slider = document.getElementById("slider");
    // Add an event listener to monitor changes in the slider's value
    slider.addEventListener("input", function() {
      var modulus = this.value % 360;
      globalBearing=modulus;//I hate that we have to do this but I see no other option
      directionChanged();     
    });
  }else{  
    
  if ('DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientationabsolute', handleOrientation); //use this tidier helper function 
  } else {
    alert('DeviceOrientationEvent is not supported on this browser.');
  }




}


const myButton = document.getElementById("frequencyDisplay");
const letter0 = document.getElementById("letter0");
const letter1 = document.getElementById("letter1");
const letter2 = document.getElementById("letter2");

if ('ontouchstart' in window) {
  terriblecompass.addEventListener("touchstart", button2);
  letter0.addEventListener("touchstart", function() {playStinger(0);});
  letter1.addEventListener("touchstart", function() {playStinger(1);});
  letter2.addEventListener("touchstart", function() {playStinger(2);});
} else {
  console.log("You're on a PC.")
  terriblecompass.addEventListener("mousedown", button2);
  letter0.addEventListener("mousedown", function() {playStinger(0);});
  letter1.addEventListener("mousedown", function() {playStinger(1);});
  letter2.addEventListener("mousedown", function() {playStinger(2);});
}

//set up listeners for the two range-type inputs with chorusVolume and stingerVolume as their ids. Any change we will use to change volume of the chorus and stingers
const chordVolumeId = document.getElementById("chordVolume");
const stingerVolumeId = document.getElementById("stingerVolume");


chordVolumeId.addEventListener("input", function() {//this is the chord volume slider
  
  chordVolume = this.value/750;
  console.log(chordVolume, this.value);
  for (i = 0; i < sound.length; i++) {
    sound[i]["gain"].gain.value=chordVolume;
  }
  directionChanged();//we do this to fix the illusion stuff

});

stingerVolumeId.addEventListener("input", function() {//this is the stinger volume slider
    
    stingerVolume = this.value/100;
   
  
  });

  var fileSelect = document.getElementById("fileSelect");

    // Add an event listener to listen for changes
    fileSelect.addEventListener("change", function() {
        // Get the selected value (file name)
        var selectedValue = fileSelect.value;

        for (i=0; i<sound.length; i++){
          sound[i].unload()
          }
        chordFile=selectedValue;
        started=false;
        button2();
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