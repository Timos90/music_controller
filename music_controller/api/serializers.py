from rest_framework import serializers
from .models import Room, ChatMessage

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'guest_can_pause', 'votes_to_skip', 'created_at')

class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip')

class UpdateRoomSerializer(serializers.ModelSerializer):
    code = serializers.CharField(validators=[])
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip', 'code')

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['room_code', 'user', 'message', 'timestamp']
