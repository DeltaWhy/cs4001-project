#!/usr/bin/python3
from bottle import Bottle, run, static_file, request, response, redirect, abort
import pystache
import os
import random
import logging
import json

rootLogger = logging.getLogger()
rootLogger.setLevel(logging.DEBUG)
fh = logging.FileHandler('admin.log')
fh.setLevel(logging.INFO)
fh.setFormatter(logging.Formatter(fmt="%(asctime)s %(name)s [%(levelname)s]: %(message)s"))
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
rootLogger.addHandler(fh)
rootLogger.addHandler(ch)
logger = logging.getLogger(__name__)

app = Bottle()

if __name__ == '__main__':
    base = '/cs4001/admin/'
else:
    base = '/'

def path(*components):
    return os.path.join(os.path.dirname(__file__), *components)

renderer = pystache.Renderer(search_dirs=path('template'))
sessions = {}

if os.path.isfile(path('data', 'users.json')):
    users = json.load(open(path('data', 'users.json')))
else:
    logger.info("Creating users.json")
    users = {'admin': {'username': 'admin', 'password': 'admin'}}
    json.dump(users, open(path('data', 'users.json'), 'w'))

cities = json.load(open(path('..','data','cities.json')))
buildings = json.load(open(path('..','data','buildings.json')))

# ROUTES
@app.get(base)
def root():
    redirect('/cs4001/admin/index')

@app.get(base+'index')
def index():
    sess = session()
    if sess:
        return renderer.render_name('index', session=sess)
    else:
        redirect('/cs4001/admin/login')

@app.get(base+'login')
def login():
    sess = session()
    if sess:
        redirect('/cs4001/admin/index')
    else:
        return renderer.render_name('login')

@app.post(base+'login')
def do_login():
    if request.forms.username in users and \
            users[request.forms.username]['password'] == request.forms.password:
        create_session({'user': users[request.forms.username]})
        redirect('/cs4001/admin/index')
    else:
        return renderer.render_name('login', error="Invalid username or password.")

@app.get(base+'logout')
def logout():
    destroy_session()
    return renderer.render_name('logout')

@app.get(base+'debug')
def debug_page():
    return "%s" % {'sessions': sessions, 'users': users}

# CITIES
@app.get(base+'cities')
def cities_index():
    sess = session()
    if sess:
        view_cities = []
        for k,v in cities.items():
            view_city = v.copy()
            view_city['slug'] = k
            view_cities.append(view_city)
        return renderer.render_name('cities', session=sess, cities=view_cities)
    else:
        redirect('/cs4001/admin/login')

@app.get(base+'cities/<city>/edit')
def edit_city(city):
    sess = session()
    if sess:
        if city in cities:
            view_city = cities[city].copy()
            view_city['slug'] = city
            return renderer.render_name('edit_city', session=sess, city=view_city)
        else:
            abort(404, "No such city.")
    else:
        redirect('/cs4001/admin/login')

@app.get(base+'cities/new')
def new_city():
    sess = session()
    if sess:
        return renderer.render_name('new_city', session=sess)
    else:
        redirect('/cs4001/admin/login')

@app.post(base+'cities/<slug>')
def update_city(slug):
    sess = session()
    if sess:
        if slug in cities:
            for key in cities[slug]:
                form_key = key.replace('-','_')
                if form_key in request.forms:
                    cities[slug][key] = request.forms.decode()[form_key]

            json.dump(cities, open(path('..', 'data', 'cities.json'), 'w'))
            redirect('/cs4001/admin/cities')
        else:
            abort(404, "No such city.")
    else:
        redirect('/cs4001/admin/login')

@app.get(base+'cities/<slug>/delete')
def delete_city(slug):
    sess = session()
    if sess:
        if slug in cities:
            del(cities[slug])

            json.dump(cities, open(path('..', 'data', 'cities.json'), 'w'))
            redirect('/cs4001/admin/cities')
        else:
            abort(404, "No such city.")
    else:
        redirect('/cs4001/admin/login')

@app.post(base+'cities')
def create_city():
    sess = session()
    if sess:
        city = {}
        for key in request.forms.decode():
            city[key.replace('_','-')] = request.forms.decode()[key]
        slug = city['slug']

        if slug in cities:
            return renderer.render_name('new_city', session=sess, city=city, error="City already exists.")
        else:
            del(city['slug'])
            cities[slug] = city

            json.dump(cities, open(path('..', 'data', 'cities.json'), 'w'))
            redirect('/cs4001/admin/cities')
    else:
        redirect('/cs4001/admin/login')

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
    @app.get('/cs4001')
    @app.get('/cs4001/')
    @app.get('/cs4001/<filename:re:(css|img|js|data)/.*>')
    def static(filename='index.html'):
        return static_file(filename, root='..')

    @app.get('/')
    def project_root():
        redirect('/cs4001/')

    @app.get('/cs4001/admin')
    def force_slash():
        redirect('/cs4001/admin/', 301)

    run(app, host='localhost', port=8080, debug=True, reloader=True)
