import pusher

def realtime_client():
    return pusher.Pusher(
        app_id='333',
        key='PUSHER_KEY',
        secret='PUSHER_SECRET',
        host='soketi.light.so',
        port=443,
        ssl=True,
    )

def root_service(channel="test-channel", event='test-event'):
    data = {"message":"alert message"}
    realtime_client().trigger(channel, event, data)

if __name__ == "__main__":
    root_service()
