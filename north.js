let chordVolume=0.02;
let stingerVolume = 1;

let chordFile="chord_organ.wav";

portladDeclination = 15.8333333




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

sound=[];
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
  chordRates.push(baseChordRates[i]/8);
  chordRates.push(baseChordRates[i]/4);
  chordRates.push(baseChordRates[i]/2);
  chordRates.push(baseChordRates[i]);
 // chordRates.push(baseChordRates[i]*2);
 // chordRates.push(baseChordRates[i]*4);
  //chordRates.push(baseChordRates[i]*2);
   
}
//sort this array by size
chordRates.sort(function(a, b){return a - b});
function button1() {

  if (started == false) {
    console.log("playing");

    for (i = 0; i < chordRates.length; i++) {
      sound[i] = new Howl({
        src: [chordFile],
        autoplay: true,
        loop: true,
        rate: chordRates[i] * chordPitchShiftFactor,
        volume: chordVolume,
      });
    } 
    started = true; 
  }


 }
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
    

    for (i = 0; i < chordRates.length; i++) {
      sound[i] = new Howl({
        src: [chordFile],
        autoplay: true,
        loop: true,
        rate: chordRates[i] * chordPitchShiftFactor,
        volume: chordVolume,
      });
    } 
    started = true;
    directionChanged()
  } else{
    toggleMute()
  }


 }



 
let stinger={};
stinger["north"]=[];
for (i = 0; i < baseChordRates.length; i++) {
  stinger["north"][i] = new Howl({
    src: ["north01.wav"],
    autoplay: false,
    loop: false,
    volume: stingerVolume
  });
}
stinger["south"]=[];
for (i = 0; i < baseChordRates.length; i++) {
  stinger["south"][i] = new Howl({
    src: ["south01.wav"],
    autoplay: false,
    loop: false,
    volume: stingerVolume
  });
}
stinger["east"]=[];
for (i = 0; i < baseChordRates.length; i++) {
  stinger["east"][i] = new Howl({
    src: ["east01.wav"],
    autoplay: false,
    loop: false,
    volume: stingerVolume
  });
}
stinger["west"]=[];
for (i = 0; i < baseChordRates.length; i++) {
  stinger["west"][i] = new Howl({
    src: ["west01.wav"],
    autoplay: false,
    loop: false,
    volume: stingerVolume
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

    //if (mySliderValue > 180) {
    //  mySliderValue = mySliderValue - 360;
   // }
    var position = files[directionToSing + "01.wav"]["position"];
    mySliderValue = mySliderValue - files[directionToSing + "01.wav"]["position"]; 
    let modulation = 2 ** (mySliderValue / 360 )
    //play a single note
    i = chordPos;
    var finalRate=baseChordRates[i] * modulation * chordPitchShiftFactor;
//    console.log("global Bearing: " , globalBearing, "mySliderValue: " , mySliderValue, "directionToSing: " , directionToSing);
  //  console.log(baseChordRates[i], modulation, chordPitchShiftFactor, "finalRate: " , finalRate, " position: " , position);
    //console.log(finalRate)
    stinger[directionToSing][chordPos].rate(finalRate);
    stinger[directionToSing][chordPos].play();
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
    sound[i].rate(chordRates[i] * modulation * chordPitchShiftFactor); 
  }
  terriblecompass.style.transform = `rotate(${360-modulus}deg)`

  //hertz = 440 * modulation;

  //ILLUSION CREATED HERE
  //for the highest element in sound[]: the volume should decrease to 0 as the slider value approaches 360
  //likewise the lowest element in sound[]: the volume should increase to 1 as the slider value approaches 360
  fade =modulus/360;

  for (i = 0; i < baseChordRates.length; i++) {
    sound[i].volume(chordVolume * fade);
  }

  //now let's do the same with the top three sounds in the array
  for (i = sound.length-baseChordRates.length; i < sound.length; i++) {
    sound[i].volume(chordVolume * (1- fade));
  }


  allVolumesHTML=""
  for (i = 0; i < sound.length; i++) {
    allVolumesHTML+=sound[i]._volume+"<br>";
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


chordVolumeId.addEventListener("input", function() {
  
  chordVolume = this.value/750;
  console.log(chordVolume, this.value);
  for (i = 0; i < sound.length; i++) {
    sound[i].volume(chordVolume);
  }
  directionChanged();//we do this to fix the illusion stuff

});

stingerVolumeId.addEventListener("input", function() {
    
    stingerVolume = this.value/100;
    console.log(stingerVolume);
    for (i = 0; i < baseChordRates.length; i++) {
      stinger["north"][i].volume(stingerVolume);
      stinger["south"][i].volume(stingerVolume);
      stinger["east"][i].volume(stingerVolume);
      stinger["west"][i].volume(stingerVolume);
    }

  
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