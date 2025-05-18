from fastapi import APIRouter, Request
from datetime import datetime
from database import db
from subprocess import Popen

router = APIRouter()


@router.post("/log/pomodoro")
async def log_pomodoro(req: Request):
    data = await req.json()
    data["timestamp"] = datetime.utcnow()
    await db.pomodoro.insert_one(data)
    return {"status": "logged"}


@router.get("/alert/pomodoro")
async def trigger_alert():
    Popen(["python3", "backend/hardware/buzzer_led_control.py"])
    return {"status": "alert triggered"}
