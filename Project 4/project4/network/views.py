from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
import json
import datetime

from .models import User, Post, Comment, Like, Follow


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
def post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    content = data.get('content')
    if content == '':
        return JsonResponse({"error": "Post requires content"}, status = 400 )
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Must be authenticated to post"}, status = 400)
    post = Post(
        author = request.user,
        content = content,
        timestamp = datetime.datetime.now(),
        likes = 0
    )
    post.save()
    return JsonResponse({"message": "Post Success", "status": 200}, status=200)

def get_posts(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    posts = Post.objects.all()
    posts = posts.order_by("-timestamp").all()
    print(posts)
    return JsonResponse([post.serialize() for post in posts], safe=False)

def get_posts_by_user(request, username):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    user = User.objects.get(username=username)
    posts = Post.objects.filter(author=user)
    posts = posts.order_by("-timestamp").all()
    print(posts)
    return JsonResponse([post.serialize() for post in posts], safe=False)

@login_required
def like(request, post_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    post = Post.objects.get(id = post_id)
    like_exists = Like.objects.filter(user=request.user, post=post).exists()
    if like_exists:
        post.likes -= 1
        like = Like.objects.filter(user=request.user, post=post)
        like.delete()
    else:
        post.likes += 1
        like = Like(
            user=request.user,
            post=post
        )
        like.save()
    post.save()
    return JsonResponse({"message": "Like Success", "status": 200, "likes" : post.likes}, status=200)

@login_required
def isliked(request, post_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    post = Post.objects.get(id = post_id)
    like_exists = Like.objects.filter(user=request.user, post=post).exists()
    return JsonResponse({"message": "Like Success", "status": 200, "isliked" : like_exists}, status=200)

def user(request, username):
    user = User.objects.get(username = username)
    followers = Follow.objects.filter(following=user).count()
    following = Follow.objects.filter(follower=user).count()
    return render(request, "network/user.html", {
        "user_data" : user,
        "followers": followers,
        "following": following
    })
