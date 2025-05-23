from fastapi import APIRouter, Request, HTTPException
from datetime import datetime
from bson import ObjectId
from fastapi.responses import JSONResponse

from database import db

router = APIRouter()


def serialize_goal(goal):
    goal["_id"] = str(goal["_id"])
    return goal


@router.post("/goals")
async def create_goal(request: Request):
    data = await request.json()
    goal = {
        "title": data.get("title"),
        "description": data.get("description", ""),
        "category": data.get("category", "General"),
        "goal_type": data.get("goalType", "binary"),  # "numeric", "frequency", "binary"
        "target_value": data.get("targetValue", None),
        "frequency": data.get("frequency", ""),
        "deadline": data.get("deadline", ""),
        "reward": data.get("reward", ""),
        "why": data.get("why", ""),
        "milestones": data.get("milestones", []),
        "behaviors": data.get("behaviors", []),
        "confirmed_by": "screen",
        "created_at": datetime.utcnow(),
        "progress_logs": [],
        "completed": False,
    }
    result = await db.goals.insert_one(goal)
    return {"status": "created", "id": str(result.inserted_id)}


@router.get("/goals")
async def get_goals():
    goals = await db.goals.find({}).sort("created_at", -1).to_list(1000)
    return [serialize_goal(goal) for goal in goals]


@router.post("/goals/{goal_id}/log")
async def log_goal_progress(goal_id: str, request: Request):
    data = await request.json()
    log_entry = {
        "timestamp": datetime.utcnow(),
        "amount": data.get("amount"),
        "notes": data.get("notes", ""),
        "confirmed_by": "screen",
    }
    await db.goals.update_one(
        {"_id": ObjectId(goal_id)}, {"$push": {"progress_logs": log_entry}}
    )
    return {"status": "progress logged"}


@router.post("/goals/{goal_id}/milestone/{index}/complete")
async def complete_milestone(goal_id: str, index: int):
    goal = await db.goals.find_one({"_id": ObjectId(goal_id)})
    if goal and 0 <= index < len(goal["milestones"]):
        goal["milestones"][index]["completed"] = True
        await db.goals.update_one(
            {"_id": ObjectId(goal_id)}, {"$set": {"milestones": goal["milestones"]}}
        )
        return {"status": "milestone marked complete"}
    return {"error": "invalid goal or milestone index"}


@router.get("/goals/{goal_id}")
async def get_goal_detail(goal_id: str):
    goal = await db.goals.find_one({"_id": ObjectId(goal_id)})
    if not goal:
        return {"error": "Goal not found"}

    # Milestone progress
    completed = sum(1 for m in goal.get("milestones", []) if m.get("completed"))
    total = len(goal.get("milestones", []))
    milestone_progress = (completed / total * 100) if total else 0

    # Progress %
    progress_percent = 0
    if goal["goal_type"] == "numeric" and goal["target_value"]:
        total_logged = sum(
            log.get("amount", 0) for log in goal.get("progress_logs", [])
        )
        progress_percent = (
            (total_logged / float(goal["target_value"])) * 100
            if float(goal["target_value"])
            else 0
        )
    elif goal["goal_type"] == "frequency":
        progress_percent = milestone_progress
    elif goal["goal_type"] == "binary":
        progress_percent = 100 if goal.get("completed") else milestone_progress

    # Streaks (for frequency-based goals)
    streak = 0
    if goal["goal_type"] == "frequency":
        today = datetime.utcnow().date()
        dates = sorted(set(log["timestamp"].date() for log in goal["progress_logs"]))
        for d in reversed(dates):
            if today == d:
                streak += 1
                today = today.replace(day=today.day - 1)
            else:
                break

    return {
        "goal": serialize_goal(goal),
        "progress_percent": round(progress_percent, 2),
        "milestones": goal.get("milestones", []),
        "behaviors": goal.get("behaviors", []),
        "streak": streak,
    }


@router.put("/goals/{goal_id}")
async def update_goal(goal_id: str, request: Request):
    data = await request.json()
    await db.goals.update_one({"_id": ObjectId(goal_id)}, {"$set": data})
    return {"status": "updated"}


@router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str):
    await db.goals.delete_one({"_id": ObjectId(goal_id)})
    return {"status": "deleted"}


@router.post("/goals/{goal_id}/milestones")
async def create_milestone(goal_id: str, request: Request):
    try:
        data = await request.json()
        milestone = {
            "name": data.get("name"),
            "description": data.get("description", ""),
            "start": data.get("start", ""),
            "end": data.get("end", ""),
            "completed": data.get("completed", False),
        }

        result = await db.goals.update_one(
            {"_id": ObjectId(goal_id)}, {"$push": {"milestones": milestone}}
        )

        if result.modified_count == 1:
            return {"status": "milestone created"}
        raise HTTPException(status_code=400, detail="Failed to create milestone")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/goals/{goal_id}/milestones/{index}")
async def update_milestone(goal_id: str, index: int, request: Request):
    data = await request.json()
    goal = await db.goals.find_one({"_id": ObjectId(goal_id)})

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    if index >= len(goal.get("milestones", [])):
        raise HTTPException(status_code=404, detail="Milestone index out of range")

    update_data = {
        f"milestones.{index}.name": data.get("name"),
        f"milestones.{index}.description": data.get("description", ""),
        f"milestones.{index}.start": data.get("start", ""),
        f"milestones.{index}.end": data.get("end", ""),
        f"milestones.{index}.completed": data.get("completed", False),
    }

    result = await db.goals.update_one(
        {"_id": ObjectId(goal_id)}, {"$set": update_data}
    )

    if result.modified_count == 1:
        return {"status": "milestone updated"}

    return JSONResponse(status_code=400, content={"error": "No changes were made"})


@router.delete("/goals/{goal_id}/milestones/{index}")
async def delete_milestone(goal_id: str, index: int):
    try:
        goal = await db.goals.find_one({"_id": ObjectId(goal_id)})
        if not goal or index >= len(goal.get("milestones", [])):
            raise HTTPException(status_code=404, detail="Milestone not found")

        # Remove the milestone at the specified index
        updated_milestones = [m for i, m in enumerate(goal["milestones"]) if i != index]

        result = await db.goals.update_one(
            {"_id": ObjectId(goal_id)}, {"$set": {"milestones": updated_milestones}}
        )

        if result.modified_count == 1:
            return {"status": "milestone deleted"}
        raise HTTPException(status_code=400, detail="Failed to delete milestone")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
