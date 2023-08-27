let chordVolume=0.01

let chordFile="organA.wav";

portladDeclination = 15.8333333

//format is file, hertz after adjustment, cent adjustment
let files={
      "6.wav": {rate:440, centAdjustment:40},
      "organA.wav":{rate: 440, centAdjustment: 0 },
      "northyelp.wav": {rate: 423.2511306, centAdjustment: 0},
      };

let chordPitchShiftFactor = 1;

// if files[chordFile] has a centAdjustment, then we need to adjust the rate
if (files[chordFile].centAdjustment) {
  chordPitchShiftFactor = 2 ** (files[chordFile].centAdjustment / 1200); // 1200 cents in an octave
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

 const slider = document.getElementById("slider");

 // Add an event listener to monitor changes in the slider's value
 slider.addEventListener("input", function() {
     const sliderValue = this.value;
     const HTMLconsole = document.getElementById("console");
     
     let modulus = sliderValue % 360;
     //modulation = modulus / 360 + 1; // old, non-equal-tempered version
     //instead let's do an equal-tempered version
     modulation = 2 ** (modulus / 360 )
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

    HTMLconsole.innerHTML = sliderValue + "<br>" + modulus + "<br>" + modulation + "<br>" + fade + '<br>' + (1-fade) + '<br>' + hertz + " hz <br>---<br>";//+ allVolumesHTML;
 });