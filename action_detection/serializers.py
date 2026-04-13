from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Video, ActionDetection


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', '').strip(),
            password=validated_data['password'],
        )


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class ActionDetectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionDetection
        fields = ['id', 'timestamp', 'action_label', 'confidence']

class VideoSerializer(serializers.ModelSerializer):
    detections = ActionDetectionSerializer(many=True, read_only=True)
    owner = UserSerializer(read_only=True)
    
    class Meta:
        model = Video
        fields = ['id', 'owner', 'video_file', 'uploaded_at', 'processed', 'detections']
        read_only_fields = ['owner', 'uploaded_at', 'processed']
