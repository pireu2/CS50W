
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.post, name="post"),
    path("get_posts", views.get_posts, name="get_posts"),
    path("like/<int:post_id>", views.like, name="like"),
    path("isliked/<int:post_id>", views.isliked, name="isliked")
]