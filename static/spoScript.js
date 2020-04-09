
/**
  * SPOTIFY SDK...
  *
  *
  *

*/

// Player variables I want to be global are here (device_id, )
var playerVar = {};

// Spotify SDK
window.onSpotifyWebPlaybackSDKReady = () => {
  const player = new Spotify.Player({
    name: 'Web Playback SDK Quick Start Player',
    getOAuthToken: cb => { cb(token); }
  });
  // Error handling
  player.addListener('initialization_error', ({ message }) => { console.error(message); });
  player.addListener('authentication_error', ({ message }) => { console.error(message); });
  player.addListener('account_error', ({ message }) => { console.error(message); });
  player.addListener('playback_error', ({ message }) => { console.error(message); });

  // Playback status updates
  player.addListener('player_state_changed', state => { console.log(state); });

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

  // Creating pause button I will be appending and removing
  var pauseButton = document.createElement("i");
  pauseButton.classList.add("fa-volume-up", "pauseButton", "togglePlayPlaylist", "fa", "visible");
  // Adding event listener to it with pause functionality
  // On mouse enter/mouse leave - change icons
  pauseButton.addEventListener("mouseenter", function()
  {
    pauseButton.classList.remove("fa-volume-up");
    pauseButton.classList.add("fa-pause");
  })
  pauseButton.addEventListener("mouseleave", function()
  {
    pauseButton.classList.remove("fa-pause");
    pauseButton.classList.add("fa-volume-up");
  })

  // On click - pause playback, remove yourself and add play button
  pauseButton.addEventListener("click", function()
  {
    // Pause playback
    player.pause();

    // Create the play button
    var playButton = document.createElement("i");
    playButton.classList.add("playButton", "fa-play", "togglePlayPlaylist", "hidden");
    // Play button loses it's event listener after it is removed and added again, need to add listener AGAIN here.
    playButton.addEventListener("click", function()
    {
      p = playButton.parentNode;
      console.log("p/;", p);
      // Play playlist from uri stored in parent's data object
      play(p.dataset.playlisturi);

      // Add pause button
      p.appendChild(pauseButton);

      // Remove play button
      $(this).remove();
    })

    // Append the play button to parent
    p = pauseButton.parentNode;
    p.appendChild(playButton);
    $(this).remove();
  })

  // Getting button wrappers that store playlist uris
  var playlists = document.getElementsByClassName("playlistURI");
  var playlistsL = playlists.length;

  var currentlyPlayling = 0;
  // Create the play button
  var playButton = document.createElement("i");
  playButton.classList.add("playButton", "fa-play", "togglePlayPlaylist", "hidden");
  // Play button loses it's event listener after it is removed and added again, need to add listener AGAIN here.
  playButton.addEventListener("click", function()
  {
    p = playButton.parentNode;
    console.log("p/;", p);
    // Play playlist from uri stored in parent's data object
    play(p.dataset.playlisturi);

    // Add pause button
    p.appendChild(pauseButton);

    // Remove play button
    $(this).remove();
  })

  var currentlyPlayling;
  // https://stackoverflow.com/questions/19696015/javascript-creating-functions-in-a-for-loop
  // I need to use 'let i' when creating functions in a loop :)
  for (let i = 0; i < playlistsL; i++)
  {
    playlists[i].children[0].addEventListener("click", function(e)
    {

      // Appending it to previously played playlist
      playlists[currentlyPlayling].appendChild(playButton);

      // Changing currently playling playlist
      currentlyPlayling = i;
      console.log("currentlyPlayling?", currentlyPlayling);
      // Play playlist from uri stored in data object
      play(playlists[i].dataset.playlisturi);

      // Remove play button
      playlists[i].children[0].remove();

      // Add pause button
      playlists[i].appendChild(pauseButton);
    })
  }

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


// Play a specified track on the Web Playback SDK's device ID
// https://glitch.com/edit/#!/spotify-web-playback?path=script.js:67:0

function play(uri) {
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
