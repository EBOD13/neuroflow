from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
import os
import requests
from urllib.parse import urlencode

router = APIRouter()

# Spotify API credentials
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")


# Spotify API endpoints
AUTH_URL = "https://accounts.spotify.com/authorize"
TOKEN_URL = "https://accounts.spotify.com/api/token"


@router.get("/login")
async def login_spotify():
    scope = "user-read-playback-state user-modify-playback-state user-read-currently-playing streaming"
    params = {
        "response_type": "code",
        "client_id": os.getenv("SPOTIFY_CLIENT_ID"),
        "scope": scope,
        "redirect_uri": os.getenv("SPOTIFY_REDIRECT_URI"),
        "show_dialog": "true",
    }
    auth_url = f"https://accounts.spotify.com/authorize?{urlencode(params)}"
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def callback(code: str):
    try:
        # Exchange auth code for access token
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        }
        response = requests.post(TOKEN_URL, data=data)
        response.raise_for_status()
        token_data = response.json()
        return token_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/refresh")
async def refresh_token(refresh_token: str):
    try:
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        }
        response = requests.post(TOKEN_URL, data=data)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
