from django.shortcuts import render, redirect
from django.http import HttpResponse
import markdown2
import random as rand

from . import util


def index(request):
    return render(request, "encyclopedia/index.html", {"entries": util.list_entries()})


def wiki(request, title):
    content = util.get_entry(title)
    if content:
        html = markdown2.markdown(content)
        return render(
            request, "encyclopedia/article.html", {"title": title, "html": html}
        )
    else:
        return render(
            request,
            "encyclopedia/error.html",
            {"message": "The article you seem to be searching was not found!"},
        )


def search(request):
    q = request.GET.get("q").strip()
    if q in util.list_entries():
        return redirect("wiki", title=q)
    return render(
        request, "encyclopedia/search.html", {"entries": util.search(q), "q": q}
    )


def create(request):
    if request.method == "GET":
        return render(request, "encyclopedia/create.html")
    elif request.method == "POST":
        title = request.POST.get("title")
        content = request.POST.get("content")
        if title in util.list_entries():
            return render(
                request,
                "encyclopedia/error.html",
                {"message": "The title you entered is not available!"},
            )
        else:
            with open(f"entries/{title}.md", "w") as file:
                file.write(content)
            return redirect("wiki", title=title)


def edit(request, title):
    if request.method == "GET":
        content = util.get_entry(title)
        if content:
            return render(
                request, "encyclopedia/edit.html", {"title": title, "content": content}
            )
    elif request.method == "POST":
        new_title = request.POST.get("title")
        new_content = request.POST.get("content")
        with open(f"entries/{title}.md", "w") as file:
            file.write(new_content)
        return redirect("wiki", title=new_title)


def random(request):
    return redirect("wiki", title=rand.choice(util.list_entries()))
