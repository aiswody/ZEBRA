# backend/activities/enums.py
from enum import IntEnum

class FuelCategory(IntEnum):
    SOLID = 1    # 고체
    LIQUID = 2   # 액체(유류)
    GAS = 3      # 기체

class Tier(IntEnum):
    TIER1 = 1
    TIER2 = 2
    TIER3 = 3
