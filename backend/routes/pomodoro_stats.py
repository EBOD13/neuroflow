from fastapi import APIRouter
from database import db
from datetime import datetime
from collections import defaultdict

router = APIRouter()


@router.get("/stats/pomodoro")
async def get_pomodoro_stats():
    # Fetch all pomodoro sessions
    sessions = await db.pomodoro.find({}).to_list(length=1000)

    daily_minutes = defaultdict(float)
    daily_tasks = defaultdict(set)

    for session in sessions:
        if (
            "start_time" in session
            and "duration" in session
            and session.get("completed", False)
        ):
            start_date = (
                datetime.fromisoformat(str(session["start_time"])).date().isoformat()
            )
            daily_minutes[start_date] += float(session["duration"])
            label = session.get("label", "").strip()
            if label:
                daily_tasks[start_date].add(label)

    result = []
    for date in sorted(daily_minutes.keys()):
        result.append(
            {
                "date": date,
                "total_minutes": round(daily_minutes[date], 2),
                "tasks": list(daily_tasks[date]),
            }
        )

    return result
