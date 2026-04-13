from django.urls import path
from . import views

urlpatterns = [
    path('auth/signup/', views.signup_user, name='signup_user'),
    path('auth/login/', views.login_user, name='login_user'),
    path('auth/logout/', views.logout_user, name='logout_user'),
    path('auth/me/', views.current_user, name='current_user'),
    path('videos/', views.videos_collection, name='videos_collection'),
    path('videos/<int:video_id>/detect_actions/', views.detect_actions, name='detect_actions'),  
    path('videos/<int:video_id>/detections/', views.get_detections, name='get_detections'),     
]
