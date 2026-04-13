import os
import uuid
from django.conf import settings
from django.db import models
from django.utils.text import slugify

def video_upload_path(instance, filename):
    # split filename and extension
    base, ext = os.path.splitext(filename)
    # make the base URL-safe
    safe_name = slugify(base)
    # add a unique identifier to avoid overwrites
    unique_name = f"{safe_name}_{uuid.uuid4().hex}{ext}"
    return f"videos/{unique_name}"

class Video(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='videos', null=True, blank=True)
    video_file = models.FileField(upload_to=video_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)

    def __str__(self):
        return f"Video {self.id} - {self.uploaded_at}"

class ActionDetection(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='detections')
    timestamp = models.FloatField()
    action_label = models.CharField(max_length=255)
    confidence = models.FloatField()

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.action_label} at {self.timestamp}s"
