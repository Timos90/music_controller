from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponseRedirect
from requests import post, Request
from .util import save_user_tokens, is_spotify_authenticated
from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI


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
