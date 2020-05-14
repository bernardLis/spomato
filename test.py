import sys
import json

import time

import random

scope = 'streaming, user-library-read, playlist-read-collaborative, user-modify-playback-state, user-read-playback-position, user-read-currently-playing'
client_id='b7c4807138a84147bd1147b9bf602048'
client_secret='699795974a5d467e900b64b3018d09d4'
redirect_uri='https://google.com/'

words = [
"limit",
"blood",
"exercise",
"rod",
"charming",
"moor",
"branch",
"brake",
"expensive",
"fretful",
"irate",
"blind",
"undesirable",
"efficacious",
"unkempt",
"lavish",
"destroy",
"mouth",
"yarn",
"detailed",
"mammoth",
"womanly",
"pricey",
"stupid",
"owe",
"repulsive",
"unbecoming",
"print",
"whispering",
"snow",
"driving",
"wood",
"confused",
"hop",
"ambiguous",
"metal",
"sophisticated",
"touch",
"forgetful",
"competition",
"vague",
"fast",
"quiver",
"truthful",
"hilarious",
"round",
"volcano",
"redundant",
"hurt",
"cry",]

i = 0
for n,word in enumerate(words):
    if i < 3:
        print(n, word)
        if i == 2:
            print("end row 3")

    if 3 <= i < 7:
        print(n, word)
        if i == 6:
            print("end row 4")
    if 7 <= i <= 11:
        print(n, word)
        if i == 11:
            print("end row 5")
    if i == 11:
        i = 0
    else:
        i = i + 1
