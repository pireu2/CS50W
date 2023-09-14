from django.contrib.auth.models import AbstractUser
from django.db import models



class User(AbstractUser):
    following = models.ManyToManyField('self', through='Follow', symmetrical=False, related_name='user_following')
    
class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followed_by')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follows')

    def __str__(self):
        return f'{self.follower} is following {self.following}'


class Post(models.Model):
    id= models.AutoField(primary_key=True)
    author = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    content = models.TextField(blank=False)
    timestamp = models.DateTimeField(blank=False)
    likes = models.IntegerField(default=0)

    def serialize(self):
        return {
            "id": self.id,
            "author": self.author.username,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes,
        }

    def __str__(self):
        return f'{self.author} - {self.content}'
    
class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey("User", on_delete=models.CASCADE, related_name="authors")
    content = models.TextField(blank=False)

    def __str__(self):
        return f'{self.author} - {self.content}'
    
class Like(models.Model):
    id = models.AutoField(primary_key=True)
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="liked")
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="usrlikes")