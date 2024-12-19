from fastapi import FastAPI, Query, HTTPException
from .database import db
import httpx
from .services.zkp_service import prove_rating_condition, verify_rating_proof
from bson import ObjectId

app = FastAPI()

@app.get("/test-db")
async def test_db():
    result = await db.test_collection.insert_one({"msg": "Hello MongoDB"})
    doc = await db.test_collection.find_one({"_id": result.inserted_id})
    doc["_id"] = str(doc["_id"])  # Convert ObjectId to string
    return doc

@app.post("/user/register")
async def register_user(
    username: str = Query(...),
    wallet_address: str = Query(...),
    chess_com_username: str = Query(...)
):
    user_data = {
        "username": username,
        "wallet_address": wallet_address,
        "chess_com_username": chess_com_username
    }
    result = await db.users.insert_one(user_data)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    created_user["_id"] = str(created_user["_id"])  # Convert ObjectId to str
    return created_user


@app.get("/chess/stats/{chess_username}")
async def fetch_player_stats(chess_username: str):
    url = f"https://api.chess.com/pub/player/{chess_username}/stats"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error fetching stats from Chess.com")
        stats = response.json()
        return stats

@app.post("/challenge/create")
async def create_challenge(
    creator_wallet: str = Query(...),
    wager_amount: float = Query(...)
):
    challenge_data = {
        "creator_wallet": creator_wallet,
        "opponent_wallet": None,
        "wager_amount": wager_amount,
        "status": "pending",
        "condition": "player_rating_above_2000"
    }
    result = await db.challenges.insert_one(challenge_data)
    created_challenge = await db.challenges.find_one({"_id": result.inserted_id})
    created_challenge["_id"] = str(created_challenge["_id"])
    return created_challenge

@app.post("/zkp/prove")
async def zkp_prove(rating: int = Query(...), threshold: int = Query(...)):
    proof = await prove_rating_condition(rating, threshold)
    return proof

@app.post("/zkp/verify")
async def zkp_verify(proof_data: dict):
    is_valid = await verify_rating_proof(proof_data)
    return {"valid": is_valid}

@app.post("/challenge/accept")
async def accept_challenge(challenge_id: str = Query(...), chess_com_username: str = Query(...)):
    # Fetch the challenge from DB
    from bson import ObjectId
    challenge = await db.challenges.find_one({"_id": ObjectId(challenge_id)})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Check if challenge is in "pending" status
    if challenge["status"] != "pending":
        raise HTTPException(status_code=400, detail="Challenge not pending")

    # Extract the condition. For now, we know it's "player_rating_above_2000"
    # Let's say threshold is always 2000 for this example.
    threshold = 2000

    # Fetch player stats from Chess.com
    url = f"https://api.chess.com/pub/player/{chess_com_username}/stats"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Error fetching stats")
        stats = response.json()
    
    # Assume we want the 'chess_rapid' rating
    rating = stats.get("chess_rapid", {}).get("last", {}).get("rating")
    if rating is None:
        raise HTTPException(status_code=400, detail="Could not find player's rapid rating")

    # Generate proof
    proof = await prove_rating_condition(rating, threshold)

    # Verify proof
    if not await verify_rating_proof(proof):
        raise HTTPException(status_code=400, detail="Proof failed verification")

    # If proof is good, accept the challenge
    await db.challenges.update_one(
        {"_id": ObjectId(challenge_id)},
        {"$set": {"status": "accepted", "opponent_wallet": "dummy_opponent"}}
    )

    updated_challenge = await db.challenges.find_one({"_id": ObjectId(challenge_id)})
    updated_challenge["_id"] = str(updated_challenge["_id"])
    return updated_challenge

@app.get("/challenge/get")
async def get_challenge_by_id(id: str):
    challenge = await db.challenges.find_one({"_id": ObjectId(id)})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    challenge["_id"] = str(challenge["_id"])
    return challenge


@app.get("/")
async def root():
    return {"message": "Chess Wager Backend API is running"}
