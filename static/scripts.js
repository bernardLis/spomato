/**
 * TIMER LOGIC
 * TODO: after double clicking multiple times on timer it "breaks"
 * TODO: add hours to the timer?
 */

// Setting functions to the elements
document.getElementById("tomatoTimer").addEventListener("click", tomatoTimer);
document.getElementById("breakTimer").addEventListener("click", breakTimer);

var timerDisplay = document.getElementById("timer");
document.getElementById("pauseResumeTimer").addEventListener("click", pauseResumeTimer);

// Timer variables
var timerValue = 0;
var n = 0;
var isTimerOver = false;

// Update the count down every second
var timer = new Timer(function()
{
  // Every second update the iterating variable
  n += 1 * 1000;

  // Find the distance between now and the count down date
  var distance = timerValue - n;

  // Never let distance be less than 0
  if (distance < 0)
  {
    distance = 0
  }

  // Time calculations for minutes and seconds
  // toLocaleString to display 01
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
  var seconds = Math.floor((distance % (1000 * 60)) / 1000).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});

  // Display the timer in the element with id="timerDisplay"
  timerDisplay.innerHTML = minutes + ":" + seconds;

  // Display the timer in the page title
  document.title = minutes + ":" + seconds;

  // When the countdown is finished pause timer
  if (distance <= 0)
  {
    // Display buzzzzz in the page title
    document.title = "Buzzzzz!";

    isTimerOver = true;
    document.getElementById("pauseResumeTimer").innerHTML = "Start";
    timer.stop();

    /* ALARM */
    // Getting checkboxes
    var alarmPlayAlarm = document.getElementById("alarmPlayAlarm");
    var alarmNotification = document.getElementById("alarmNotification");

    // Play an alarm
    if (alarmPlayAlarm.checked)
    {
      // Play the selected alarm and selected volume
      playAlarm();
    }
    // Display a notification
    if (alarmNotification.checked)
    {
      notify();
    }
  }
}, 1000);

// This prevents running the timer on document load
timer.stop()

// Timer is editable after double click and runs from edited value // "p",
// FROM: https://codereview.stackexchange.com/questions/32520/double-click-to-edit-and-add-new-value-to-li
var oriVal;
var oriSeconds;
$("#timerDad").on("dblclick", "p", function (e) {
  // Stops the timer
  timer.stop();

  // Get original value of the timer and convert it to seconds
  oriVal = $(this).text();
  var oriList = oriVal.split(":");
  oriSeconds = (parseInt(oriList[0]) * 60) + parseInt(oriList[1]);

  // Clear text and add an input field with the original value as a placeholder
  $(this).text("");
  $(`<input type='text' id="editableTimer" placeholder=${oriVal}>`).appendTo(this).focus();

  // This and on focus below "prevent" the timer breaking when user furiously clicks on it
  e.preventDefault();
});

$("#timerDad").on("focus", "p", function(e){
  e.preventDefault();
  e.stopPropagation();
});

// On focus out start the timer
// > jquerry for children of, p > input this does not make sense tho...I will ignore it for now
$("#timerDad").on("focusout", "p > input", function (e)
{
  // A variable I will use later
  var seconds;

  // This gets the input field
  var $this = $(this);

  // Trying to convert the new value to seconds
  var newSeconds;
  // Getting the user input
  var list = $this.val().split(":");
  // If there is only one number, treat it as minutes
  if (list.length == 1)
  {
    newSeconds = parseInt(list[0]) * 60;
  }
  // Two numbers with ":" between, treat them as min:sec
  else if (list.length == 2) {
    newSeconds = (parseInt(list[0]) * 60) + parseInt(list[1]);
  }
  // Else, it is wrong input - use the original timer value
  else
  {
    newSeconds = oriSeconds;
  }

  // If input is NOT a number keep original timer value
  if(isNaN(newSeconds))
  {
    $this.parent().text(oriVal);
    seconds = oriSeconds;
  }
  // Else, set the new timer value
  else
  {
    $this.parent().text($this.val());
    seconds = newSeconds;
  }

  // Return if timer is set to 0
  if (seconds == 0)
  {
    return
  }
  // Else, start a new timer
  else
  {
    timerValue = seconds * 1000;

    // Resetting the timer
    n = 0;
    timer.reset();
  }

  // Remove this element
  $this.remove();
});

// Pasue - Resume button functionality
function pauseResumeTimer(e)
{
  resumePauseTimerToggler();

  // If timer is at 00:00 start a new tomato
  if (isTimerOver)
  {
    tomatoTimer();
    document.getElementById("pauseResumeTimer").classList.remove("resumeTimer");
    document.getElementById("pauseResumeTimer").classList.add("pauseTimer");
    document.getElementById("pauseResumeTimer").innerHTML = "Pause";
  }

}

// Set timer to tomato time - value comes from flask (default: 25min), can be chagned in settings and passed through flask
function tomatoTimer()
{
  timerValue = tomatoT * 60 * 1000;
  n = -1 * 1000;
  timer.reset();
}

// Set timer to break time - value comes from flask (default: 5min), can be chagned in settings and passed through flask
function breakTimer()
{
  timerValue = breakT * 60 * 1000;
  n = -1 * 1000;
  timer.reset();
}

