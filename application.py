import os
import re
import json
import sys
import urllib
import requests
import time

import spotipy
import spotipy.util as util

from cs50 import SQL
from datetime import date, datetime, timedelta

from flask import Flask, flash, jsonify, redirect, render_template, request, session, request
from flask_session import Session

from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology

from requests_oauthlib import OAuth2Session

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

#SPOTIFY AUTHORIZATION CODE - https://stackoverflow.com/questions/57580411/storing-spotify-token-in-flask-session-using-spotipy
API_BASE = 'https://accounts.spotify.com'
# Make sure you add this to Redirect URIs in the setting of the application dashboard
REDIRECT_URI = "http://127.0.0.1:5000/api_callback"

# Spotify variables
CLI_ID = "b7c4807138a84147bd1147b9bf602048"
CLI_SEC = "699795974a5d467e900b64b3018d09d4"
SCOPE = "streaming, user-library-read, playlist-read-private, playlist-read-collaborative, user-modify-playback-state, user-read-playback-position, user-read-currently-playing, user-read-email, user-read-private, user-read-playback-state"
# Set this to True for testing but you probaly want it set to False in production.
# Whether or not to force the user to approve the app again if they’ve already done so. If false (default), a user who has already approved the application may be automatically redirected to the URI specified by redirect_uri. If true, the user will not be automatically redirected and will have to approve the app again.
# When I set it to false in dev env it breaks the authentication
SHOW_DIALOG = True

@app.route("/", methods=["GET", "POST"])
def index():
    """Spotify Timer App!"""
    # User reached route via POST
    if request.method == "POST":
        # User wants to login with Spotify
        # authorization-code-flow Step 1. Have your application request authorization;
        # the user logs in and authorizes access
        if request.form["btn"] == "spotifyLogIn":
            auth_url = f'{API_BASE}/authorize?client_id={CLI_ID}&response_type=code&redirect_uri={REDIRECT_URI}&scope={SCOPE}&show_dialog={SHOW_DIALOG}'
            return redirect(auth_url)

        # User reached route via POST to change the timer settings
        else:
            tomatoT = request.form.get("tomatoT")
            if (tomatoT == ""):
                tomatoT = 25
            breakT = request.form.get("breakT")
            if (breakT == ""):
                breakT = 5
            return render_template("index.html", tomatoT=tomatoT, breakT=breakT, route="/")

    # User reached route via GET (as by loading the page)
    else:
        tomatoT = 25
        breakT = 5
        return render_template("index.html", tomatoT=tomatoT, breakT=breakT)

# authorization-code-flow Step 2.
# Have your application request refresh and access tokens;
# Spotify returns access and refresh tokens
@app.route("/api_callback")
def api_callback():
    session.clear()
    code = request.args.get('code')

    auth_token_url = f"{API_BASE}/api/token"
    res = requests.post(auth_token_url, data={
        "grant_type":"authorization_code",
        "code":code,
        "redirect_uri":"http://127.0.0.1:5000/api_callback",
        "client_id":CLI_ID,
        "client_secret":CLI_SEC
        })

    res_body = res.json()
    session["token"] = res_body.get("access_token")
    session["refresh_token"] = res_body.get("refresh_token")
    session["expires_in"] = res_body.get("expires_in")

    return redirect("/afterLogin/")

# authorization-code-flow Step 3.
# Use the access token to access the Spotify Web API;
# Spotify returns requested data
@app.route("/afterLogin/", methods=["GET", "POST"])
def after_login():
    # Get user's Spotify Auth tokens
    token = session["token"]
    refreshToken = session["refresh_token"]

    # Get users Spotify playlists
    sp = spotipy.Spotify(auth=token)
    playlistsJSON = json.dumps(sp.current_user_playlists(), indent=4)
    playlists = json.loads(playlistsJSON)

    # Append kitten placeholders to empty playlists
    for item in playlists["items"]:
        #cover - item["images"][0]["url"]
        if (len(item["images"]) == 0):
            item["images"].append({'url': 'https://placekitten.com/300/300'})


    # User reached route via POST
    if request.method == "POST":
        # User reached route via POST to change the timer settings
        tomatoT = request.form.get("tomatoT")
        if (tomatoT == ""):
            tomatoT = 25
        breakT = request.form.get("breakT")
        if (breakT == ""):
            breakT = 5
        return render_template("afterLogin.html", tomatoT=tomatoT, breakT=breakT, playlists=playlists, token=token, refreshToken=refreshToken, route="/afterLogin/")

    # User reached route via GET
    else:
        # Variables for JavaScript
        tomatoT = 25
        breakT = 5
        return render_template("afterLogin.html", tomatoT=tomatoT, breakT=breakT, playlists=playlists, token=token, refreshToken=refreshToken, route="/afterLogin/")

def errorhandler(e):
    """Handle error"""
    if not isinstance(e, HTTPException):
        e = InternalServerError()
    return apology(e.name, e.code)


# Listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)
