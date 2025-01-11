from django.shortcuts import render
from rest_framework import generics, status
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse

# Create your views here.
class RoomView(generics.ListAPIView):  # Define a view for listing all Room objects
    queryset = Room.objects.all()  # Set the queryset to all Room objects
    serializer_class = RoomSerializer  # Set the serializer class to RoomSerializer


class GetRoom(APIView):  # Define a view for getting a Room
    serializer_class = RoomSerializer  # Set the serializer class to RoomSerializer
    lookup_url_kwarg = 'code'  # Set the lookup URL keyword argument to 'code'

    def get(self, request, format=None):  # Define a GET method for the view
        code = request.GET.get(self.lookup_url_kwarg)  # Get the code from the URL
        if code is not None:  # Check if the code is not None
            room = Room.objects.filter(code=code)  # Filter Room objects by code
            if room.exists():  # Check if the Room exists
                data = RoomSerializer(room.first()).data  # Serialize the Room data
                data['is_host'] = self.request.session.session_key == room.first().host  # Add a boolean field for whether the current session is the host
                return Response(data, status=status.HTTP_200_OK)  # Return the Room data
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)  # Return an error response if the Room does not exist
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)  # Return an error response if the code is None


class JoinRoom(APIView):  # Define a view for joining a Room
    lookup_url_kwarg = 'code'  # Set the lookup URL keyword argument to 'code'

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_results = Room.objects.filter(code=code)
            if len(room_results) > 0:
                room = room_results[0]
                self.request.session['room_code'] = code
                return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)
            return Response({'Bad Request': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'Bad Request': 'Invalid post data, did not find a code key'}, status=status.HTTP_400_BAD_REQUEST)


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
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)  # Return the updated Room data
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)  # Create a new Room
                room.save()  # Save the new Room
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)  # Return the new Room data
        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)  # Return an error response if data is invalid


class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            'code': self.request.session.get('room_code')
        }
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self, request, format=None):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()

        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)


class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response({'msg': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

            room = queryset[0]
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response({'msg': 'You are not the host of this room.'}, status=status.HTTP_403_FORBIDDEN)

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({'Bad Request': 'Invalid Data...'}, status=status.HTTP_400_BAD_REQUEST)
