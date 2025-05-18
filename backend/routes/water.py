from fastapi import APIRouter
from models import WaterLog
from database import db
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter()


@router.post("/log/water")
async def log_water(entry: WaterLog):
    today = datetime.utcnow().date().isoformat()
    amount_ml = entry.amount_ml

    result = await db.water_daily.update_one(
        {"date": today},
        {"$inc": {"total_ml": amount_ml, "bottle_count": 1}},
        upsert=True,
    )

    return {
        "status": "updated",
        "acknowledged": result.acknowledged,
        "modified_count": result.modified_count,
        "upserted_id": str(result.upserted_id) if result.upserted_id else None,
    }


@router.get("/log/water")
async def get_water_logs():
    logs = await db.water.find().sort("timestamp", -1).to_list(50)
    for log in logs:
        log["_id"] = str(log["_id"])  # convert ObjectId to string
    return logs


@router.patch("/log/water/{log_id}/complete")
async def mark_complete(log_id: str):
    result = await db.water.update_one(
        {"_id": db.ObjectId(log_id)}, {"$set": {"completed": True}}
    )
    return {"status": "completed", "modified_count": result.modified_count}


@router.get("/log/water/summary/today")
async def get_today_summary():
    today = datetime.utcnow().date().isoformat()
    doc = await db.water_daily.find_one({"date": today}) or {}

    total_ml = doc.get("total_ml", 0)
    total_oz = total_ml * 0.033814

    return {
        "total_oz": round(total_oz, 2),
        "bottle_count": doc.get("bottle_count", 0),
        "goal_met": total_oz >= 96,
        "ideal_goal_met": total_oz >= 120,
        "remaining_oz": max(0, 96 - total_oz),
    }


@router.get("/log/water/streak")
async def water_streak():
    now = datetime.utcnow()
    streak = 0

    for i in range(0, 30):
        day = now - timedelta(days=i)
        start = datetime(day.year, day.month, day.day)
        end = start + timedelta(days=1)

        logs = await db.water.find({"timestamp": {"$gte": start, "$lt": end}}).to_list(
            100
        )
        total_ml = sum(log.get("amount_ml", 0) for log in logs)

        if total_ml >= 709 * 5:  # 5 bottles
            streak += 1
        else:
            break  # streak ends

    return {"streak_days": streak}


@router.get("/log/water/missed")
async def water_missed():
    now = datetime.utcnow()
    missed = []

    for i in range(1, 30):  # skip today
        day = now - timedelta(days=i)
        start = datetime(day.year, day.month, day.day)
        end = start + timedelta(days=1)

        logs = await db.water.find({"timestamp": {"$gte": start, "$lt": end}}).to_list(
            100
        )
        total_ml = sum(log.get("amount_ml", 0) for log in logs)

        if total_ml < 709 * 5:
            missed.append(start.date().isoformat())

    return {"missed_days": missed}
