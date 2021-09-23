from django.urls import path, re_path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

from django.shortcuts import render

 
app_name = 'blogs'

urlpatterns = [
    path('api/posts', views.BlogsList.as_view(), name='post_list'),
    path('api/<str:author>/posts', views.BlogsList.as_view(), name='post_list_author'),
    path('api/post/<int:pk>/delete', views.BlogsDetail.as_view(), name='post_delete'),
    path('api/post/<int:pk>/edit', views.BlogsDetail.as_view(), name='post_edit'),
    path('api/post/<int:pk>', views.BlogsDetail.as_view(), name='post_detail'),
    path('api/posts/create', views.BlogsList.as_view(), name='post_new'),
    path('api/post/<int:pk>/comments/create', views.CommentsDetail.as_view(), name='comment_new'),
    path('api/post/<int:pk>/comments', views.CommentsDetail.as_view(), name='comment_detail'),
    path('api/register/', views.register_request, name="register"),
    path('api/login/', views.login_request, name="login"),
    path('api/logout/', views.logout_request, name="logout"),
]

urlpatterns = format_suffix_patterns(urlpatterns)
