from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.db import models

# Create your models here.


class User(AbstractUser):
    pass


class Video(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255, blank=False)
    description = models.TextField(null=True)
    creator = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="uploads"
    )
    video = models.FileField(upload_to="videos/")

    def __str__(self):
        return f'{self.creator} - {self.title}'
