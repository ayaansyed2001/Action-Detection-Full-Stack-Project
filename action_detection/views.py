from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Video, ActionDetection
from .serializers import VideoSerializer, ActionDetectionSerializer
from .action_detector import ActionDetector


@api_view(['POST'])
def upload_video(request):
    serializer = VideoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def detect_actions(request, video_id):
    try:
        video = Video.objects.get(pk=video_id)
    except Video.DoesNotExist:
        return Response({'error': 'Video not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if video.processed:
        return Response({
            'message': 'Video already processed',
            'detections': ActionDetectionSerializer(video.detections.all(), many=True).data
        })
    
    try:
        detector = ActionDetector()
        video_path = video.video_file.path
        detections = detector.process_video(video_path)
        
        # Save detections
        for d in detections:
            ActionDetection.objects.create(
                video=video,
                timestamp=d['timestamp'],
                action_label=d['action_label'],
                confidence=d['confidence']
            )
        
        video.processed = True
        video.save()
        
        return Response({
            'message': 'Actions detected successfully',
            'detections': ActionDetectionSerializer(video.detections.all(), many=True).data
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def get_detections(request, video_id):
    try:
        video = Video.objects.get(pk=video_id)
    except Video.DoesNotExist:
        return Response({'error': 'Video not found'}, status=status.HTTP_404_NOT_FOUND)
    
    detections = video.detections.all()
    serializer = ActionDetectionSerializer(detections, many=True)
    return Response(serializer.data)
