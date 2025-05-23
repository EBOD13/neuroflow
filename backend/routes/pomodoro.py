from fastapi import APIRouter, Request
from datetime import datetime
from database import db
from subprocess import Popen
import os

router = APIRouter()


@router.post("/log/pomodoro")
async def log_pomodoro(req: Request):
    data = await req.json()
    data["timestamp"] = datetime.utcnow()
    await db.pomodoro.insert_one(data)
    return {"status": "logged"}


@router.get("/alert/pomodoro")
async def trigger_alert():
    buzzer_script = os.path.join("backend", "hardware", "buzzer_led_control.py")
    if os.path.exists(buzzer_script):
        Popen(["python3", buzzer_script])
    else:
        print("ERROR: File not found")
        Popen(["python", "backend/hardware/buzzer_led_control.py"])
    return {"status": "alert triggered"}

