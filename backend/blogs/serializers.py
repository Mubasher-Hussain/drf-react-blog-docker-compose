from rest_framework import serializers
from .models import Blog, Comment


class BlogsSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    class Meta:
        model = Blog
        fields = ('id', 'title', 'content', 'author', 'created_at', 'updated_at')


class CommentSerializer(serializers.ModelSerializer):
    commentator = serializers.ReadOnlyField(source='commentator.username')
    post = serializers.ReadOnlyField(source='post.id')
    class Meta:
        model = Comment 
        fields = ('id', 'content', 'commentator', 'post', 'created_at' )
