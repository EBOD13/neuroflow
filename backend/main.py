# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import httpx
import asyncio
from typing import Optional


from routes import (
    water,
    meals,
    workout,
    pomodoro,
    pomodoro_stats,
    sleep,
    tasks,
    goals,
    temperature,
)  # import other routes as you add them

app = FastAPI(
    title="NeuroFlow API",
    description="Personal productivity and habit tracker backend",
    version="0.1.0",
)

# CORS setup (allow frontend to access backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
routers = [
    water.router,
    meals.router,
    goals.router,
    workout.router,
    pomodoro.router,
    pomodoro_stats.router,
    sleep.router,
    tasks.router,
    temperature.router,
]
for router in routers:
    app.include_router(router, prefix="/api")


# Optional: root test route
@app.get("/")
def read_root():
    return {"status": "API is running"}


# @app.get("/iconduck")
# async def get_icons(q: str):
#     try:
#         # Using async httpx with timeout
#         async with httpx.AsyncClient(timeout=10.0) as client:
#             response = await client.get(f"https://api.iconduck.com/v1/search?q={q}")
#             response.raise_for_status()
#             return response.json()
#     except httpx.RequestError as e:
#         # Return fallback if API is unavailable
#         fallback = FALLBACK_ICONS.get(q.lower(), [])
#         return {"results": fallback}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
