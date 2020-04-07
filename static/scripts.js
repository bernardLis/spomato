/**
 * TIMER LOGIC
 * TODO: add a button for a new timer
 * TODO: after double clicking multiple times on timer it "breaks"
 * TODO: add hours to the timer?
 */

// Setting functions to the elements
document.getElementById("tomatoTimer").addEventListener("click", tomatoTimer);
document.getElementById("breakTimer").addEventListener("click", breakTimer);
document.getElementById("tenS").addEventListener("click", tenS);

var timerDisplay = document.getElementById("timer");

document.getElementById("pauseResumeTimer").addEventListener("click", pauseResumeTimer);

// Set the date we're counting down to
var timerValue = 1 * 1000;
var n = 0;
var isTimerOver = false;

// Update the count down every 1 second
var timer = new Timer(function()
{
  // On every interval update the iterating variable
  n += 1 * 1000;

  // Find the distance between now and the count down date
  var distance = timerValue - n;

  // Time calculations for days, hours, minutes and seconds
  // toLocaleString to display 01
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
  var seconds = Math.floor((distance % (1000 * 60)) / 1000).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});

  // Display the timer in the element with id="timer"
  timerDisplay.innerHTML = minutes + ":" + seconds;

  // Display the timer in the page title
  document.title = minutes + ":" + seconds;

  // When the countdown is finished pause timer
  if (distance <= 0)
  {
    // Display buzzzzz in page title
    document.title = "Buzzzzz!";

    isTimerOver = true;
    document.getElementById("pauseResumeTimer").innerHTML = "Start";
    timer.stop();
  }
}, 1000);

// Timer is editable after double click and runs from edited value // "p",
// FROM: https://codereview.stackexchange.com/questions/32520/double-click-to-edit-and-add-new-value-to-li
var oriVal;
var oriSeconds;
$("#timerDad").on("dblclick", "p", function (e) {
  // Stops the timer
  timer.stop();

  // Get original value of the timer convert it to seconds
  oriVal = $(this).text();
  var oriList = oriVal.split(":");
  oriSeconds = (parseInt(oriList[0]) * 60) + parseInt(oriList[1]);

  // Clear text and add an input field - ideally with the original value as a placeholder - works!
  $(this).text("");

  $(`<input type='text' id="editableTimer" placeholder=${oriVal}>`).appendTo(this).focus();

  // This and on focus below "prevent" the timer breaking when user furiously clicks on it
  e.preventDefault();
});

$("#timerDad").on("focus", "p", function(e){
  e.preventDefault();
  e.stopPropagation();
});

// On focus out start playing inputed timer
// > jquerry for children of, p > input this does not make sense tho...I will ignore it for now

$("#timerDad").on("focusout", "p > input", function (e)
{
  // Variable I will use later
  var seconds;

  // This gets input field
  var $this = $(this);

  // Trying to convert new value to seconds
  var newSeconds;
  // Getting the user input
  var list = $this.val().split(":");
  // If there is only one number, treat it as minutes
  if (list.length == 1)
  {
    newSeconds = parseInt(list[0]) * 60;
  }
  // Two numbers with ":" between treat them as min:sec
  else if (list.length == 2) {
    newSeconds = (parseInt(list[0]) * 60) + parseInt(list[1]);
  }
  // Else wrong input, use the original timer value
  else
  {
    newSeconds = oriSeconds;
  }

  // If input is NOT a number keep original value as the timer
  if(isNaN(newSeconds))
  {
    $this.parent().text(oriVal);
    seconds = oriSeconds;
  }
  // Else set new value to the timer
  else
  {
    $this.parent().text($this.val());
    seconds = newSeconds;
  }

  // When timer set at 0, need to set it to 1 sec to counteract going to negative value
  if (seconds == 0)
  {
    timerValue = 1 * 1000;
  }
  else
  {
    timerValue = seconds * 1000;
  }

  // Resetting the timer
  n = 0;
  timer.reset();

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

// Set timer to 10 sec, for tests.
function tenS()
{
  timerValue = 10 * 1000;
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
