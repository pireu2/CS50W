from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class AuctionListing(models.Model):
    CATEGORIES = [('--', '--'),
                  ('Fashion','Fashion'), 
                  ('Toys','Toys'), 
                  ('Electronics','Electronics'), 
                  ('Home','Home')]
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=32)
    description = models.TextField(max_length=200)
    price = models.FloatField(null=True)
    category = models.CharField(choices=CATEGORIES, default=1, max_length=30)
    image = models.URLField(null=True)
    active = models.BooleanField(default=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='creators')
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='winner', null=True)
    date = models.DateField(null=True)

    def __str__(self):
        return f'{self.title}'

class Bid(models.Model):
    id = models.AutoField(primary_key=True)
    auction_listing = models.ForeignKey(AuctionListing, on_delete=models.CASCADE)
    price = models.FloatField(null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bids')

    def __str__(self):
        return f'{self.price}'

class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    auction_listing=models.ForeignKey(AuctionListing, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(max_length=200)
    
    def __str__(self):
        return f'{self.content}'
    
class WatchListItem(models.Model):
    id= models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    listing= models.ForeignKey(AuctionListing, on_delete=models.CASCADE)   

    def __str__(self):
        return f'{self.id} {self.user.username} {self.listing.title}'  