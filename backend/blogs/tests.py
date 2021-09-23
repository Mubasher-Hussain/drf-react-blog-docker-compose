import json

from django.test import Client, TestCase
from django.contrib import auth
from django.contrib.auth import login, logout
from django.contrib.auth.models import User


class ViewsTest(TestCase):
    """Each test is independant and database is empty for each test"""
    def setUp(self):
        """Client for each tests."""
        self.client = Client()

    def test_blogs_list(self):
        """Creates User and its two blogs and retrieve them."""
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        user.blog_set.create(title='body', content='Con')
        user.blog_set.create(title='builder', content='tent')

        response = self.client.get('/blogs/api/posts')

        # Check response status, no of blogs returned and matches title and content.
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        self.assertEqual(response.json()[0]['title'], 'builder')
        self.assertEqual(response.json()[0]['content'], 'tent')

    def test_blogs_list_author(self):
        """Creates blogs for two users and retrieves them by author for each user"""
        user1 = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        user1.blog_set.create(title='body', content='Con')
        user1.blog_set.create(title='body2', content='Con2')

        user2 = User.objects.create_user(username='mubashir', password='123')
        self.client.login(username='mubashir', password='123')
        user2.blog_set.create(title='builder', content='tent')
        user2.blog_set.create(title='builder2', content='tent2')
        
        response1 = self.client.get('/blogs/api/mhussain/posts')
        response2 = self.client.get('/blogs/api/mubashir/posts')
        
        # Checks response statuses and confirms author matches.
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(len(response1.json()), 2)
        self.assertEqual(response1.json()[0]['author'], 'mhussain')
        self.assertEqual(response1.json()[1]['author'], 'mhussain')
        
        self.assertEqual(response2.status_code, 200)
        self.assertEqual(len(response2.json()), 2)
        self.assertEqual(response2.json()[0]['author'], 'mubashir')
        self.assertEqual(response2.json()[1]['author'], 'mubashir')

    def test_blogs_create(self):
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        response = self.client.post('/blogs/api/posts/create', {'content': 'tent', 'title': 'builder'})
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['title'], 'builder')
        self.assertEqual(response.json()['content'], 'tent')
        self.assertEqual(response.json()['author'], 'mhussain')

    def test_blogs_delete(self):
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        blog = user.blog_set.create(id=123, title='titled', content='content123')
        comment = user.comment_set.create(id=45, content='comment1', post=blog)
        response = self.client.delete('/blogs/api/post/123/delete')
        
        # Also confirms if comment and blog are deleted
        self.assertEqual(response.status_code, 204)
        self.assertFalse(comment in user.comment_set.all())        
        self.assertFalse(blog in user.blog_set.all())
    
    def test_blogs_edit(self):
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        blog = user.blog_set.create(id=123, title='titled', content='content123')
        data= {'title': 'editedTitle', 'content': 'editContent'}
        response = self.client.put('/blogs/api/post/123/edit', data, content_type='application/json')
        
        # Matches returned query with edited title and content
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['title'], 'editedTitle')
        self.assertEqual(response.json()['content'], 'editContent')
        self.assertEqual(response.json()['author'], 'mhussain')

    def test_signup(self):
        data = {'username': 'mhussain', 'email': 'abcd@b.com', 'password': '1234567'}
        response = self.client.generic('POST', '/blogs/api/register/' , json.dumps(data))
        user = User.objects.get(username='mhussain')
        
        # Confirms if user is in system by checking its email
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['success'], 'Registered.')
        self.assertEqual(user.email, 'abcd@b.com')

    def test_login(self):
        User.objects.create_user(username='mhussain', email='abc@d.com', password= '1234567')
        data = {'username': 'mhussain', 'password': '1234567'}
        response = self.client.generic('POST', '/blogs/api/login/', json.dumps(data))
        user = auth.get_user(self.client)
        
        # Confirms login by checking if client user is authenticated
        self.assertTrue(user.is_authenticated)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['Success'], 'Logged In')

    def test_logout(self):
        User.objects.create_user(username='mhussain', email='abc@d.com', password= '1234567')
        self.client.login(username='mhussain', password='123')
        response = self.client.get('/blogs/api/logout/')
        user = auth.get_user(self.client)
        
        # Confirms logout if client user is not authenticated
        self.assertFalse(user.is_authenticated)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['Success'], 'Logged Out')

    def test_blog_detail(self):
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        blog = user.blog_set.create(title='titled', content='content123')
        response = self.client.get('/blogs/api/post/1')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['post']['title'], 'titled')
        self.assertTrue(response.json()['isAuth'])

    def test_comment_detail(self):
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        blog = user.blog_set.create(title='titled', content='content123')
        user.comment_set.create(content='comment1', post=blog)
        user.comment_set.create(content='comment2', post=blog)
        response = self.client.get('/blogs/api/post/1/comments')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()[0]['content'], 'comment2')

    def test_comment_create(self):
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        blog = user.blog_set.create(id=100, title='titled', content='content123')
        response = self.client.post('/blogs/api/post/100/comments/create', {'content': 'comm1'})
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['content'], 'comm1')
        self.assertEqual(response.json()['commentator'], 'mhussain')