// Timer helper class from: https://stackoverflow.com/questions/8126466/how-do-i-reset-the-setinterval-timer
function Timer(fn, t) {
  var timerObj = setInterval(fn, t);

  this.stop = function() {
      if (timerObj) {
          clearInterval(timerObj);
          timerObj = null;
      }
      return this;
  }

  // Start timer using current settings (if it's not already running)
  this.start = function() {
      if (!timerObj) {
          this.stop();
          timerObj = setInterval(fn, t);
      }
      return this;
  }

  // Restart with original interval, stop current interval
  this.reset = function() {
      isTimerOver = false;

      // Pause-resume button logic
      document.getElementById("pauseResumeTimer").classList.remove("resumeTimer");
      document.getElementById("pauseResumeTimer").classList.add("pauseTimer");
      document.getElementById("pauseResumeTimer").innerHTML = "Pause";

      return this.stop().start();
  }
}

// Class toggler for play pause timer button
var resumePauseTimerToggler = function()
{
  // Iterating through classes of the button
  var classList = document.getElementById("pauseResumeTimer").classList;
  var len = classList.length;
  for (var i = 0; i < len; i++)
  {
    // If there is resumeTimer class resume timer and change button to pause
    if (classList[i] == "resumeTimer")
    {
      timer.start();
      document.getElementById("pauseResumeTimer").classList.remove("resumeTimer");
      document.getElementById("pauseResumeTimer").classList.add("pauseTimer");
      document.getElementById("pauseResumeTimer").innerHTML = "Pause";
    }
    // If there is pauseTimer class pasue timer and change button to resume
    else if (classList[i] == "pauseTimer")
    {
      timer.stop();
      document.getElementById("pauseResumeTimer").classList.remove("pauseTimer");
      document.getElementById("pauseResumeTimer").classList.add("resumeTimer");
      document.getElementById("pauseResumeTimer").innerHTML = "Resume";
    }
  }
}
/* Keyboard shortcuts*/

document.addEventListener('keyup', event =>
{
  // start a new tomato on enter click
  if (event.keyCode === 13)
  {
    tomatoTimer();
  }
  // start a new break timer on shift enter click
  if (event.keyCode == 13 && event.shiftKey)
  {
    breakTimer();
  }
})

/* MEDIA */
var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
// For devices with screen width of less than 600
if (width < 600)
{
  // Change the design of timer buttons
  var tomatoTimer = document.getElementById("tomatoTimer");
  var breakTimer = document.getElementById("breakTimer");
  var buttonDivider =document.getElementById("buttonDivder").style.display = "none";
  var timerDad = document.getElementById("timerDad");
  var spotifyLogInForm = document.getElementById("spotifyLogInForm");

  tomatoTimer.classList.remove("btn-block");
  breakTimer.classList.remove("btn-block");
  breakTimer.classList.remove("mt-2");
  timerDad.classList.remove("mr-3");
  timerDad.classList.remove("ml-1");
  timerContainer.classList.remove("mr-5");
  spotifyLogInForm.classList.remove("ml-2");

  tomatoTimer.classList.add("d-inline");
  breakTimer.classList.add("d-inline");
  timerDad.classList.add("mx-auto");
}

/*
 * Alarm helpers
 *
*/
// Collapse alarm section
var alarmCollapser = document.getElementById("alarmCollapser");
var alarmCollapserIcon = document.getElementById("alarmCollapserIcon");

alarmCollapser.addEventListener("click", function()
{
  var alarmCC = document.getElementById("alarmCC");
  // Iterating on classes
  for (var i = 0; i < alarmCC.classList.length; i++)
  {
    // Collapse alarm section
    if (alarmCC.classList[i] == "visible")
    {
      alarmCC.classList.remove("visible");
      alarmCC.classList.add("hidden");

      alarmCollapserIcon.classList.remove("fa-angle-down");
      alarmCollapserIcon.classList.add("fa-angle-up");

      return;
    }
    // Show alarm Section
    else if (alarmCC.classList[i] == "hidden")
    {
      alarmCC.classList.remove("hidden");
      alarmCC.classList.add("visible");

      alarmCollapserIcon.classList.remove("fa-angle-up");
      alarmCollapserIcon.classList.add("fa-angle-down");

      return;
    }
  }
})

// Play selected alarm on change in selection
var alarmSelection = document.getElementById("alarmSelection");
alarmSelection.addEventListener("change", function()
{
  playAlarm();
})

var alarmVolumeSelection = document.getElementById("alarmVolumeInput");
alarmVolumeSelection.addEventListener("focusout", function()
{
  playAlarm();
})

// Keeping track of the alarm
var alarm = null;
// Play the alarm - https://howlerjs.com/
function playAlarm()
{
  // Only one alarm can be played at the time
  if (alarm != null) {
    alarm.stop();
    alarm.unload();
    alarm = null;
  }

  // What to play
  var selected = document.getElementById("alarmSelection");
  var url = selected.options[selected.selectedIndex].value;

  // At what volume to play it
  var volume = document.getElementById("alarmVolumeInput").value;
  if (volume == null || isNaN(volume) || volume == 0)
  {
    volume = 0.5;
  }
  else
  {
    volume = volume / 100;
  }

  // Actual alarm
  alarm = new Howl
  ({
    src: [url],
    volume: volume,
  });
  alarm.play();
}

// Handle notifications
// https://developer.mozilla.org/en-US/docs/Web/API/notification
function notify()
{
  // Let's check if the browser supports notifications
  if (!("Notification" in window))
  {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted")
  {
    // If it's okay let's create a notification
    var notification = new Notification("Buzzzzz!");
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied")
  {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification("Buzzzzz!");
      }
    });
  }
// At last, if the user has denied notifications, and you
// want to be respectful there is no need to bother them any more.
}
