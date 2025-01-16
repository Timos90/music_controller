from .models import SpotifyToken
from datetime import timedelta
from django.utils import timezone
from requests import post, put, get
from .credentials import CLIENT_ID, CLIENT_SECRET


def get_user_tokens(session_key):
    """Retrieve tokens for a given session key."""
    return SpotifyToken.objects.filter(user=session_key).first()


def save_user_tokens(session_key, access_token, token_type, expires_in, refresh_token):
    """Save or update Spotify tokens for a session."""
    expires_at = timezone.now() + timedelta(seconds=expires_in)
    tokens = get_user_tokens(session_key)
    
    if tokens:
        tokens.access_token = access_token
        tokens.token_type = token_type
        tokens.expires_in = expires_at
        tokens.refresh_token = refresh_token
        tokens.save(update_fields=['access_token', 'token_type', 'expires_in', 'refresh_token'])
    else:
        SpotifyToken.objects.create(
            user=session_key,
            access_token=access_token,
            token_type=token_type,
            expires_in=expires_at,
            refresh_token=refresh_token,
        )


def is_spotify_authenticated(session_key):
    """Check if the user's Spotify session is authenticated."""
    tokens = get_user_tokens(session_key)
    if tokens:
        if tokens.expires_in <= timezone.now():
            refresh_spotify_token(session_key)
        return True
    return False


def refresh_spotify_token(session_key):
    """Refresh Spotify tokens."""
    tokens = get_user_tokens(session_key)
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
    save_user_tokens(
        session_key,
        access_token=response_data['access_token'],
        token_type=response_data['token_type'],
        expires_in=response_data['expires_in'],
        refresh_token=response_data.get('refresh_token', tokens.refresh_token),
    )

def execute_spotify_api_request(session_key, endpoint, post_=False, put_=False):
    """Execute a Spotify API request."""
    tokens = get_user_tokens(session_key)
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"{tokens.token_type} {tokens.access_token}"
    }

    if post_:
        post(f"https://api.spotify.com/v1/me{endpoint}", headers=headers)
    if put_:
        put(f"https://api.spotify.com/v1/me{endpoint}", headers=headers)

    response = get(f"https://api.spotify.com/v1{endpoint}", {}, headers=headers)
    try:
        return response.json()
    except Exception as e:
        return {'Error': f'Issue with request: {str(e)}'}