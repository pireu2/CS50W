from django import forms
from .models import Video, Comment


class LoginForm(forms.Form):
    username = forms.CharField(max_length=64, label="Username", required=True)
    password = forms.CharField(widget=forms.PasswordInput, required=True)


class RegistrationForm(forms.Form):
    username = forms.CharField(max_length=64, label="Username", required=True)
    email = forms.EmailField(label="Email", required=True)
    password = forms.CharField(widget=forms.PasswordInput, required=True)
    confirmation = forms.CharField(widget=forms.PasswordInput, required=True)


class VideoForm(forms.ModelForm):
    class Meta:
        model = Video
        fields = ["title", "description", "video"]

    widgets = {
        "creator": forms.HiddenInput(),
        "description": forms.Textarea(attrs={"rows": 4, "cols": 15}),
    }


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ["content"]
