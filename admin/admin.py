#!/usr/bin/python3
from bottle import route, run, static_file, request, response
import pystache
import os
import random

if __name__ == '__main__':
    base = '/admin'
else:
    base = ''

renderer = pystache.Renderer(search_dirs=os.path.join(os.path.dirname(__file__), 'template'))
sessions = {}

# ROUTES
@route(base)
@route(base+'/')
def index():
    return renderer.render_name('index')

@route(base+'/session')
def get_session():
    return "%s" % session()

@route(base+'/login')
def login():
    create_session({'logged_in': True})
    return "Logged in."

@route(base+'/logout')
def logout():
    destroy_session()
    return "Logged out."

# SESSION
def session():
    token = request.get_cookie('session_token')
    if not(token) or not(token in sessions):
        return None
    else:
        return sessions[token]

def destroy_session():
    token = request.get_cookie('session_token')
    if not(token):
        return
    if token in sessions:
        del(sessions[token])
    response.delete_cookie('session_token')

def create_session(data={}):
    token_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
    token = ''.join([random.choice(token_chars) for x in range(16)])
    sessions[token] = data
    response.set_cookie('session_token', token)

if __name__ == '__main__':
    @route('/')
    @route('/<filename:re:(css|img|js)/.*>')
    def static(filename='index.html'):
        return static_file(filename, root='..')


    run(host='localhost', port=8080, debug=True, reloader=True)
