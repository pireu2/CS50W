from django.db.models.signals import pre_delete
from django.dispatch import receiver
import os
from .models import Video  # Import the Video model

@receiver(pre_delete, sender=Video)
def delete_video_file(sender, instance, **kwargs):
    # Get the path of the video file and delete it
    if instance.video:
        if os.path.isfile(instance.video.path):
            os.remove(instance.video.path)