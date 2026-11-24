from django.urls import path
from . import views

urlpatterns = [
    path('external/<int:post_id>/', views.external_data_view, name='external-data'),
]
