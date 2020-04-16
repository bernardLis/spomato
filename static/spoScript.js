
/**
* SPOTIFY SDK
*/

console.log("refreshToken", refreshToken);

// Variables I want to be global are here (device_id, duration)
var globalVars = {};

// Spotify SDK
// TODO: figure out refereshing tokens
window.onSpotifyWebPlaybackSDKReady = () =>
{
  const player = new Spotify.Player
  ({
    name: 'Spomato Player',
    volume: 0.5,
    // Get OAuth token:
    getOAuthToken: cb =>
    {
      cb(token);
    }
  });
  // Error handling
  player.addListener('initialization_error', ({ message }) => { console.error("initialization error", message); });
  player.addListener('authentication_error', ({ message }) => { console.error("failed to authenticate", message); });
  player.addListener('account_error', ({ message }) => { console.error("account error", message); });
  player.addListener('playback_error', ({ message }) => { console.error("playback error", message); });

  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    // Pushing device_id to playerVar object
    globalVars.id = device_id;
  });

  // Not Ready
  player.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
  });

  // Connect to the player!
  player.connect();

  /*
   * Every playlist has a play / pause button
   * It shows which playlist is being played
   * TODO: the button does not dissapear after you click pause - you should be able to resume the playlist
  */

  // Play button is only visible when mouse is hovering on the playlist element
  var playlistElements = document.getElementsByClassName("playlistElement");
  var playlistElementsL = playlistElements.length;

  for (let i = 0; i < playlistElementsL; i++)
  {
    // Show play button on mouse enter
    playlistElements[i].addEventListener("mouseenter", function(e)
    {
      // Find play button > show it (if it exsits!!)
      var c = playlistElements[i].children;
      var cc = c[1].children;
      var ccc = cc[0].children;
      var cccc = ccc[0];
      for (var j = 0; j < cccc.classList.length; j++)
      {
        if(cccc.classList[j] == "playButton")
        {
          cccc.classList.add("visible");
          cccc.classList.add("fa");
          cccc.classList.remove("hidden");
        }
      }
    })
    // Hide play button on leave
    playlistElements[i].addEventListener("mouseleave", function(e)
    {
      // Find play button > hide it (if it exsits!!)
      var c = playlistElements[i].children;
      var cc = c[1].children;
      var ccc = cc[0].children;
      var cccc = ccc[0];
      for (var j = 0; j < cccc.classList.length; j++)
      {
        if(cccc.classList[j] == "playButton")
        {
          cccc.classList.remove("visible");
          cccc.classList.remove("fa");
          cccc.classList.add("hidden");
        }
      }
    })
  }

  /*Play / Pause functionalities */
  // Get button elements
  var togglePlayPlaylist = document.getElementsByClassName("togglePlayPlaylist");
  var togglePlayPlaylistL = togglePlayPlaylist.length

  for (let i = 0; i < togglePlayPlaylistL; i++)
  {
    // On click functionalities - will change depending on class
    togglePlayPlaylist[i].addEventListener("click", function()
    {
      // Iterating on classes
      for (var j = 0; j < togglePlayPlaylist[i].classList.length; j++)
      {
        // Pasue functionality
        if (togglePlayPlaylist[i].classList[j] == "pauseButton")
        {
          // Pausing player
          player.pause();

          // Adding play classes
          togglePlayPlaylist[i].classList.add("playButton");
          togglePlayPlaylist[i].classList.add("fa-play");
          togglePlayPlaylist[i].classList.add("hidden");

          // Removing pause classes
          togglePlayPlaylist[i].classList.remove("pauseButton");
          togglePlayPlaylist[i].classList.remove("fa");
          togglePlayPlaylist[i].classList.remove("visible");
          togglePlayPlaylist[i].classList.remove("fa-volume-up");
          togglePlayPlaylist[i].classList.remove("playing");

          // Changing the player toggle play button
          var togglePlayButton = document.getElementById("togglePlayButton");
          togglePlayButton.classList.remove("fa-pause");
          togglePlayButton.classList.add("fa-play");

          return;
        }

        // Play functionality
        else if (togglePlayPlaylist[i].classList[j] == "playButton")
        {
          // Looking for "playing" class to "remove" pause button and "append" play button if it exists
          for (let k = 0; k < togglePlayPlaylistL; k++)
          {
            // Iterating on classes
            for (var l = 0; l < togglePlayPlaylist[k].classList.length; l++)
            {
              if (togglePlayPlaylist[k].classList[l] == "playing")
              {
                // If another playlist was clicked add play button to the previously played playlist
                if (k != i)
                {
                  // Adding play classes
                  togglePlayPlaylist[k].classList.add("playButton");
                  togglePlayPlaylist[k].classList.add("fa-play");
                  togglePlayPlaylist[k].classList.add("hidden");

                  // Removing pause classes
                  togglePlayPlaylist[k].classList.remove("pauseButton");
                  togglePlayPlaylist[k].classList.remove("fa");
                  togglePlayPlaylist[k].classList.remove("visible");
                  togglePlayPlaylist[k].classList.remove("fa-volume-up");
                  togglePlayPlaylist[k].classList.remove("playing");
                }
              }
            }
          }

          // Get the parent node
          p = togglePlayPlaylist[i].parentNode;

          // Play playlist from uri stored in parent's data object
          play(p.dataset.playlisturi);

          // Removing play classes
          togglePlayPlaylist[i].classList.remove("playButton");
          togglePlayPlaylist[i].classList.remove("fa-play");
          togglePlayPlaylist[i].classList.remove("hidden");

          // Adding pause classes
          togglePlayPlaylist[i].classList.add("pauseButton");
          togglePlayPlaylist[i].classList.add("fa");
          togglePlayPlaylist[i].classList.add("visible");
          togglePlayPlaylist[i].classList.add("fa-volume-up");
          togglePlayPlaylist[i].classList.add("playing");

          // Changing the player toggle play button
          var togglePlayButton = document.getElementById("togglePlayButton");
          togglePlayButton.classList.add("fa-pause");
          togglePlayButton.classList.remove("fa-play");

          return;
        }
      }
    })
    // On hover functionality for pause button
    togglePlayPlaylist[i].addEventListener("mouseenter", function()
    {
      // Iterating on classes
      for (var j = 0; j < togglePlayPlaylist[i].classList.length; j++)
      {
        if (togglePlayPlaylist[i].classList[j] == "pauseButton")
        {
          togglePlayPlaylist[i].classList.remove("fa-volume-up");
          togglePlayPlaylist[i].classList.add("fa-pause");
        }
      }
    })
    togglePlayPlaylist[i].addEventListener("mouseleave", function()
    {
      // Iterating on classes
      for (var j = 0; j < togglePlayPlaylist[i].classList.length; j++)
      {
        if (togglePlayPlaylist[i].classList[j] == "pauseButton")
        {
          togglePlayPlaylist[i].classList.remove("fa-pause");
          togglePlayPlaylist[i].classList.add("fa-volume-up");
        }
      }
    })
  }

  /*
  * Player functionalities
  */

  // Display currently played track & duration
  player.addListener('player_state_changed',
  ({position, duration, track_window: { current_track }}) =>
  {
    // Pushing duration to my array
    globalVars.duration = current_track["duration_ms"];

    // Displaying the track duration
    var trackDuration = document.getElementById("trackDuration");

    var duration = (current_track["duration_ms"]/1000).toString().toHHMMSS();

    trackDuration.innerHTML = duration;

    // Displaying track info in the player
    document.getElementById("cpCover").src = current_track['album']['images'][0]['url'];
    document.getElementById("cpName").innerHTML = current_track['name'];
    document.getElementById("cpArtist").innerHTML = current_track['artists'][0]['name'];

    // Same for mobile
    document.getElementById("cpCoverMobile").src = current_track['album']['images'][0]['url'];
    document.getElementById("cpNameMobile").innerHTML = current_track['name'];
    document.getElementById("cpArtistMobile").innerHTML = current_track['artists'][0]['name'];


  });

  // Toggle play functionality
  var togglePlayButton = document.getElementById("togglePlayButton");
  togglePlayButton.addEventListener("click", function()
  {
    // Toggle playback
    player.togglePlay();
    // Toggle button appearances
    for (var i = 0; i < togglePlayButton.classList.length; i++)
    {
      // If user clicks on play swap it to pause
      if (togglePlayButton.classList[i] == "fa-play")
      {
        togglePlayButton.classList.remove("fa-play");
        togglePlayButton.classList.add("fa-pause");
        return;
      }
      // If user clicks on pause swap it to play
      if (togglePlayButton.classList[i] == "fa-pause")
      {
        togglePlayButton.classList.remove("fa-pause");
        togglePlayButton.classList.add("fa-play");
        return;
      }
    }
  })

  /* Next and previous track functionalities */
  var previousTrackButton = document.getElementById("previousTrack");
  var nextTrackButton = document.getElementById("nextTrack");

  previousTrackButton.addEventListener("click", function()
  {
    player.previousTrack();
  })

  nextTrackButton.addEventListener("click", function()
  {
    player.nextTrack();
  })

  /* Shuffle, repeat functionalities and resume/pause check */
  // Playback status updates
  player.addListener('player_state_changed', state =>
  {

    /* Resume / pause button check on player status change */
    // Check if state is paused and button has incorrect class - change it
    if (state["paused"] == true)
    {
      for (var i = 0; i < togglePlayButton.classList.length; i++)
      {
        if (togglePlayButton.classList[i] == "fa-pause")
        {
          togglePlayButton.classList.remove("fa-pause");
          togglePlayButton.classList.add("fa-play");
          return;
        }
      }
    }
    if (state["paused"] == false)
    {
      for (var i = 0; i < togglePlayButton.classList.length; i++)
      {
        if (togglePlayButton.classList[i] == "fa-play")
        {
          togglePlayButton.classList.remove("fa-play");
          togglePlayButton.classList.add("fa-pause");
          return;
        }
      }
    }
    /* same as above but for mobile */
    // Check if state is paused and button has incorrect class - change it
    if (state["paused"] == true)
    {
      for (var i = 0; i < togglePlayButtonMobile.classList.length; i++)
      {
        if (togglePlayButtonMobile.classList[i] == "fa-pause")
        {
          togglePlayButtonMobile.classList.remove("fa-pause");
          togglePlayButtonMobile.classList.add("fa-play");
          return;
        }
      }
    }
    if (state["paused"] == false)
    {
      for (var i = 0; i < togglePlayButtonMobile.classList.length; i++)
      {
        if (togglePlayButtonMobile.classList[i] == "fa-play")
        {
          togglePlayButtonMobile.classList.remove("fa-play");
          togglePlayButtonMobile.classList.add("fa-pause");
          return;
        }
      }
    }

    /* Some shuffle logic */
    // Store the shuffle value in my global variable
    globalVars.shuffle = state["shuffle"];

    // Change the shuffle button color when shuffle state changes
    var shuffleButton = document.getElementById("toggleShuffle");
    if (state["shuffle"])
    {
      // Change the color of the shuffle button
      shuffleButton.style.color = "#1DB954";
    }
    else
    {
      // Change the color of the shuffle button
      shuffleButton.style.color = "#c2c2c2";
    }

    /*Some repeat logic*/
    // Store the repeat value in my global variable
    globalVars.repeat = state["repeat_mode"];
    // Change the repeat button when repeat state changes
    var repeatButton = document.getElementById("toggleRepeat");
    // No repeating
    if (state["repeat_mode"] == 0)
    {
      // Change the color of the repeat button
      repeatButton.style.color = "#c2c2c2";
    }
    // Repeating the whole playlist
    else if(state["repeat_mode"] == 1)
    {
      // Change the color of the repeat button
      repeatButton.style.color = "#1DB954";
    }
    // Repeating one track
    else
    {
      // Change the color of the repeat button
      repeatButton.style.color = "red";
    }

  });

  /*Shuffle functionality*/
  var shuffleButton = document.getElementById("toggleShuffle");
  shuffleButton.addEventListener("click", function()
  {
    // If shuffle is on, I want to turn it off with a click (I know shuffle value from the player state listener
    if (globalVars.shuffle)
    {
      // Send request to spotify
      toggleShuffle("false");
    }

    // Else shuffle is off and I want to turn it on
    else
    {
      // Send request to spotify
      toggleShuffle("true");
    }
  })

  /*Repeat functionality*/
  var repeatButton = document.getElementById("toggleRepeat");

  repeatButton.addEventListener("click", function()
  {
    if (globalVars.repeat == 0)
    {
      setRepeat("context");
    }
    else if (globalVars.repeat == 1)
    {
      setRepeat("track");
    }
    else
    {
      setRepeat("off");
    }
  })

  /* Volume control */
  var volumeMute = document.getElementById("muteButton");
  var volumeRange = document.getElementById("volumeRange");

  volumeRange.style.background = 'linear-gradient(to right, #787878 0%, #787878 ' + volumeRange.value + '%, #141414 ' + volumeRange.value + '%, #141414 100%)';

  // On click toggle mute
  volumeMute.addEventListener("click", function()
  {
    // Getting the volume
    player.getVolume().then(volume =>
    {

      // Muting
      if (volume != null)
      {
        // Remembering the volume value pre-mute
        globalVars.volume = volumeRange.value;

        // Settning volume and slider to 0
        volumeRange.value = "0";
        player.setVolume(0);

        // Removing the background range color
        volumeRange.style.background = 'linear-gradient(to right, #787878 0%, #787878 ' + volumeRange.value + '%, #141414 ' + volumeRange.value + '%, #141414 100%)';

        // Changing icons
        volumeMute.classList.remove("fa-volume-up");
        volumeMute.classList.add("fa-volume-mute");


      }
      // Unmuting
      else
      {
        // Trying to set volume to value before muting
        if(globalVars.volume != 0 || globalVars.volume != null)
        {
          volumeRange.value = globalVars.volume;
          player.setVolume(globalVars.volume / 100);
        }
        // Else setting it to 40%
        else
        {
          volumeRange.value = "50";
          player.setVolume(0.5);
        }

        // Changing icons
        volumeMute.classList.remove("fa-volume-mute");
        volumeMute.classList.add("fa-volume-up");

        // Adding the background range color
        volumeRange.style.background = 'linear-gradient(to right, #787878 0%, #787878 ' + volumeRange.value + '%, #141414 ' + volumeRange.value + '%, #141414 100%)';

      }
    });
  })

  // This executes on range change
  var volumeListener = function()
  {
    // Getting range value and setting it to the player
    var volumeValue = volumeRange.value;
    player.setVolume(volumeValue / 100);

    if (volumeValue != 0)
    {
      // Changing icons
      volumeMute.classList.remove("fa-volume-mute");
      volumeMute.classList.add("fa-volume-up");
    }
    else
    {
      // Changing icons
      volumeMute.classList.remove("fa-volume-up");
      volumeMute.classList.add("fa-volume-mute");
    }
  }

  // Function for volume change
  onRangeChange(volumeRange, volumeListener);


  /* Progress bar
   * TODO: I need to find a way NOT to run this function every 1second when there is nothing happening.
  */

  // Running the function every 1second
  window.setInterval(function()
  {
    // Getting current player status
    player.getCurrentState().then(state =>
    {
      // If user is not playing anything
      if (!state)
      {
        return;
      }
      // When user is playing something I am getting info
      let
      {
        current_track,
        next_tracks: [next_track]
      } = state.track_window;

      // Setting current track position
      // Duration is changed on player change above
      var trackPosition = document.getElementById("trackPosition");
      var positon = (state["position"]/1000).toString().toHHMMSS();
      trackPosition.innerHTML = positon;

      // Track range display
      var trackRange = document.getElementById("trackRange");
      var relativePosition = (state["position"] / current_track["duration_ms"]) * 100;
      trackRange.value = relativePosition;

      // Fill the backgroud of the slider
      trackRange.style.background = 'linear-gradient(to right, #787878 0%, #787878 ' + trackRange.value + '%, #141414 ' + trackRange.value + '%, #141414 100%)'

    });
  }, 1000);

  // Seek track position on track range change
  var trackRange = document.getElementById("trackRange");

  var seekTrackListener = function()
  {
    // Getting the range value (% value of duration)
    var trackPosition = trackRange.value;

    // Getting the duration of the song
    var trackDuration = globalVars.duration;

    // Seeking % value of the track
    player.seek(trackPosition/100 * trackDuration);
  }

  // Function for track range change
  onRangeChange(trackRange, seekTrackListener);

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

      // Pause Spotify playback
      player.pause();
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
        // Resume Spotify playback
        player.resume();

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

        // Resume Spotify playback
        player.resume();
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

  /*
   * MOBILE!
   *
  */
  // Toggle play functionality
  var togglePlayButtonMobile = document.getElementById("togglePlayButtonMobile");
  togglePlayButtonMobile.addEventListener("click", function()
  {
    // Toggle playback
    player.togglePlay();
    // Toggle button appearances
    for (var i = 0; i < togglePlayButtonMobile.classList.length; i++)
    {
      // If user clicks on play swap it to pause
      if (togglePlayButtonMobile.classList[i] == "fa-play")
      {
        togglePlayButtonMobile.classList.remove("fa-play");
        togglePlayButtonMobile.classList.add("fa-pause");
        return;
      }
      // If user clicks on pause swap it to play
      if (togglePlayButtonMobile.classList[i] == "fa-pause")
      {
        togglePlayButtonMobile.classList.remove("fa-pause");
        togglePlayButtonMobile.classList.add("fa-play");
        return;
      }
    }
  })

}; // end of SDK

