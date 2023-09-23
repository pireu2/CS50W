from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import pre_delete
from django.core.files.storage import FileSystemStorage
from django.db import models
from django.conf import settings

# Create your models here.


class User(AbstractUser):
    avatar = models.FileField(upload_to="avatars/", default=settings.DEFAULT_AVATAR_PATH)
    subscribers = models.IntegerField(default=0)


class Video(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255, blank=False)
    description = models.TextField(null=True, blank=True)
    creator = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="uploads"
    )
    video = models.FileField(upload_to="videos/")
    likes = models.IntegerField(default=0)
    dislikes = models.IntegerField(default=0)
    comments = models.IntegerField(default=0)

    def __str__(self):
        return f'{self.creator} - {self.title}'
    
    def delete(self, *args, **kwargs):
        self.video.delete()
        super().delete(*args, **kwargs)
