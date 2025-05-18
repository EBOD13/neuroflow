# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import (
    water,
    meals,
    workout,
    pomodoro,
)  # import other routes as you add them

app = FastAPI(
    title="NeuroFlow API",
    description="Personal productivity and habit tracker backend",
    version="0.1.0",
)

# CORS setup (allow frontend to access backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(water.router, prefix="/api")

app.include_router(meals.router, prefix="/api")

app.include_router(workout.router, prefix="/api")

app.include_router(pomodoro.router, prefix="/api")


# Optional: root test route
@app.get("/")
def read_root():
    return {"status": "API is running"}
