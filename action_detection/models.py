from django.db import models

# Create your models here.

class Video(models.Model):
    video_file = models.FileField(upload_to='videos/')
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
