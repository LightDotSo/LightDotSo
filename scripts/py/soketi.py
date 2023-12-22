import pusher
import os
from dotenv import load_dotenv

# Load .env variables
load_dotenv()


def realtime_client():
    return pusher.Pusher(
        app_id=os.getenv("SOKETI_DEFAULT_APP_ID"),
        key=os.getenv("SOKETI_DEFAULT_APP_KEY"),
        secret=os.getenv("SOKETI_DEFAULT_APP_SECRET"),
        host="soketi.light.so",
        port=443,
        ssl=True,
    )


def root_service(channel="test-channel", event="test-event"):
    data = {"message": "alert message"}
    realtime_client().trigger(channel, event, data)


if __name__ == "__main__":
    root_service()
