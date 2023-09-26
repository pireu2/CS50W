from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.post, name="post"),
    path("get_posts", views.get_posts, name="get_posts"),
    path(
        "get_posts_by_user/<str:username>",
        views.get_posts_by_user,
        name="get_posts_by_user",
    ),
    path("get_posts_following", views.get_posts_following, name="get_posts_following"),
    path("like/<int:post_id>", views.like, name="like"),
    path("isliked/<int:post_id>", views.isliked, name="isliked"),
    path("edit/<int:post_id>", views.edit, name="edit"),
    path("user/<str:username>", views.user, name="user"),
    path("follow", views.follow, name="follow"),
    path("unfollow", views.unfollow, name="unfollow"),
    path("following", views.following, name="following"),
]
