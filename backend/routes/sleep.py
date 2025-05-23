from fastapi import APIRouter, Request
from database import db
from datetime import datetime

router = APIRouter()


@router.post("/log/sleep")
async def log_sleep(req: Request):
    data = await req.json()
    data["timestamp"] = datetime.utcnow()
    await db.sleep.insert_one(data)
    return {"status": "logged"}


@router.get("/log/sleep")
async def get_sleep_logs():
    logs = await db.sleep.find().sort("timestamp", -1).to_list(length=100)
    for log in logs:
        log["_id"] = str(log["_id"])
    return logs
