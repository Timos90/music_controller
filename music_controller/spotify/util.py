from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from .credentials import CLIENT_ID, CLIENT_SECRET
from requests import post, put, get


BASE_URL = "https://api.spotify.com/v1/me/"


def get_user_tokens(session_id):
    """Retrieve the Spotify token for a given session."""
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    return user_tokens.first() if user_tokens.exists() else None


def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    """Save or update the user's Spotify tokens."""
    expires_at = timezone.now() + timedelta(seconds=expires_in)
    tokens = get_user_tokens(session_id)

    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_at
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token', 'refresh_token', 'expires_in', 'token_type'])
    else:
        SpotifyToken.objects.create(
            user=session_id,
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=token_type,
            expires_in=expires_at
        )


def is_spotify_authenticated(session_id):
    """Check if the user's Spotify session is authenticated and refresh token if expired."""
    tokens = get_user_tokens(session_id)
    if tokens:
        if tokens.expires_in <= timezone.now():
            refresh_spotify_token(session_id)
        return True
    return False


def refresh_spotify_token(session_id):
    """Refresh the user's Spotify access token using the refresh token."""
    tokens = get_user_tokens(session_id)
    if not tokens:
        raise ValueError("No tokens available to refresh.")

    response = post(
        'https://accounts.spotify.com/api/token',
        data={
            'grant_type': 'refresh_token',
            'refresh_token': tokens.refresh_token,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
        },
        timeout=10,
    )

    if response.status_code != 200:
        raise ValueError(f"Failed to refresh token: {response.json()}")

    response_data = response.json()
    update_or_create_user_tokens(
        session_id,
        access_token=response_data['access_token'],
        token_type=response_data['token_type'],
        expires_in=response_data['expires_in'],
        refresh_token=response_data.get('refresh_token', tokens.refresh_token)
    )


def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    """Execute a Spotify API request."""
    tokens = get_user_tokens(session_id)
    if not tokens:
        return {'Error': 'User is not authenticated with Spotify'}

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {tokens.access_token}"
    }

    url = BASE_URL + endpoint

    if post_:
        response = post(url, headers=headers)
    elif put_:
        response = put(url, headers=headers)
    else:
        response = get(url, headers=headers)

    try:
        return response.json() if response.content else {}
    except Exception as e:
        return {'Error': f'Issue with request: {str(e)}'}


def play_song(session_id):
    """Send a request to play a song on Spotify."""
    return execute_spotify_api_request(session_id, "player/play", put_=True)


def pause_song(session_id):
    """Send a request to pause the current song on Spotify."""
    return execute_spotify_api_request(session_id, "player/pause", put_=True)


def skip_song(session_id):
    """Send a request to skip to the next song on Spotify."""
    return execute_spotify_api_request(session_id, "player/next", post_=True)
