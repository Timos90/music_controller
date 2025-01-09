from django.shortcuts import render
from rest_framework import generics, status
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.
class RoomView(generics.ListAPIView):  # Define a view for listing all Room objects
    queryset = Room.objects.all()  # Set the queryset to all Room objects
    serializer_class = RoomSerializer  # Set the serializer class to RoomSerializer


class GetRoom(APIView):  # Define a view for getting a Room
    serializer_class = RoomSerializer  # Set the serializer class to RoomSerializer
    lookup_url_kwarg = 'code'  # Set the lookup URL keyword argument to 'code'

    def get(self, request, format=None):  # Define a GET method for the view
        code = request.GET.get(self.lookup_url_kwarg)  # Get the code from the URL
        if code != None:  # Check if the code is not None
            room = Room.objects.filter(code=code)  # Filter Room objects by code
            if len(room) > 0:  # Check if the Room exists
                data = RoomSerializer(room[0]).data  # Serialize the Room data
                data['is_host'] = self.request.session.session_key == room[0].host  # Add a boolean field for whether the current session is the host
                return Response(data, status=status.HTTP_200_OK)  # Return the Room data
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)  # Return an error response if the Room does not exist
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)  # Return an error response if the code is None


class CreateRoomView(APIView):  # Define a view for creating a Room
    serializer_class = CreateRoomSerializer  # Set the serializer class to CreateRoomSerializer

    def post(self, request, format=None):  # Define a POST method for the view
        if not self.request.session.exists(self.request.session.session_key):  # Check if the session exists
            self.request.session.create()  # Create a new session if it does not exist
        
        serializer = self.serializer_class(data=request.data)  # Deserialize the request data
        if serializer.is_valid():  # Check if the data is valid
            guest_can_pause = serializer.data.get('guest_can_pause')  # Get guest_can_pause from the data
            votes_to_skip = serializer.data.get('votes_to_skip')  # Get votes_to_skip from the data
            host = self.request.session.session_key  # Get the session key as the host
            queryset = Room.objects.filter(host=host)  # Filter Room objects by host
            if queryset.exists():  # Check if a Room with the host already exists
                room = queryset[0]  # Get the existing Room
                room.guest_can_pause = guest_can_pause  # Update guest_can_pause
                room.votes_to_skip = votes_to_skip  # Update votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])  # Save the updates
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)  # Return the updated Room data
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)  # Create a new Room
                room.save()  # Save the new Room
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)  # Return the new Room data
        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)  # Return an error response if data is invalid
    