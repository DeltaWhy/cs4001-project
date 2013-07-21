#!/usr/bin/python3
from bottle import route, run, static_file

if __name__ == '__main__':
    base = '/admin'
else:
    base = ''

@route(base)
@route(base+'/')
def hello():
    return 'ello admin'

@route(base+'/<filename:re:(css|img|js)/.*>')
def admin_static(filename):
    return static_file(filename, root='.')

if __name__ == '__main__':
    @route('/')
    @route('/<filename:re:(css|img|js)/.*>')
    def static(filename='index.html'):
        return static_file(filename, root='..')


    run(host='localhost', port=8080, debug=True, reloader=True)
