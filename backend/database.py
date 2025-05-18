# # backend/database.py
# import motor.motor_asyncio
# from dotenv import load_dotenv
# import os

# load_dotenv()

# MONGO_URI = os.getenv("MONGO_URI")
# DB_NAME = os.getenv("DB_NAME", "neuroflow")

# client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
# db = client[DB_NAME]


# backend/database.py
import motor.motor_asyncio
from dotenv import load_dotenv
import os
import asyncio

# Load environment variables
load_dotenv()

# MongoDB config
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "neuroflow")

# MongoDB client
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]


# Optional test block
async def test_connection():
    try:
        collections = await db.list_collection_names()
        print("✅ Connected to MongoDB!")
        print("📁 Collections:", collections)
    except Exception as e:
        print("Connection failed:", e)


if __name__ == "__main__":
    asyncio.run(test_connection())
