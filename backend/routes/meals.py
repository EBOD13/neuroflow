from fastapi import APIRouter, Query
from database import db
from datetime import datetime
from typing import Optional

router = APIRouter()


@router.post("/log/meal/{meal_type}")
async def log_meal(
    meal_type: str, description: str = "", timestamp: Optional[str] = Query(None)
):
    # Use provided timestamp or fallback to UTC
    if timestamp:
        try:
            ts = datetime.fromisoformat(timestamp)
        except ValueError:
            ts = datetime.utcnow()
    else:
        ts = datetime.utcnow()

    today = ts.date().isoformat()

    result = await db.meals.update_one(
        {"date": today},
        {
            "$set": {
                f"meals.{meal_type}": {
                    "completed": True,
                    "timestamp": ts,
                    "description": description,
                }
            }
        },
        upsert=True,
    )
    return {"status": "logged", "meal": meal_type}


@router.get("/log/meal/summary/today")
async def get_meal_summary():
    today = datetime.utcnow().date().isoformat()
    doc = await db.meals.find_one({"date": today}) or {}

    meals = doc.get(
        "meals",
        {
            "breakfast": {"completed": False},
            "lunch": {"completed": False},
            "dinner": {"completed": False},
        },
    )

    return {"meals": meals}
