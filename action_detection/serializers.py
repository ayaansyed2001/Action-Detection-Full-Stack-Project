from rest_framework import serializers
from .models import Video, ActionDetection

class ActionDetectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionDetection
        fields = ['id', 'timestamp', 'action_label', 'confidence']

class VideoSerializer(serializers.ModelSerializer):
    detections = ActionDetectionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Video
        fields = ['id', 'video_file', 'uploaded_at', 'processed', 'detections']
        read_only_fields = ['uploaded_at', 'processed']
