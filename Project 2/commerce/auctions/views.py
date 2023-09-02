from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse

from .models import User, AuctionListing, Bid, WatchListItem, Comment
from datetime import datetime

def index(request):
    active_listings = AuctionListing.objects.filter(active=True)
    return render(request, "auctions/index.html",{
        'listings': active_listings
    })


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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")
    
def create(request):
    categories = [cat[0] for cat in AuctionListing.CATEGORIES]
    if request.method == 'GET':
        return render(request, "auctions/create.html", {
            'categories' : categories
        })
    elif request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        price = request.POST.get('price')
        image = request.POST.get('image')
        category = request.POST.get('category')
        if title is None or description is None or price is None:
            return render(request, "auctions/create.html", {
                'categories' : categories,
                'message': 'Title, description and starting bid are mandatory'
            })
        else:
            listing = AuctionListing(title=title, 
                                     description=description, 
                                     price=price,
                                     image=image,
                                     category=category,
                                     active=True,
                                     creator=request.user,
                                     winner=None,
                                     date = datetime.now())
            listing.save()
            id = listing.id
            return redirect(f'/listing/{id}')

def listing(request, id):
    listing = AuctionListing.objects.get(id=id)
    if request.method == 'GET':
        if request.user.is_authenticated:
            return render(request, "auctions/listing.html", {
                        'listing': listing,
                        'user': request.user,
                        'watchlisted': WatchListItem.objects.filter(user=request.user, listing=listing).exists(),
                        'loggedin': request.user.is_authenticated,
                        'active': listing.active,
                        'comments': Comment.objects.filter(auction_listing = listing)
                    })
        else:
            return render(request, "auctions/listing.html", {
                        'listing': listing,
                        'user': request.user,
                        'watchlisted': False,
                        'loggedin': request.user.is_authenticated,
                        'active': listing.active,
                        'comments': Comment.objects.filter(auction_listing = listing)
                    })
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'Watchlist':
            item = WatchListItem(user=request.user, listing=listing)
            item.save()
        elif action == 'Close':
            listing.active = False
            listing.save()
        elif action == 'Remove from Watchlist':
            item = WatchListItem.objects.get(user=request.user, listing=listing)
            if item:
                item.delete()
        elif action == 'Post Comment':
            content = request.POST.get('comment')
            if content:
                comment = Comment(auction_listing = listing, author = request.user, content = content)
                comment.save()
        elif action == 'Bid':
            try:
                price = float(request.POST.get('bid'))
                if price <= listing.price:
                    raise ValueError
            except ValueError:
                message = 'The bid must be a number bigger than the current price!'
                return render(request, "auctions/listing.html", {
                    'listing': listing,
                    'user': request.user,
                    'watchlisted': WatchListItem.objects.filter(user=request.user, listing=listing).exists(),
                    'loggedin': request.user.is_authenticated,
                    'message': message,
                    'active' : listing.active
                })
            bid = Bid(auction_listing = listing, price = price, user = request.user)
            bid.save()
            listing.price = price
            listing.winner = request.user
            listing.save()
                

        return redirect(f'/listing/{listing.id}')

    
def watchlist(request):
    watchlisted_items = WatchListItem.objects.filter(user=request.user)
    print(watchlisted_items)
    return render(request, "auctions/watchlist.html",{
        'items': watchlisted_items
    })

def category(request):
    categories = [cat[0] for cat in AuctionListing.CATEGORIES]
    if request.method == 'GET':
        return render(request, "auctions/category.html", {
            'categories' : categories,
        })
    if request.method == 'POST':
        category = request.POST.get('category')
        print(category)
        return redirect(f'/categories/{category}')

def categories(request, category):
    categories = [cat[0] for cat in AuctionListing.CATEGORIES]
    if category == '--':
        listings = AuctionListing.objects.filter(active = True)
    else:
        listings = AuctionListing.objects.filter(category = category, active = True)
    if request.method == 'GET':
        return render(request, "auctions/categories.html", {
            'category': category,
            'categories' : categories,
            'listings': listings
        })