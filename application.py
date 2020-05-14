import os
import re
import json
import sys
import urllib
import requests
import time
import random

import spotipy
import spotipy.util as util

from cs50 import SQL
from datetime import date, datetime, timedelta

from flask import Flask, flash, jsonify, redirect, render_template, request, session, request
from flask_session import Session
from flask_cors import CORS, cross_origin

from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

from helpers import apology

from requests_oauthlib import OAuth2Session

# Configure application
app = Flask(__name__)
application = app # our hosting requires application in passenger_wsgi

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Make session data persistent
# https://pythonise.com/series/learning-flask/flask-session-object
# TEMP secret key for sessions
app.config["SECRET_KEY"] = "alabama123KENTUCKY"
app.config.from_object(__name__)


# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_TYPE"] = "filesystem"

Session(app)
CORS(app)

#SPOTIFY AUTHORIZATION CODE - https://stackoverflow.com/questions/57580411/storing-spotify-token-in-flask-session-using-spotipy
authorization_base_url = 'https://accounts.spotify.com'
# Make sure you add this to Redirect URIs in the setting of the application dashboard
redirect_uri = "http://127.0.0.1:5000/callback"
# Referesh url
refresh_url = "https://accounts.spotify.com/api/token"

# Spotify variables
client_id = "b7c4807138a84147bd1147b9bf602048"
client_secret = "699795974a5d467e900b64b3018d09d4"
scope = "streaming, user-library-read, playlist-read-private, playlist-read-collaborative, user-modify-playback-state, user-read-playback-position, user-read-currently-playing, user-read-email, user-read-private, user-read-playback-state"
# Set this to True for testing but you probaly want it set to False in production.
# Whether or not to force the user to approve the app again if they’ve already done so. If false (default), a user who has already approved the application may be automatically redirected to the URI specified by redirect_uri. If true, the user will not be automatically redirected and will have to approve the app again.
# When I set it to false in dev env it breaks the authentication
SHOW_DIALOG = True


@app.route("/", methods=["GET", "POST"])
@cross_origin(supports_credentials=True)
def index():
    """Spotify Timer App!"""

    # Get all alarms and pass them to jinjia
    cwd = os.getcwd()
    if (cwd == "alarms"):
        alarms = os.listdir()
    else:
        os.chdir("static")
        os.chdir("alarms")
        alarms = os.listdir()

    # Go back to home directory
    abspath = os.path.abspath(__file__)
    dname = os.path.dirname(abspath)
    os.chdir(dname)

    # User reached route via POST
    if request.method == "POST":
        # Step 1: User Authorization.
        # Redirect the user/resource owner to the OAuth provider
        # using an URL with a few key OAuth parameters.
        if request.form["btn"] == "spotifyLogIn":
            sp_oauth = spotipy.oauth2.SpotifyOAuth(client_id = client_id, client_secret = client_secret, redirect_uri = redirect_uri, scope = scope)
            auth_url = sp_oauth.get_authorize_url()
            return redirect(auth_url)

        # User reached route via POST to change the timer settings
        else:
            tomatoT = request.form.get("tomatoT")
            if (tomatoT == ""):
                tomatoT = 25
            session["tomatoT"] = tomatoT

            breakT = request.form.get("breakT")
            if (breakT == ""):
                breakT = 5
            session["breakT"] = breakT

            return render_template("index.html", tomatoT=session["tomatoT"], breakT=session["breakT"], route="/", alarms=alarms)

    # User reached route via GET (as by loading the page)
    else:
        if session.get("tomatoT") is None:
            session["tomatoT"] = 25
        if session.get("breakT") is None:
            session["breakT"] = 5

        return render_template("index.html", tomatoT=session["tomatoT"], breakT=session["breakT"], route="/", alarms=alarms)

# authorization-code-flow Step 2.
# Have your application request refresh and access tokens;
# Spotify returns access and refresh tokens
@app.route("/callback")
@cross_origin(supports_credentials=True)
def callback():

    # this is wrong, i need to find a way to cache token smarter.
    # https://pythonhosted.org/Flask-Session/
    # Session id
    s = session.sid
    print("session.sid: ", s)
    print("in callback session.get:", session.get("tomatoT"))

    # I've added a username because it was throwing an error without it, I bet that it is a wrong solution.
    # Don't reuse a SpotifyOAuth object because they store token info and you could leak user tokens if you reuse a SpotifyOAuth object
    sp_oauth = spotipy.oauth2.SpotifyOAuth(client_id = client_id, username = s, client_secret = client_secret, redirect_uri = redirect_uri, scope = scope)
    session.clear()
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)

    # Saving the access token along with all other token related info
    session["token_info"] = token_info

    session["tomatoT"] = session.get("tomatoT")
    session["breakT"] = session.get("breakT")

    return redirect("/afterLogin/")

