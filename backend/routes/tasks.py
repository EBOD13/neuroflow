# # backend/routes/tasks.py
# from fastapi import APIRouter, Request
# from datetime import datetime
# from database import db

# router = APIRouter()


# @router.post("/log/task")
# async def log_task(req: Request):
#     data = await req.json()
#     data["timestamp"] = datetime.utcnow()
#     data["completed"] = False  # default state
#     await db.tasks.insert_one(data)
#     return {"status": "task logged"}


# @router.get("/log/task")
# async def get_tasks():
#     tasks = await db.tasks.find({}).sort("timestamp", -1).to_list(100)
#     for t in tasks:
#         t["_id"] = str(t["_id"])
#     return tasks


# @router.put("/log/task/{task_id}/complete")
# async def complete_task(task_id: str):
#     from bson import ObjectId

#     await db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": {"completed": True}})
#     return {"status": "task marked complete"}


from fastapi import APIRouter, Request
from database import db
from datetime import datetime
from bson import ObjectId

router = APIRouter()


def serialize(task):
    task["_id"] = str(task["_id"])
    return task


@router.post("/tasks")
async def create_task(request: Request):
    data = await request.json()
    task = {
        "title": data.get("title"),
        "description": data.get("description", ""),
        "category": data.get("category"),
        "frequency": data.get("frequency", "once"),
        "start_time": data.get("start_time"),
        "end_time": data.get("end_time"),
        "duration_minutes": data.get("duration_minutes", 0),
        "location": data.get("location", ""),
        "group": data.get("group", False),
        "milestones": data.get("milestones", []),
        "goal": data.get("goal", ""),
        "quote": data.get("quote", ""),
        "reminders": data.get("reminders", []),
        "duration_span": data.get("duration_span", {}),
        "reward_on_completion": data.get("reward_on_completion", ""),
        "confirmed_by": "screen",
        "created_at": datetime.utcnow(),
        "activity_logs": [],
        "completed": False,
    }
    result = await db.tasks.insert_one(task)
    return {"status": "created", "id": str(result.inserted_id)}


@router.get("/tasks")
async def get_all_tasks():
    tasks = await db.tasks.find({}).to_list(1000)
    return [serialize(task) for task in tasks]


@router.post("/tasks/{task_id}/log")
async def log_task_activity(task_id: str, request: Request):
    data = await request.json()
    log = {
        "date": datetime.utcnow().isoformat(),
        "notes": data.get("notes", ""),
        "duration_minutes": data.get("duration_minutes", 0),
    }
    await db.tasks.update_one(
        {"_id": ObjectId(task_id)}, {"$push": {"activity_logs": log}}
    )
    return {"status": "activity logged"}


@router.post("/tasks/{task_id}/milestone/{index}/complete")
async def complete_milestone(task_id: str, index: int):
    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if task:
        task["milestones"][index]["completed"] = True
        await db.tasks.update_one(
            {"_id": ObjectId(task_id)}, {"$set": {"milestones": task["milestones"]}}
        )
        return {"status": "milestone updated"}
    return {"error": "task not found"}
