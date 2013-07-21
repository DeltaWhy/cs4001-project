import os, sys
sys.path.insert(0, os.path.dirname(__file__))

import bottle
from admin import *
application = bottle.default_app()