# authorization-code-flow Step 3.
# Use the access token to access the Spotify Web API;
# Spotify returns requested data
@app.route("/afterLogin/", methods=["GET", "POST"])
@cross_origin(supports_credentials=True)
def after_login():
    print("in afterlogin session.get:", session.get("tomatoT"))


    # Get user's Spotify Auth tokens
    session['token_info'], authorized = get_token(session)
    session.modified = True
    if not authorized:
        return redirect('/')
    data = request.form
    sp = spotipy.Spotify(auth=session.get('token_info').get('access_token'))

    token = session['token_info']['access_token']
    refreshToken = session['token_info']['refresh_token']

    # Get user's Spotify playlists
    playlistsJSON = json.dumps(sp.current_user_playlists(), indent=4)
    playlists = json.loads(playlistsJSON)

    # [new] Get user's current playback
    current_playbackJSON = json.dumps(sp.current_playback(), indent=4)
    current_playback = json.loads(current_playbackJSON)

    if not current_playbackJSON == "null":
        current_playbackDict = {
            "volume": current_playback["device"]["volume_percent"],
            "shuffle": current_playback["shuffle_state"],
            "repeat": current_playback["repeat_state"],
            "context_uri": current_playback["context"]["uri"],
            "cover_img": current_playback["item"]["album"]["images"][0]["url"],
            "artist": current_playback["item"]["album"]["artists"][0]["name"],
            "track_name": current_playback["item"]["name"],
            "track_uri": current_playback["item"]["uri"]
        }
    else:
        current_playbackDict = {
            "volume": 50,
            "shuffle": "false",
            "repeat": "off",
            "context_uri": "spotify:playlist:2E2eI5zIlsulHgaN1n3bkQ",
            "cover_img": "https://placekitten.com/300/300",
            "artist": "a cat",
            "track_name": "miau miau miau",
            "track_uri": "spotify:track:3BjygBarJk0ZDwEooe1ccf"
        }

    # Append kitten placeholders to empty playlists
    for item in playlists["items"]:
        if (len(item["images"]) == 0):
            item["images"].append({'url': 'https://placekitten.com/300/300'})

    # Get all alarms and pass them to jinjia
    cwd = os.getcwd()
    if (cwd == "alarms"):
        alarms = os.listdir()
    else:
        os.chdir("static")
        os.chdir("alarms")
        alarms = os.listdir()

    # Go back to home directory
    abspath = os.path.abspath(__file__)
    dname = os.path.dirname(abspath)
    os.chdir(dname)

    # User reached route via POST
    if request.method == "POST":
        # User reached route via POST to change the timer settings
        tomatoT = request.form.get("tomatoT")
        if (tomatoT == ""):
            tomatoT = 25
        session["tomatoT"] = tomatoT

        breakT = request.form.get("breakT")
        if (breakT == ""):
            breakT = 5
        session["breakT"] = breakT

        return render_template("afterLogin.html", tomatoT=session["tomatoT"], breakT=session["breakT"], alarms=alarms, playlists=playlists, route="/afterLogin/", current_playback=current_playbackDict)

    # User reached route via GET
    else:
        print("im in get");
        # Variables for JavaScript
        if session.get("tomatoT") is None:
            session["tomatoT"] = 25
        if session.get("breakT") is None:
            session["breakT"] = 5

        return render_template("afterLogin.html", tomatoT=session["tomatoT"], breakT=session["breakT"], alarms=alarms, playlists=playlists, route="/afterLogin/", current_playback=current_playbackDict)

# Refresh token for SDK
@app.route("/refresh_Oauth", methods=['POST'])
@cross_origin(supports_credentials=True)
def refresh_Oauth():
    session['token_info'] = get_token(session)[0]

    token = session['token_info'].get('access_token')
    refreshToken = session['token_info'].get('refresh_token')

    response = jsonify(token=token, refreshToken=refreshToken)

    return response


# Checks to see if token is valid and gets a new token if not
def get_token(session):
    token_valid = False
    token_info = session.get("token_info")

    # Checking if the session already has a token stored
    # I don't get this
    if not (session.get('token_info', False)):
        token_valid = False
        return token_info, token_valid

    # Checking if token has expired
    now = int(time.time())
    is_token_expired = session.get('token_info').get('expires_at') - now < 60

    # Refreshing token if it has expired
    if (is_token_expired):
        # this is wrong, i need to find a way to store tokens smarter.
        # https://pythonhosted.org/Flask-Session/
        # Session id
        s = session.sid

        # Don't reuse a SpotifyOAuth object because they store token info and you could leak user tokens if you reuse a SpotifyOAuth object
        sp_oauth = spotipy.oauth2.SpotifyOAuth(client_id = client_id, username = s, client_secret = client_secret, redirect_uri = redirect_uri, scope = scope)
        token_info = sp_oauth.refresh_access_token(session.get('token_info').get('refresh_token'))

    token_valid = True
    return token_info, token_valid

# Handling alarm uploads
# https://flask.palletsprojects.com/en/1.1.x/patterns/fileuploads/
UPLOAD_FOLDER = 'static/alarms'
ALLOWED_EXTENSIONS = {'wav', 'mp3'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/alarmUpload", methods=["GET", "POST"])
@cross_origin()
def ProcessAlarm():
    print("im in process alarm")
    if request.method == "POST":
        print("post")

        # Checking if the post has the file
        if 'file' not in request.files:
            print('No file part')
            return redirect("/")

        file = request.files['file']
        print("file", file)

        # if user does not select file, browser also
        if file.filename == '':
            print('No selected file')
            return jsonify("No file selected")

        # if file has invalid extension return
        if not allowed_file(file.filename):
            print("not allowed file")
            return jsonify("Not allowed file")

        if file and allowed_file(file.filename):
            print("im in if file and allowed_file(file.filename)")
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return jsonify("Great file, I am taking it.")

def errorhandler(e):
    """Handle error"""
    if not isinstance(e, HTTPException):
        e = InternalServerError()
    return apology(e.name, e.code)


# Listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)
