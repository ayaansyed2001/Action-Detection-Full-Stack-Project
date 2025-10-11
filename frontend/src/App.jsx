import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, Play, Clock, Activity, Loader2, CheckCircle, AlertCircle, Camera, StopCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function VideoActionDetector() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [detections, setDetections] = useState([]);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'webcam'
  
  // Webcam states 
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [streamActive, setStreamActive] = useState(false);
  


  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  // Cleanup webcam on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Failed to access webcam. Please ensure you have granted camera permissions.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setIsRecording(false);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm'
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadRecordedVideo = async () => {
    if (!recordedBlob) return;

    setUploading(true);
    const formData = new FormData();
    const file = new File([recordedBlob], `webcam-recording-${Date.now()}.webm`, {
      type: 'video/webm'
    });
    formData.append('video_file', file);

    try {
      const response = await fetch(`${API_BASE}/videos/`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setVideos([data, ...videos]);
      setSelectedVideo(data);
      setDetections([]);
      setRecordedBlob(null);
      setActiveTab('upload');
      stopWebcam();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload recorded video');
    } finally {
      setUploading(false);
    }
  };

  const discardRecording = () => {
    setRecordedBlob(null);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video_file', file);

    try {
      const response = await fetch(`${API_BASE}/videos/`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setVideos([data, ...videos]);
      setSelectedVideo(data);
      setDetections([]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const detectActions = async (videoId) => {
    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/videos/${videoId}/detect_actions/`, {
        method: 'POST',
      });
      const data = await response.json();
      setDetections(data.detections || []);
      
      setVideos(videos.map(v => 
        v.id === videoId ? { ...v, processed: true } : v
      ));
    } catch (error) {
      console.error('Detection error:', error);
      alert('Failed to detect actions');
    } finally {
      setProcessing(false);
    }
  };

  const fetchDetections = async (videoId) => {
    try {
      const response = await fetch(`${API_BASE}/videos/${videoId}/detections/`);
      const data = await response.json();
      setDetections(data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const selectVideo = (video) => {
    setSelectedVideo(video);
    if (video.processed) {
      fetchDetections(video.id);
    } else {
      setDetections([]);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Video Action Detection</h1>
          </div>
          <p className="text-gray-600 text-lg">Upload videos or record from webcam and detect actions using AI</p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => {
              setActiveTab('upload');
              stopWebcam();
            }}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <Upload className="w-5 h-5" />
            Upload Video
          </button>
          <button
            onClick={() => setActiveTab('webcam')}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'webcam'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <Camera className="w-5 h-5" />
            Webcam Recording
          </button>
        </div>

        {/* Upload Section */}
        {activeTab === 'upload' && (
          <div className="mb-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg font-semibold"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  Choose Video File
                </>
              )}
            </button>
          </div>
        )}

        {/* Webcam Section */}
        {activeTab === 'webcam' && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
              {recordedBlob ? (
                <video
                  src={URL.createObjectURL(recordedBlob)}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="flex gap-3">
              {!streamActive && !recordedBlob && (
                <button
                  onClick={startWebcam}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Start Webcam
                </button>
              )}

              {streamActive && !isRecording && !recordedBlob && (
                <>
                  <button
                    onClick={startRecording}
                    className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    Start Recording
                  </button>
                  <button
                    onClick={stopWebcam}
                    className="px-6 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </>
              )}

              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 animate-pulse"
                >
                  <StopCircle className="w-5 h-5" />
                  Stop Recording
                </button>
              )}

              {recordedBlob && (
                <>
                  <button
                    onClick={uploadRecordedVideo}
                    disabled={uploading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload & Analyze
                      </>
                    )}
                  </button>
                  <button
                    onClick={discardRecording}
                    className="px-6 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Discard
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                Videos ({videos.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {videos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No videos uploaded yet</p>
                  </div>
                ) : (
                  videos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => selectVideo(video)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedVideo?.id === video.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm mb-1">
                            Video #{video.id}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(video.uploaded_at).toLocaleString()}
                          </p>
                        </div>
                        {video.processed && (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {selectedVideo ? (
              <>
                {/* Video Player */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Video #{selectedVideo.id}
                    </h2>
                  </div>
                  <div className="p-6">
                    <video
                      controls
                      className="w-full rounded-xl bg-black"
                      src={`http://localhost:8000${selectedVideo.video_file}`}
                    />
                    {!selectedVideo.processed && (
                      <button
                        onClick={() => detectActions(selectedVideo.id)}
                        disabled={processing}
                        className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Detecting Actions...
                          </>
                        ) : (
                          <>
                            <Activity className="w-5 h-5" />
                            Detect Actions
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Detections */}
                {detections.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-600" />
                      Detected Actions ({detections.length})
                    </h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {detections.map((detection, idx) => (
                        <div
                          key={detection.id || idx}
                          className="p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 mb-1">
                                {detection.action_label}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(detection.timestamp)}</span>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(detection.confidence)}`}>
                              {(detection.confidence * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Video Selected</h3>
                <p className="text-gray-600">
                  Upload a video, record from webcam, or select one from the list
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}