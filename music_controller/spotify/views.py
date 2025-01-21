from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponseRedirect
from requests import post, get, Request
from .util import *
from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from api.models import Room


class AuthURLView(APIView):
    """Provides Spotify authorization URL."""
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        url = Request(
            'GET',
            'https://accounts.spotify.com/authorize',
            params={
                'scope': scopes,
                'response_type': 'code',
                'redirect_uri': REDIRECT_URI,
                'client_id': CLIENT_ID,
            }
        ).prepare().url
        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request):
    """Handles Spotify's callback after user authorization."""
    code = request.GET.get('code')
    error = request.GET.get('error')

    if error or not code:
        return Response({'error': 'Authorization failed.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        response = post(
            'https://accounts.spotify.com/api/token',
            data={
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': REDIRECT_URI,
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
            },
            timeout=10,
        )
        response_data = response.json()

        if response.status_code != 200:
            return Response({'error': 'Failed to retrieve tokens.'}, status=status.HTTP_400_BAD_REQUEST)

        access_token = response_data['access_token']
        token_type = response_data['token_type']
        expires_in = response_data['expires_in']
        refresh_token = response_data.get('refresh_token')

        if not request.session.exists(request.session.session_key):
            request.session.create()

        save_user_tokens(
            request.session.session_key,
            access_token,
            token_type,
            expires_in,
            refresh_token,
        )
        return HttpResponseRedirect('/')

    except Exception as e:
        return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class IsAuthenticated(APIView):
    """Checks if the user is authenticated with Spotify."""
    def get(self, request, format=None):
        try:
            is_authenticated = is_spotify_authenticated(request.session.session_key)
            return Response({'status': is_authenticated}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CurrentSong(APIView):
    """Get the current song playing on Spotify."""
    def get(self, request, format=None):
        try:
            session_key = request.session.session_key
            is_authenticated = is_spotify_authenticated(session_key)
            if not is_authenticated:
                return Response({'error': 'User is not authenticated.'}, status=status.HTTP_401_UNAUTHORIZED)

            # Get tokens from the database
            tokens = get_user_tokens(session_key)
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f"Bearer {tokens.access_token}",
            }

            # Make request to Spotify API
            response = get('https://api.spotify.com/v1/me/player/currently-playing', headers=headers)

            if response.status_code == 204:
                return Response({'error': 'No song currently playing.'}, status=status.HTTP_204_NO_CONTENT)

            if response.status_code == 401:
                # If token is invalid, refresh it and retry
                refresh_spotify_token(session_key)
                tokens = get_user_tokens(session_key)  # Get new tokens
                headers['Authorization'] = f"Bearer {tokens.access_token}"
                response = get('https://api.spotify.com/v1/me/player/currently-playing', headers=headers)

            if response.status_code != 200:
                return Response({'error': response.json()}, status=response.status_code)

            # Parse JSON response
            response_data = response.json()

            # Safely access song details
            item = response_data.get('item', {})
            if not item:
                return Response({'error': 'No song details found in response.'}, status=status.HTTP_404_NOT_FOUND)

            duration = item.get('duration_ms')
            progress = response_data.get('progress_ms')
            album_cover = item.get('album', {}).get('images', [{}])[0].get('url')
            is_playing = response_data.get('is_playing')
            song_id = item.get('id')

            # Build artist string
            artist_string = ', '.join(artist.get('name', 'Unknown') for artist in item.get('artists', []))

            # Construct song data
            song = {
                'title': item.get('name', 'Unknown'),
                'artist': artist_string,
                'duration': duration,
                'time': progress,
                'image_url': album_cover,
                'is_playing': is_playing,
                'id': song_id,
            }

            return Response(song, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PauseSong(APIView):
    """Pause the current song playing on Spotify."""

    def put(self, request, format=None):
        room_code = request.session.get('room_code')
        room = Room.objects.filter(code=room_code).first()

        if not room:
            return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)


class PlaySong(APIView):
    """Play the current song playing on Spotify."""

    def put(self, request, format=None):
        room_code = request.session.get('room_code')
        room = Room.objects.filter(code=room_code).first()

        if not room:
            return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)