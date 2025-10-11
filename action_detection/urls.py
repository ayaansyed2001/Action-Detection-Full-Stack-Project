from django.urls import path
from . import views

urlpatterns = [
    path('videos/', views.upload_video, name='upload_video'),              
    path('videos/<int:video_id>/detect_actions/', views.detect_actions, name='detect_actions'),  
    path('videos/<int:video_id>/detections/', views.get_detections, name='get_detections'),     
]