/* Helpers*/

// https://stackoverflow.com/questions/18544890/onchange-event-on-input-type-range-is-not-triggering-in-firefox-while-dragging
// Function to grab range changes
function onRangeChange(r,f) {
  var n,c,m;
  r.addEventListener("input",function(e){
    n=1;c=e.target.value;if(c!=m)f(e);m=c;
    this.style.background = 'linear-gradient(to right, #787878 0%, #787878 ' + this.value + '%, #141414 ' + this.value + '%, #141414 100%)'
  });
  r.addEventListener("change",function(e){
    if(!n)f(e);
    this.style.background = 'linear-gradient(to right, #787878 0%, #787878 ' + this.value + '%, #141414 ' + this.value + '%, #141414 100%)'
  });
}

// https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
// Function to convert seconds to hh:mm:ss
String.prototype.toHHMMSS = function ()
{
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours = hours;}
    if (minutes < 10) {minutes = minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    if (hours == 0)
    {
      return minutes+':'+seconds;
    }
    else
    {
      return hours+':'+minutes+':'+seconds;
    }
}

/* Requests to Spotify */

// Play a specified track on the Web Playback SDK's device ID
// https://glitch.com/edit/#!/spotify-web-playback?path=script.js:67:0
function play(uri)
{
  // Official info: https://developer.spotify.com/console/put-play/
  // Preping data object to send it to Spotify
  var uriData = '{"context_uri":' + '"' + uri + '"' + "}";

  $.ajax({
    url: "https://api.spotify.com/v1/me/player/play?device_id=" + globalVars.id,
    type: "PUT",
    data: uriData,
    beforeSend: function(xhr, data)
    {
      console.log("before send data: ", data)
      xhr.setRequestHeader('Authorization', 'Bearer ' + token );
    },
    success: function(data)
    {
      console.log(data)
    }
  });
}

function toggleShuffle(state)
{
  // Send request to spotify
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/shuffle?state=" + state + "&device_id=" + globalVars.id,
    type: "PUT",
    beforeSend: function(xhr, data)
    {
      console.log("before send data: ", data)
      xhr.setRequestHeader('Authorization', 'Bearer ' + token );
    },
    success: function(data)
    {
      console.log(data)
    }
  })
}

function setRepeat(state)
{
  // Send request to spotify
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/repeat?state=" + state + "&device_id=" + globalVars.id,
    type: "PUT",
    beforeSend: function(xhr, data)
    {
      console.log("before send data: ", data)
      xhr.setRequestHeader('Authorization', 'Bearer ' + token );
    },
    success: function(data)
    {
      console.log(data)
    }
  })
}
