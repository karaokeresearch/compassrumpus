sound=[];
started=false;
chordRates=[1, 5/4, 3/2, 1/2, 5/8, 3/4]
//sort this array by size
chordRates.sort(function(a, b){return a - b});
function button1() {

  if (started == false) {
    console.log("playing");

    for (i = 0; i < chordRates.length; i++) {
      sound[i] = new Howl({
        src: ["6.wav"],
        autoplay: true,
        loop: true,
        rate: chordRates[i],
        volume: 0.03,
      });
    }   
    started = true;   
  }


 }

 const slider = document.getElementById("slider");

 // Add an event listener to monitor changes in the slider's value
 slider.addEventListener("input", function() {
     const sliderValue = this.value;
     const console = document.getElementById("console");
     
     let modulus = sliderValue % 360;
     modulation = modulus / 360 + 1;
     for (i = 0; i < chordRates.length; i++) {
       sound[i].rate(chordRates[i] * modulation);
     }
    //for the highest element in sound[]: the volume should decrease to 0 as the slider value approaches 360
    //likewise the lowest element in sound[]: the volume should increase to 1 as the slider value approaches 360
    fade =modulus/360


    sound[0].volume(0.03 * fade);
    sound[sound.length-1].volume(0.03 * (1- fade));

    allVolumesHTML=""
    for (i = 0; i < sound.length; i++) {
      allVolumesHTML+=sound[i]._volume+"<br>";
    }

     console.innerHTML = sliderValue + "<br>" + modulus + "<br>" + modulation + "<br>" + fade + "<br>---<br>" + allVolumesHTML;
 });