/* Calls to flask */

// Refreshing tokens through flask
// https://www.reddit.com/r/flask/comments/afgks4/how_to_get_a_javascript_function_to_call_a_flask/

function refreshOauthToken() {
  $.ajax({
	type : "POST",
	url : '/refresh_Oauth',
	dataType: "json",
	contentType: 'application/json;charset=UTF-8',
	success: function (data)
  {
    token = data["token"]
	}
	});
  return token;
}

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




/* Spotify Requests */

// Play a specified track on the Web Playback SDK's device ID
// https://glitch.com/edit/#!/spotify-web-playback?path=script.js:67:0
function play(uri)
{
  // Official info: https://developer.spotify.com/console/put-play/
  // Preping data object for Spotify
  var uriData = '{"context_uri":' + '"' + uri + '"' + "}";

  $.ajax({
    url: "https://api.spotify.com/v1/me/player/play?device_id=" + globalVars.id,
    type: "PUT",
    data: uriData,
    beforeSend: function(xhr, data)
    {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token );
    },
    success: function(data)
    {
    }
  });
}

function toggleShuffle(state)
{
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/shuffle?state=" + state + "&device_id=" + globalVars.id,
    type: "PUT",
    beforeSend: function(xhr, data)
    {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token );
    },
    success: function(data)
    {
    }
  })
}

function setRepeat(state)
{
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/repeat?state=" + state + "&device_id=" + globalVars.id,
    type: "PUT",
    beforeSend: function(xhr, data)
    {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token );
    },
    success: function(data)
    {
    }
  })
}
