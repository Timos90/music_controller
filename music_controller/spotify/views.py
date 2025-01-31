from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponseRedirect, JsonResponse
from requests import post, get, Request
from .util import *
from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from api.models import Room
from .models import Vote


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

        update_or_create_user_tokens(
            request.session.session_key, access_token, token_type, expires_in, refresh_token
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
        room_code = request.session.get('room_code')
        room = Room.objects.filter(code=room_code).first()

        if not room:
            return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)

        if 'error' in response or 'item' not in response:
            return Response({'error': 'No song currently playing.'}, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album', {}).get('images', [{}])[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artist_string = ', '.join(artist.get('name', 'Unknown') for artist in item.get('artists', []))

        votes = Vote.objects.filter(room=room, song_id=song_id).count()
        song = {
            'title': item.get('name', 'Unknown'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': votes,
            'votes_required': room.votes_to_skip,
            'id': song_id,
        }

        self.update_room_song(room, song_id)

        return Response(song, status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        if room.current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            Vote.objects.filter(room=room).delete()


class PauseSong(APIView):
    """Pause the current song playing on Spotify."""
    def put(self, request, format=None):
        room_code = request.session.get('room_code')
        room = Room.objects.filter(code=room_code).first()

        if not room:
            return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({'message': 'Song paused'}, status=status.HTTP_204_NO_CONTENT)

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
            return Response({'message': 'Song playing'}, status=status.HTTP_204_NO_CONTENT)

        return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    """Skip the current song playing on Spotify."""

    def post(self, request, format=None):
        room_code = request.session.get('room_code')
        if not room_code:
            return Response({'error': 'Room code not found in session.'}, status=status.HTTP_400_BAD_REQUEST)

        room = Room.objects.filter(code=room_code).first()
        if not room:
            return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

        song_id = room.current_song
        if not song_id:
            return Response({'error': 'No song currently playing.'}, status=status.HTTP_404_NOT_FOUND)

        user_session = request.session.session_key

        # ✅ If the user is the host, just skip the song without voting
        if user_session == room.host:
            print(f"Host {user_session} is skipping the song directly.")
            Vote.objects.filter(room=room, song_id=song_id).delete()  # Clear votes
            skip_song(room.host)
            return Response({'message': 'Host skipped the song successfully!'}, status=status.HTTP_200_OK)

        # ✅ Check if the user has already voted
        existing_vote = Vote.objects.filter(user=user_session, room=room, song_id=song_id).first()
        
        if existing_vote:
            return Response({'error': 'You have already voted to skip this song!'}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Add vote BEFORE checking the skip condition
        Vote.objects.create(user=user_session, room=room, song_id=song_id)

        # Fetch updated vote count
        votes = Vote.objects.filter(room=room, song_id=song_id).count()

        # Debugging logs
        print(f"Votes needed: {room.votes_to_skip}, Current votes: {votes}, Requesting User: {user_session}")

        # ✅ Check if enough votes have been cast to skip the song
        if votes >= room.votes_to_skip:
            Vote.objects.filter(room=room, song_id=song_id).delete()  # Clear votes after skipping
            skip_song(room.host)  # Skip the song using the Spotify API
            return Response({'message': 'Song skipped successfully!'}, status=status.HTTP_200_OK)

        return Response({'message': f'Your vote has been counted. Votes: {votes}/{room.votes_to_skip}'}, status=status.HTTP_200_OK)
