let chordVolume=0.01

let chordFile="organA.wav";
let stingerFile="north01.wav"

portladDeclination = 15.8333333

//format is file, degree at which it's meant to be played, cent adjustment
let files={
      "6.wav": {position:0, centAdjustment:40},
      "organA.wav":{position:0, centAdjustment: 0 },
      "north01.wav": {position: 0, centAdjustment: 0},
      "east01.wav": {position:90, centAdjustment: 0},
      "south01.wav": {position:180, centAdjustment: 0},
      "west01.wav": {position:270, centAdjustment: 0},
      };

let chordPitchShiftFactor = 1;

// if files[chordFile] has a centAdjustment, then we need to adjust the rate
if (files[chordFile].centAdjustment) {
  chordPitchShiftFactor = 2 ** (files[chordFile].centAdjustment / 1200); // 1200 cents in an octave
}


function muteUnmuteAllSounds(){
  for (i = 0; i < sound.length; i++) {
    sound[i].mute(!sound[i]._muted);
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
  chordRates.push(baseChordRates[i]*2);
  chordRates.push(baseChordRates[i]*4);
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



 
let stinger={};
stinger["north"]=[];
for (i = 0; i < baseChordRates.length; i++) {
  stinger["north"][i] = new Howl({
    src: ["north01.wav"],
    autoplay: false,
    loop: false,
    volume: 1,
  });
}
stinger["south"]=[];
for (i = 0; i < baseChordRates.length; i++) {
  stinger["south"][i] = new Howl({
    src: ["south01.wav"],
    autoplay: false,
    loop: false,
    volume: 1,
  });
}
stinger["east"]=[];
for (i = 0; i < baseChordRates.length; i++) {
  stinger["east"][i] = new Howl({
    src: ["east01.wav"],
    autoplay: false,
    loop: false,
    volume: 1,
  });
}
stinger["west"]=[];
for (i = 0; i < baseChordRates.length; i++) {
  stinger["west"][i] = new Howl({
    src: ["west01.wav"],
    autoplay: false,
    loop: false,
    volume: 1,
  });
}




function playStinger(chordPos){
  let direction = compassDirectionToSpecificName(sliderValue);
  //if chordPos is a number higher than the length of baseChordRates, do nothing
  if (chordPos > baseChordRates.length-1) {
    return;
  }
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
  mySliderValue = parseInt(sliderValue);

  if (mySliderValue > 180) {
    mySliderValue = sliderValue - 360;
  }
  mySliderValue = mySliderValue - files[directionToSing + "01.wav"]["position"]; 
  let modulus = mySliderValue % 360;
  console.log("modulus: " , modulus)
  let modulation = 2 ** (modulus / 360 )
  //play a single note
  i = chordPos;
  var finalRate=baseChordRates[i] * modulation * chordPitchShiftFactor;
  console.log(baseChordRates[i], modulation, chordPitchShiftFactor)
  console.log(finalRate)
  stinger[directionToSing][chordPos].rate(finalRate);
  stinger[directionToSing][chordPos].play();
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
  

const slider = document.getElementById("slider");

sliderValue=0;
 // Add an event listener to monitor changes in the slider's value
 slider.addEventListener("input", function() {
     sliderValue = this.value;
     const HTMLconsole = document.getElementById("console");
     
     modulus = sliderValue % 360;
     //modulation = modulus / 360 + 1; // old, non-equal-tempered version
     //instead let's do an equal-tempered version
     let modulation = 2 ** (modulus / 360 )
     for (i = 0; i < chordRates.length; i++) { 
       sound[i].rate(chordRates[i] * modulation * chordPitchShiftFactor); 
     }
     terriblecompass.style.transform = `rotate(${360-modulus}deg)`

     hertz = 440 * modulation;

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

    HTMLconsole.innerHTML = sliderValue + "<br>modulus: " + modulus + "<br>modulation: " + modulation + "<br>fade: " + fade + '<br>1-fade: ' + (1-fade) + '<br>hertz: ' + hertz + " hz <br>---<br>";//+ allVolumesHTML;
 });