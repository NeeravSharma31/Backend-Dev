from django.contrib import admin
from django.urls import path, include
from students import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', views.health_check, name='health-check'),
    path('api/students/', include('students.urls')),
]
