from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WaterLog(BaseModel):
    amount_ml: int
    timestamp: Optional[datetime] = None
    description: Optional[str] = None
    completed: bool = False
    confirmed_by: Optional[str] = None
