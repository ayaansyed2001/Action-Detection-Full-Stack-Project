from django.contrib import admin
from .models import Video, ActionDetection

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['id', 'video_file', 'uploaded_at', 'processed']
    list_filter = ['processed', 'uploaded_at']

@admin.register(ActionDetection)
class ActionDetectionAdmin(admin.ModelAdmin):
    list_display = ['id', 'video', 'timestamp', 'action_label', 'confidence']
    list_filter = ['action_label']
    search_fields = ['action_label']
