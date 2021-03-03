from flask import Flask, render_template, session, copy_current_request_context
from flask_socketio import SocketIO, emit, disconnect
from threading import Lock
from flask_mongoengine import MongoEngine
from engineio.payload import Payload

Payload.max_decode_packets = 500

async_mode = None
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode, logger=True, engineio_logger=True)
thread = None
thread_lock = Lock()

app.config["MONGODB_SETTINGS"] = {
    "db": "letsdraw_db"
}

db = MongoEngine(app)
currentliveUsers = 0


class PixelInfo(db.Document):
    xCoordinate = db.IntField(required=True)
    yCoordinate = db.IntField(required=True)
    rgba = db.ListField(required=True)

@app.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode)

@socketio.on('uploadPixelInfo')
def handleUploadPixelInfo(xBatch, yBatch, colorBatch):
    emit('pixelEditted',{'x':xBatch, 'y':xBatch, 'color':colorBatch},broadcast=True, include_self=False)
    for i in range(len(xBatch)):
        if(colorBatch[i]["3"] != 0):
            pixelInfo = PixelInfo(xCoordinate=xBatch[i], yCoordinate=yBatch[i], rgba=[colorBatch[i]["0"],colorBatch[i]["1"],colorBatch[i]["2"],colorBatch[i]["3"]])
            pixelInfo.save()
        

@socketio.on('my_event', namespace='/test')
def test_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': message['data'], 'count': session['receive_count']})


@socketio.on('my_broadcast_event', namespace='/test')
def test_broadcast_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': message['data'], 'count': session['receive_count']},
         broadcast=True)


@socketio.on('connect')
def test_connect():
    currentliveUsers = 1
    emit('UserConnected', {"liveUsers": currentliveUsers}, broadcast=True)

@socketio.on('disconnect')
def test_disconnect():
    currentliveUsers = 1
    emit('UserDisconnected', {"liveUsers": currentliveUsers}, broadcast=True)

@socketio.on_error_default
def default_error_handler(e):
    print(request.event["message"]) # "my error event"
    print(request.event["args"])    # (data,)



if __name__ == '__main__':
    socketio.run(app, debug=True)
