from django.contrib.auth import authenticate
from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import ActionDetection, Video
from .serializers import (
    ActionDetectionSerializer,
    LoginSerializer,
    SignUpSerializer,
    UserSerializer,
    VideoSerializer,
)


def _get_user_video(video_id, user):
    return Video.objects.filter(pk=video_id, owner=user).first()


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def signup_user(request):
    serializer = SignUpSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = authenticate(
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password'],
    )
    if not user:
        return Response({'detail': 'Invalid username or password.'}, status=status.HTTP_400_BAD_REQUEST)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': UserSerializer(user).data})


@api_view(['POST'])
def logout_user(request):
    Token.objects.filter(user=request.user).delete()
    return Response({'detail': 'Logged out successfully.'})


@api_view(['GET'])
def current_user(request):
    return Response({'user': UserSerializer(request.user).data})


@api_view(['GET', 'POST'])
def videos_collection(request):
    if request.method == 'GET':
        videos = Video.objects.filter(owner=request.user).order_by('-uploaded_at')
        return Response(VideoSerializer(videos, many=True).data)

    serializer = VideoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def detect_actions(request, video_id):
    video = _get_user_video(video_id, request.user)
    if not video:
        return Response({'error': 'Video not found'}, status=status.HTTP_404_NOT_FOUND)

    if video.processed:
        return Response({
            'message': 'Video already processed',
            'detections': ActionDetectionSerializer(video.detections.all(), many=True).data,
        })

    try:
        from .action_detector import ActionDetector

        detector = ActionDetector()
        detections = detector.process_video(video.video_file.path)

        for detection in detections:
            ActionDetection.objects.create(
                video=video,
                timestamp=detection['timestamp'],
                action_label=detection['action_label'],
                confidence=detection['confidence'],
            )

        video.processed = True
        video.save()

        return Response({
            'message': 'Actions detected successfully',
            'detections': ActionDetectionSerializer(video.detections.all(), many=True).data,
        })
    except Exception as error:
        return Response({'error': str(error)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_detections(request, video_id):
    video = _get_user_video(video_id, request.user)
    if not video:
        return Response({'error': 'Video not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ActionDetectionSerializer(video.detections.all(), many=True)
    return Response(serializer.data)
