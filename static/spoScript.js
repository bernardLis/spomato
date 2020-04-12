
/**
  * SPOTIFY SDK
*/

// Player variables I want to be global are here (device_id, )
var playerVar = {};

// Spotify SDK
window.onSpotifyWebPlaybackSDKReady = () => {
  const player = new Spotify.Player({
    name: 'Spomato Player',
    getOAuthToken: cb => { cb(token); }
  });
  // Error handling
  player.addListener('initialization_error', ({ message }) => { console.error(message); });
  player.addListener('authentication_error', ({ message }) => { console.error(message); });
  player.addListener('account_error', ({ message }) => { console.error(message); });
  player.addListener('playback_error', ({ message }) => { console.error(message); });

  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    // Pushing device_id to playerVar object
    playerVar.id = device_id;
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

  // Display currently played track
  player.addListener('player_state_changed',
  ({position, duration, track_window: { current_track }}) =>
  {
    document.getElementById("cpCover").src = current_track['album']['images'][0]['url'];
    document.getElementById("cpName").innerHTML = current_track['name'];
    document.getElementById("cpArtist").innerHTML = current_track['artists'][0]['name'];
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

  /* Shuffle and repeat functionalities */
  // Playback status updates
  player.addListener('player_state_changed', state =>
  {
    console.log(state);

    /*Some shuffle logic*/
    // Store the shuffle value in my global variable
    playerVar.shuffle = state["shuffle"];

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
    playerVar.repeat = state["repeat_mode"];
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
    if (playerVar.shuffle)
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
    if (playerVar.repeat == 0)
    {
      setRepeat("context");
    }
    else if (playerVar.repeat == 1)
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
  var volumeVariables = {};

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
        volumeVariables.volume = volumeRange.value;

        // Settning volume and slider to 0
        volumeRange.value = "0";
        player.setVolume(0);

        // Changing icons
        volumeMute.classList.remove("fa-volume-up");
        volumeMute.classList.add("fa-volume-mute");
      }
      // Unmuting
      else
      {
        // Trying to set volume to value before muting
        if(volumeVariables.volume != 0 || volumeVariables.volume != null)
        {
          volumeRange.value = volumeVariables.volume;
          player.setVolume(volumeVariables.volume / 100);
        }
        // Else setting it to 40%
        else
        {
          volumeRange.value = "40";
          player.setVolume(0.4);
        }

        // Changing icons
        volumeMute.classList.remove("fa-volume-mute");
        volumeMute.classList.add("fa-volume-up");
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

  // https://stackoverflow.com/questions/18544890/onchange-event-on-input-type-range-is-not-triggering-in-firefox-while-dragging
  // function to grab range changes
  function onRangeChange(r,f) {
    var n,c,m;
    r.addEventListener("input",function(e){n=1;c=e.target.value;if(c!=m)f(e);m=c;});
    r.addEventListener("change",function(e){if(!n)f(e);});
  }

  // Calling the functions
  onRangeChange(volumeRange, volumeListener);


  /*
  * Other functionalities
  */

  // Setting functions to the elements
  document.getElementById("clicker").addEventListener("click", clicker);

  document.getElementById("resume").addEventListener("click", resume);
  document.getElementById("pause").addEventListener("click", pause);

  // Declaring functions
  function resume(){
    console.log("resume");
    player.resume();
  }

  function pause(){
    console.log("pause");
    player.pause();
  }

  // Clicker!!
  function clicker(){
    console.log("clicker", playerVar.id);
    var uri = "spotify:playlist:3xEy3vo818iCMPWISCKhii"
    play(uri);
  }

};

/* Requests to Spotify */
// Play a specified track on the Web Playback SDK's device ID
// https://glitch.com/edit/#!/spotify-web-playback?path=script.js:67:0

function play(uri)
{
  // Official info: https://developer.spotify.com/console/put-play/
  // Preping data object to send it to Spotify
  var uriData = '{"context_uri":' + '"' + uri + '"' + "}";

  $.ajax({
    url: "https://api.spotify.com/v1/me/player/play?device_id=" + playerVar.id,
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
    url: "https://api.spotify.com/v1/me/player/shuffle?state=" + state + "&device_id=" + playerVar.id,
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
    url: "https://api.spotify.com/v1/me/player/repeat?state=" + state + "&device_id=" + playerVar.id,
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
