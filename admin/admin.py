#!/usr/bin/python3
from bottle import route, run, static_file
import pystache
import os

if __name__ == '__main__':
    base = '/admin'
else:
    base = ''

renderer = pystache.Renderer(search_dirs=os.path.join(os.path.dirname(__file__), 'template'))

@route(base)
@route(base+'/')
def index():
    return renderer.render_name('index')

if __name__ == '__main__':
    @route('/')
    @route('/<filename:re:(css|img|js)/.*>')
    def static(filename='index.html'):
        return static_file(filename, root='..')


    run(host='localhost', port=8080, debug=True, reloader=True)
