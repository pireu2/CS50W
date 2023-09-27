from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import JsonResponse

import json
from datetime import datetime
from .models import User, Video, Comment, Like, Dislike, Subscription
from . import forms

# Create your views here.


def index(request):
    return render(request, "app/index.html")


def login_view(request):
    if request.method == "POST":
        form = forms.LoginForm(request.POST)
        # Attempt to sign user in
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            user = authenticate(request, username=username, password=password)
            # Check if authentication successful
            if user is not None:
                login(request, user)
                return HttpResponseRedirect(reverse("index"))
            else:
                form = forms.LoginForm()
                return render(
                    request,
                    "app/login.html",
                    {"message": "Invalid username or password", "form": form},
                )
    else:
        form = forms.LoginForm()
        return render(request, "app/login.html", {"form": form})


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        form = forms.RegistrationForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            email = form.cleaned_data["email"]

            # Ensure password matches confirmation
            password = form.cleaned_data["password"]
            confirmation = form.cleaned_data["confirmation"]
            if password != confirmation:
                form = forms.RegistrationForm()
                return render(
                    request,
                    "app/register.html",
                    {"message": "Passwords must match.", "form": form},
                )

            # Attempt to create new user
            try:
                user = User.objects.create_user(username, email, password)
                user.save()
            except IntegrityError:
                form = forms.RegistrationForm()
                return render(
                    request,
                    "app/register.html",
                    {"message": "Username already taken.", "form": form},
                )
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
    else:
        form = forms.RegistrationForm()
        return render(request, "app/register.html", {"form": form})


@login_required
def upload(request):
    if request.method == "POST":
        form = forms.VideoForm(request.POST, request.FILES)
        if form.is_valid():
            max_size = 250 * 1024 * 1024
            video = form.cleaned_data["video"]

            if video.size > max_size:
                form.add_error("video", "File size must be less than 250 MB.")
            else:
                title = form.cleaned_data["title"]
                description = form.cleaned_data["description"]
                timestamp = datetime.now()
                video = Video(
                    title=title,
                    creator=request.user,
                    description=description,
                    video=video,
                    timestamp=timestamp,
                )
                video.save()
                return HttpResponseRedirect(reverse("index"))
    else:
        form = forms.VideoForm()
    return render(request, "app/upload.html", {"form": form})


def watch(request, id):
    try:
        video = Video.objects.get(id=id)
    except Video.DoesNotExist:
        return render(
            request, "app/error.html", {"message": "This video does not exist"}
        )
    if request.method == "GET":
        if video:
            form = forms.CommentForm()
            comments = Comment.objects.filter(video=video).all()
            comments = comments.order_by("-timestamp")
            vids = Video.objects.exclude(id=id)[:20]
            liked = (
                Like.objects.filter(video=video, user=request.user).exists()
                if request.user.is_authenticated
                else False
            )
            disliked = (
                Dislike.objects.filter(video=video, user=request.user).exists()
                if request.user.is_authenticated
                else False
            )
            subbed = (
                Subscription.objects.filter(
                    creator=video.creator, subscriber=request.user
                ).exists()
                if request.user.is_authenticated
                else False
            )
            return render(
                request,
                "app/watch.html",
                {
                    "video": video,
                    "comments": comments,
                    "form": form,
                    "vids": vids,
                    "liked": liked,
                    "disliked": disliked,
                    "subbed": subbed,
                },
            )


@login_required
def like(request, video_id):
    if request.method != "POST":
        return render(request, "app/error.html", {"message": "POST method required."})
    video = Video.objects.get(id=video_id)
    try:
        like = Like.objects.get(video=video, user=request.user)
    except Like.DoesNotExist:
        video.likes += 1
        video.save()
        like = Like(video=video, user=request.user)
        like.save()
        return JsonResponse(
            {"message": "Like Success", "status": 200, "likes": video.likes}, status=200
        )
    else:
        video.likes = video.likes - 1
        video.save()
        like.delete()
        return JsonResponse(
            {"message": "Like Removed", "status": 200, "likes": video.likes}, status=200
        )


@login_required
def dislike(request, video_id):
    if request.method != "POST":
        return render(request, "app/error.html", {"message": "POST method required."})
    video = Video.objects.get(id=video_id)
    try:
        dislike = Dislike.objects.get(video=video, user=request.user)
    except Dislike.DoesNotExist:
        video.dislikes += 1
        video.save()
        dislike = Dislike(video=video, user=request.user)
        dislike.save()
        return JsonResponse(
            {"message": "disLike Success", "status": 200, "dislikes": video.dislikes},
            status=200,
        )
    else:
        video.dislikes = video.dislikes - 1
        video.save()
        dislike.delete()
        return JsonResponse(
            {"message": "disLike Removed", "status": 200, "dislikes": video.dislikes},
            status=200,
        )


@login_required
def subscribe(request, username):
    if request.method != "POST":
        return render(request, "app/error.html", {"message": "POST method required."})
    try:
        creator = User.objects.get(username=username)
    except User.DoesNotExist:
        return render(
            request, "app/error.html", {"message": "This user does not exist."}
        )
    try:
        is_subbed = Subscription.objects.get(creator=creator, subscriber=request.user)
    except Subscription.DoesNotExist:
        sub = Subscription(creator=creator, subscriber=request.user)
        creator.subscribers += 1
        sub.save()
        creator.save()
        return JsonResponse(
            {"message": "Sub Success", "status": 200, "subs": creator.subscribers},
            status=200,
        )
    else:
        is_subbed.delete()
        creator.subscribers -= 1
        creator.save()
        return JsonResponse(
            {"message": "Unsub Success", "status": 200, "subs": creator.subscribers},
            status=200,
        )


@login_required
def comment(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    content = data.get("content")
    video_id = data.get("video_id")
    try:
        video = Video.objects.get(id=video_id)
    except Video.DoesNotExist:
        return JsonResponse({"error": "Video does not exitst"}, status=400)
    if content == "":
        return JsonResponse({"error": "Post requires content"}, status=400)
    timestamp = datetime.now()
    comment = Comment(
        video=video, content=content, user=request.user, timestamp=timestamp
    )
    comment.save()
    video.comments += 1
    video.save()
    formatted_datetime = timestamp.strftime("%b. %d, %Y, %I:%M %#p")
    return JsonResponse(
        {
            "message": "Post Success",
            "status": 200,
            "avatarurl": request.user.avatar.url,
            "timestamp": formatted_datetime,
            "comments": video.comments
        },
        status=200,
    )
