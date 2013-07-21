#!/usr/bin/python3
from bottle import Bottle, run, static_file, request, response, redirect
import pystache
import os
import random

app = Bottle()

if __name__ == '__main__':
    base = '/admin/'
    redirectbase = '/admin/'
else:
    base = '/'
    redirectbase = '/cs4001/admin/'

renderer = pystache.Renderer(search_dirs=os.path.join(os.path.dirname(__file__), 'template'))
sessions = {}

# ROUTES
@app.get(base)
def root():
    redirect(redirectbase+'index')

@app.get(base+'index')
def index():
    sess = session()
    if sess:
        return renderer.render_name('index', session=sess)
    else:
        redirect(redirectbase+'login')

@app.get(base+'session')
def get_session():
    return "%s" % session()

@app.get(base+'login')
def login():
    sess = session()
    if sess:
        redirect(redirectbase+'index')
    else:
        return renderer.render_name('login')

@app.post(base+'login')
def do_login():
    if request.forms.username == 'admin' and request.forms.password == 'admin':
        create_session({'logged_in': True})
        redirect(redirectbase+'index')
    else:
        return renderer.render_name('login', error="Invalid username or password.")

@app.get(base+'logout')
def logout():
    destroy_session()
    return renderer.render_name('logout')

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
    @app.get('/')
    @app.get('/<filename:re:(css|img|js)/.*>')
    def static(filename='index.html'):
        return static_file(filename, root='..')
    @app.get('/admin')
    def force_slash():
        redirect('/admin/', 301)


    run(app, host='localhost', port=8080, debug=True, reloader=True)
