# CS50W Final Project
 [Video Demo](https://youtu.be/NJsguc7gWOg)
 </br>
This is my final project for CS50’s Web Programming with Python and JavaScript. </br>
My final project is a youtube clone where users cand upload videos, subscribe to eachother, like and dislike videos, post comments, search for videos and change their profile picture. </br>
All my pages are mobile responsive. </br>

# Distinctiveness and Complexity
My project is different from all the other projects in this course, because I put a lot of effort in making the website look modern and mobile responsive, also my project is the only one to manage files and to post the to different directories in the django project.</br>
Another unique thing about my project is the customization that each user has. Every user can change their profile picture and upload any videos they want. In his way, they can build a strong community around their uploads. </br>

# Files and Directories
- `app` - main application directiory
    - `static` - contains all static content
        - `icon.svg` - main icon for the website
        - `comment.js` - js script to post comments to the server
        - `expand-description.js` - js script to expand and hide description of a video
        - `get-cookie.js` - js script to get the cookie of the current session to use in the forms for the server
        - `like.js` - js script for liking and dislinking videos without refreshin the page
        - `profile-redirect.js` - js script to link all profile pictures and usernames to a user's profile
        - `recommended-vid-redirect.js` - js script to link all recommended videos to their watch page
        - `search.js` - js script to search for videos 
        - `subscribe.js` - js script for subscribing and unsubscribing to users 
        - `vid-redirect.js` - js script to redirect home page videos to their wath page
        - `style.css` - main css file used for styling
    - `templates` - contains all html templates
        - `change.html` - page for changing avatar
        - `error.html` - page for displaying errors
        - `index.html` - home page
        - `layout.html` - main layout for all pages
        - `login.html` - login form
        - `profile.html` - page for displaying user profiles
        - `register.html` - register form
        - `search.html` - page for searching videos
        - `subscribed.html` - page for all videos from users you subscribed to
        - `upload.html` - form for uploading vidoes
        - `watch.html` - page for viewing videos
    - `forms.py` - contains all django forms for the application
    - `models.py` - contains all forms for the application(user, video, comment, like, dislike, subscription)
    - `signals.py` - contains signal for pre deleting videos to remove the video from the application folder as well
    - `urls.py` - contains all urls for the application
    - `views.py` - contains all views for the application
- `youtv` - project directory
    - `settings.py` - modified to include the MEDIA_URL for the models to upload the videos and avatars
- `media` - media directory
    - `avatars` - location of all user avatars, 'default-avatar.png' is the default avatar when creating a account
    - `videos` - location of all user videos


# Setup

```shell script
git clone https://github.com/pireu2/Youtube-Clone.git
pip install -r requirements.txt
```

Run those following commands to migrate database.

```shell script
python manage.py makemigrations
python manage.py migrate
```

When the dependent packages are installed, you can run this command to run your server.
```shell script
python manage.py runserver
```

### Special thanks for the CS50W team for making this amazing course possible.
