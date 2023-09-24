from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import JsonResponse

from datetime import datetime
from .models import User, Video, Comment
from . import forms
# Create your views here.

def index(request):
    return render(request, "app/index.html")


def login_view(request):
    if request.method == "POST":
        form = forms.LoginForm(request.POST)
        # Attempt to sign user in
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            # Check if authentication successful
            if user is not None:
                login(request, user)
                return HttpResponseRedirect(reverse("index"))
            else:
                form = forms.LoginForm()
                return render(request, "app/login.html", {
                    "message": "Invalid username or password",
                    "form": form
                })
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
            username = form.cleaned_data['username']
            email = form.cleaned_data['email']

            # Ensure password matches confirmation
            password = form.cleaned_data["password"]
            confirmation = form.cleaned_data["confirmation"]
            if password != confirmation:
                form = forms.RegistrationForm()
                return render(request, "app/register.html", {
                    "message": "Passwords must match.",
                    "form": form
                })

            # Attempt to create new user
            try:
                user = User.objects.create_user(username, email, password)
                user.save()
            except IntegrityError:
                form = forms.RegistrationForm()
                return render(request, "app/register.html", {
                    "message": "Username already taken.",
                    "form": form
                })
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
            video = form.cleaned_data['video']

            if video.size > max_size:
                form.add_error('video', 'File size must be less than 250 MB.')
            else:
                title = form.cleaned_data['title']
                description = form.cleaned_data['description']
                video = Video(title = title, creator = request.user, description = description, video = video)
                video.save()
                return HttpResponseRedirect(reverse("index"))
    else:
        form = forms.VideoForm()
    return render(request, 'app/upload.html', {'form': form})

def watch(request, id):
    try:
        video = Video.objects.get(id=id)
    except Video.DoesNotExist:
        return render(request, "app/error.html", {"message" : "This video does not exist"})
    if request.method == "GET":
        if video:
            form = forms.CommentForm()
            comments = Comment.objects.filter(video = video).all()
            comments = comments.order_by('-timestamp')
            return render(request, "app/watch.html", {"video": video, "comments": comments, "form": form})
    else:
        form = forms.CommentForm(request.POST)
        if form.is_valid():
            content = form.cleaned_data['content']
            now = datetime.now()
            user =  request.user
            comment= Comment(user=user, video=video, timestamp= now, content=content)
            comment.save()
            video.comments += 1
            video.save()
            return HttpResponseRedirect(reverse("watch", args=[id]))