
/* ALARM UPLOAD HANDLING */

// File validation
// https://www.geeksforgeeks.org/file-type-validation-while-uploading-it-using-javascript/
// https://www.geeksforgeeks.org/validation-of-file-size-while-uploading-using-javascript-jquery/
var alarmFileInput = document.getElementById("alarmFileInput");
var fileValidationText = document.getElementById("fileValidationText");
var fileValidationType = document.getElementById("fileValidationType");
var fileValidationSize = document.getElementById("fileValidationSize");

alarmFileInput.addEventListener("change", function()
{
  // Reset the "alert" colors
  fileValidationType.style.color = "#e0e0e0";
  fileValidationSize.style.color = "#e0e0e0";

  var filePath = alarmFileInput.value;

  // Allowed file types
  var allowedExtensions = /(\.wav|\.mp3)$/i;

  // If user tries to upload invalid file type, color file type alert red
  if (!allowedExtensions.exec(filePath))
  {
    fileValidationType.style.color = "#db0000";
    alarmFileInput.value = '';
  }
  else
  {
    fileValidationType.style.color = "#1DB954";
  }

  // Validating size
  if (alarmFileInput.files.length > 0)
  {
    for (var i = 0; i <= alarmFileInput.files.length - 1; i++)
    {
      var fsize = alarmFileInput.files.item(i).size;
      var file = Math.round((fsize / 1024));

      // The size of the file.
      if (file >= 500)
      {
        fileValidationSize.style.color = "#db0000";
        alarmFileInput.value = '';
      }
      else
      {
        fileValidationSize.style.color = "#1DB954";
      }
    }
  }

  // Validate file name before the upload
  function getNameFromPath(strFilepath)
  {
    var objRE = new RegExp(/([^\/\\]+)$/);
    var strName = objRE.exec(strFilepath);

    if (strName == null)
    {
        return null;
    }
    else
    {
        return strName[0];
    }
  }

  var filePath = alarmFileInput.value
  var fileName = getNameFromPath(filePath)
  fileName = fileName.toLowerCase();

  // Check for hitler
  if (fileName.includes("hitler"))
  {
    // Reset the file input
    alarmFileInput.value = '';
    // Reset the "alert" colors
    fileValidationType.style.color = "#e0e0e0";
    fileValidationSize.style.color = "#e0e0e0";
    // Alert user
    alert("No.");
  }
  // Check for pejorative usage of gay in PL
  if (fileName.includes("pedał") || fileName.includes("pedzio") || fileName.includes("pederasta"))
  {
    // Reset the file input
    alarmFileInput.value = '';
    // Reset the "alert" colors
    fileValidationType.style.color = "#e0e0e0";
    fileValidationSize.style.color = "#e0e0e0";
    // Alert user
    alert("https://www.youtube.com/watch?v=xfBsr10ixkY");
  }
})

// Sending the file to flask
$(function()
{
    $('#alarmUpload').click(function(e)
    {
      e.preventDefault();
      var form_data = new FormData($('#uploadAlarmForm')[0]);
      $.ajax({
            type: 'POST',
            url: '/alarmUpload',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            beforeSend: function(xhr, data)
            {
            },
            success: function(data) {
                console.log('Success!', data);
                location.reload();
            },
        });
    });
});


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

// Play a playlist from URI on the Web Playback SDK's device ID
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

// Transfer user's playback to Spomato
function transferPlayback()
{
  // Official info: https://developer.spotify.com/console/put-user-player/
  // Preping data object for Spotify
  // to start playing right away   var uriData = "{" + '"' + "device_ids" + '"' + ": [" + '"' + globalVars.id + '"' + "]," + '"play": "true"' + "}";

  var dataX = "{" + '"' + "device_ids" + '"' + ": [" + '"' + globalVars.id + '"' + "]" + "}";

  $.ajax({
    url: "https://api.spotify.com/v1/me/player",
    type: "PUT",
    data: dataX,
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
