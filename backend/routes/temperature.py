from fastapi import APIRouter, Request
from datetime import datetime
from bson import ObjectId
from database import db
import glob
import time

router = APIRouter()

# ---------- TEMPERATURE SENSOR SETUP ----------
base_dir = "/sys/bus/w1/devices/"
device_folder = glob.glob(base_dir + "28*")[0]
device_file = device_folder + "/w1_slave"


def read_temp():
    with open(device_file, "r") as f:
        lines = f.readlines()
    while lines[0].strip()[-3:] != "YES":
        time.sleep(0.2)
        with open(device_file, "r") as f:
            lines = f.readlines()
    equals_pos = lines[1].find("t=")
    if equals_pos != -1:
        temp_c = float(lines[1][equals_pos + 2 :]) / 1000.0
        return round(temp_c, 1)
    return None


@router.get("/temperature")
async def get_temperature():
    temp = read_temp()
    return {"temperature": temp}
