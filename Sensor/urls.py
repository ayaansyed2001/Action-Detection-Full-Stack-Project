from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse  # ✅ Add this

# ✅ Simple homepage view
def home(request):
    return HttpResponse("<h2>✅ Action Detection API is running successfully!</h2><p>Use the /api/videos/ endpoint.</p>")

urlpatterns = [
    path('', home),  # 👈 Add this route for Render home page
    path('admin/', admin.site.urls),
    path('api/', include('action_detection.urls')),  
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
