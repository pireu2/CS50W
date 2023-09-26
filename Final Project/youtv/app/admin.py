from django.contrib import admin
from . import models

# Register your models here.
admin.site.register(models.User)
admin.site.register(models.Video)
admin.site.register(models.Comment)
admin.site.register(models.Like)
admin.site.register(models.Dislike)
admin.site.register(models.Subscription)
