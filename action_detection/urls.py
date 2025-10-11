from django.urls import path
from . import views

urlpatterns = [
    path('videos/', views.upload_video, name='upload_video'),              # POST to upload
    path('videos/<int:video_id>/detect_actions/', views.detect_actions, name='detect_actions'),  # POST to detect
    path('videos/<int:video_id>/detections/', views.get_detections, name='get_detections'),     # GET detections
]
