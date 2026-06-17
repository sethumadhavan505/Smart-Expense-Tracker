from django.contrib import admin
from django.urls import path, include  # You must import 'include'
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('admin/', admin.site.urls),  # Access the admin panel
    path('accounts/', include('django.contrib.auth.urls')),
    path('', include('tracker.urls')), # Connects your 'tracker' app urls to the root
]