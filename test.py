import sys
import json

import time

import random



scope = 'streaming, user-library-read, playlist-read-collaborative, user-modify-playback-state, user-read-playback-position, user-read-currently-playing'
client_id='b7c4807138a84147bd1147b9bf602048'
client_secret='699795974a5d467e900b64b3018d09d4'
redirect_uri='https://google.com/'

now = random.randint(0, 5000000000)
print(now)
