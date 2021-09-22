import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.cache import never_cache
from django.views.generic import TemplateView

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response

from blogs.models import Blog, Comment
from blogs.permissions import IsAuthorOrReadOnly
from blogs.serializers import BlogsSerializer, CommentSerializer

# Serve Single Page Application
index = never_cache(TemplateView.as_view(template_name='index.html'))


class BlogsList(generics.ListCreateAPIView):
    """List all blogs, or create a new blog"""
    queryset = Blog.objects.all().order_by('-updated_at')
    serializer_class = BlogsSerializer
    
    def get_queryset(self):
        """For displaying author specific posts if author is specified in url"""
        if self.kwargs:
            try:
                author = User.objects.get(username=self.kwargs['author'])
                return Blog.objects.filter(author=author).order_by('-updated_at')
            except User.DoesNotExist:
                print('Author not found')
        else:
            return Blog.objects.all().order_by('-updated_at')
            
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class BlogsDetail(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific Blog"""
    permission_classes = [IsAuthorOrReadOnly]
    queryset = Blog.objects.all().order_by('-updated_at')
    serializer_class = BlogsSerializer

    def retrieve(self, request, pk):
        """For adding isAuthor field to return data for edit/delete options"""
        data = {}
        blog_obj = self.get_object()
        blog_serialized = self.serializer_class(blog_obj)
        data['post'] = blog_serialized.data
        if request.user.is_authenticated:
            data['isAuth'] = 'yes' if blog_obj in request.user.blog_set.all() else ''
        return Response(data)


class CommentsDetail(generics.ListCreateAPIView):
    """Create or display comments"""
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer

    def get_queryset(self):
        """To list only Blog specific comments"""
        return Comment.objects.filter(post_id=self.kwargs['pk']).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(commentator=self.request.user, post=Blog.objects.get(id=self.kwargs['pk']))

        
def register_request(request):
    """For registering of users"""
    if request.method == 'POST':
        body = json.loads(request.body)
        try:
            user = User.objects.create_user(body['username'], body['email'], body['password'])
            return JsonResponse({'success': "Registered."})
        except:
            return JsonResponse({'error': "Username or Email already exists"})
    

@ensure_csrf_cookie
def login_request(request):
    if request.method == "POST":
        body = json.loads(request.body)
        user = authenticate(username=body['username'], password=body['password'])
        if user is not None:
            login(request, user)
            return JsonResponse({'Success': 'Logged In'})
        else:
            return JsonResponse({'error': "Invalid username or password."})       


def logout_request(request):
    logout(request)
    return JsonResponse({'Success': 'Logged Out'})
