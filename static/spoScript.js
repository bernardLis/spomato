
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
  * Every playlist is a clickable item
  *
  */
  var playlists = document.getElementsByClassName("playlistURI");
  playlistsL = playlists.length;
  console.log("playlistsL:", playlistsL);

  // https://stackoverflow.com/questions/19696015/javascript-creating-functions-in-a-for-loop
  // need to use 'let i' when creating functions in a loop :)
  for (let i = 0; i < playlistsL; i++)
  {
    console.log(playlists[i]);
    playlists[i].addEventListener("click", function(e)
    {
      console.log("clickCLICKCKKCKCKCK");
      play(playlists[i].dataset.playlisturi);
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
// I could be passing uri as a variable to this function
function play(uri) {
  console.log("uri:", uri);

  // Official info: https://developer.spotify.com/console/put-play/

  // THIS WORKS:
  //    data: '{"context_uri":"spotify:playlist:3xEy3vo818iCMPWISCKhii"}',
  // but is hardcoded I want to pass uri as a variable context_uri: uri

  // TRY 6 - stupid.
  var blib = '{"context_uri":' + '"' + uri + '"' + "}";
  //console.log(blib)
  // does not work

  $.ajax({
   url: "https://api.spotify.com/v1/me/player/play?device_id=" + playerVar.id,
   type: "PUT",
   data: blib,
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

// before SEND LOGS:
// one that works
//    data: '{"context_uri":"spotify:playlist:3xEy3vo818iCMPWISCKhii"}',
// data: "{"context_uri":"spotify:playlist:3xEy3vo818iCMPWISCKhii"}"


// one that should work:
//    data: {"context_uri":uri},
// data: "context_uri=spotify%3Aplaylist%3A3xEy3vo818iCMPWISCKhii"

// how to make second one look like the first one?
//    data: {{"context_uri":uri}},
// breaks

// what do i get when:
//   var blib = "'" + '{"context_uri":' + '"' + uri + '"' + "}'";
// data: blib,
// data: "'{"context_uri":"spotify:playlist:3xEy3vo818iCMPWISCKhii"}'"

// what if:
//   var blib = '{"context_uri":' + '"' + uri + '"' + "}";
// wokrs. JEBANY BLIB!
