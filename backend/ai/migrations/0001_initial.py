# Generated by Django 5.1.4 on 2025-02-22 11:01

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='MusicStyle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='GenerationTask',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('task_id', models.CharField(blank=True, max_length=255, null=True)),
                ('request_type', models.CharField(choices=[('audio', 'Audio Generation'), ('extend', 'Audio Extension'), ('lyrics', 'Lyrics Generation'), ('wav', 'WAV Generation')], max_length=50)),
                ('example', models.CharField(blank=True, max_length=255, null=True)),
                ('status', models.CharField(default='pending', max_length=50)),
                ('result', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='generation_tasks', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Song',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('task_id', models.CharField(max_length=255)),
                ('model_name', models.CharField(max_length=255)),
                ('title', models.CharField(max_length=255)),
                ('audio_file', models.CharField(max_length=255)),
                ('photo_file', models.CharField(max_length=255)),
                ('example', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('styles', models.ManyToManyField(blank=True, to='ai.musicstyle')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='songs', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
