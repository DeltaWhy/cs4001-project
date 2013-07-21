#!/usr/bin/python3
from bottle import route, run

@route('/')
def hello():
    return 'ello admin'

if __name__ == '__main__':
    run(host='localhost', port=8080, debug=True)
