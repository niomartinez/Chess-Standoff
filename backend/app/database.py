import os
from dotenv import load_dotenv
import motor.motor_asyncio

load_dotenv()  # Load .env file
print("Loaded MONGO_URI:", os.getenv("MONGO_URI"))

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client.get_database("chess_wager_db")  # We'll call our database 'chess_wager_db'
