from fastapi import APIRouter, Request
from database import db
from datetime import datetime
from bson import ObjectId

router = APIRouter()


def serialize_task(task):
    task["_id"] = str(task["_id"])
    return task


@router.post("/api/tasks")
async def create_task(request: Request):
    data = await request.json()
    task = {
        "title": data.get("title"),
        "time": data.get("time"),  # expected ISO string
        "category": data.get("category"),
        "notes": data.get("notes", ""),
        "completed": False,
        "created_at": datetime.utcnow(),
        "confirmed_by": "screen",
    }
    result = await db.tasks.insert_one(task)
    return {"status": "created", "task": serialize_task(task)}


@router.get("/api/tasks")
async def get_all_tasks():
    tasks = await db.tasks.find({}).to_list(1000)
    return [serialize_task(task) for task in tasks]


@router.post("/api/tasks/{task_id}/complete")
async def complete_task(task_id: str):
    result = await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"completed": True, "completed_at": datetime.utcnow()}},
    )
    return {
        "status": "updated",
        "matched": result.matched_count,
        "modified": result.modified_count,
    }
