from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('action_detection', '0002_alter_video_video_file'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('authtoken', '0004_alter_tokenproxy_options'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='owner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='videos', to=settings.AUTH_USER_MODEL),
        ),
    ]
