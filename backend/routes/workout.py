from fastapi import APIRouter, Request
from database import db
from datetime import datetime
import pytz
from tzlocal import get_localzone

router = APIRouter()


def get_system_timezone():
    try:
        local_tz = get_localzone()
        print(f"Detected system timezone: {local_tz}")
        return local_tz
    except Exception as e:
        print(f"Could not detect system timezone, defaulting to UTC. Error: {e}")
        return pytz.UTC


LOCAL_TZ = get_system_timezone()


def get_today():
    now_local = datetime.now(LOCAL_TZ)
    return now_local.date().isoformat(), now_local.strftime("%A")


@router.post("/log/workout/{day}")
async def log_workout(day: str, request: Request):
    body = await request.json()
    date_str, current_day = get_today()

    doc = {
        "date": date_str,
        "day": day.capitalize(),
        "completed": body.get("completed", False),
        "timestamp": datetime.now(LOCAL_TZ),
        "description": body.get("description", ""),
        "checklist": body.get("checklist", []),
    }

    if day.lower() == "saturday":
        doc["miles"] = body.get("miles", 0)

    await db.workouts.update_one(
        {"date": date_str, "day": day.capitalize()}, {"$set": doc}, upsert=True
    )
    return {"status": "logged", "day": day}


@router.get("/log/workout/summary/today")
async def workout_summary():
    date_str, _ = get_today()
    doc = await db.workouts.find_one({"date": date_str}) or {}

    if "_id" in doc:
        doc["_id"] = str(doc["_id"])

    return doc
