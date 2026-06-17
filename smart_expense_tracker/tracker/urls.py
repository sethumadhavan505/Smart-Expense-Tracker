from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('add/', views.add_expense, name='add_expense'),
    path('delete/<int:pk>/', views.delete_expense, name='delete_expense'),
    path('export/<str:format>/', views.export_report, name='export_report'),
    
    # Simple Logout path - Settings-la irukura URL-ai idhu follow pannum
    path('logout/', views.logout_view, name='logout'),
    path('signup/', views.signup_view, name='signup'),
]