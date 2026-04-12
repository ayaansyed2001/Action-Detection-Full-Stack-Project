import { useState } from 'react';
import { Shield, Video, Zap } from 'lucide-react';
import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ModeSelector from './components/ModeSelector';
import VideoLibrary from './components/VideoLibrary';
import UploadPanel from './components/UploadPanel';
import WebcamPanel from './components/WebcamPanel';
import VideoPlayerPanel from './components/VideoPlayerPanel';
import DetectionResults from './components/DetectionResults';

export default function VideoActionDetector() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [detections, setDetections] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadRequestKey, setUploadRequestKey] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processedCount = videos.filter((video) => video.processed).length;
  const detectionAverage = detections.length
    ? Math.round((detections.reduce((sum, detection) => sum + detection.confidence, 0) / detections.length) * 100)
    : 0;

  const heroMetrics = [
    {
      icon: Video,
      label: 'Video Sessions',
      value: videos.length.toString().padStart(2, '0'),
      detail: 'Clips staged for review',
    },
    {
      icon: Shield,
      label: 'Processed',
      value: processedCount.toString().padStart(2, '0'),
      detail: 'Analyzed by the model',
    },
    {
      icon: Zap,
      label: 'Signal Score',
      value: `${detectionAverage}%`,
      detail: 'Average detection confidence',
    },
  ];

  const handleUploadSuccess = (video, nextTab = 'upload') => {
    setVideos((currentVideos) => [video, ...currentVideos]);
    setSelectedVideo(video);
    setDetections([]);
    setActiveTab(nextTab);
  };

  const handleVideoSelect = (video, nextDetections = []) => {
    setSelectedVideo(video);
    setDetections(nextDetections);
  };

  const handleDetectionComplete = (videoId, nextDetections) => {
    setDetections(nextDetections);
    setVideos((currentVideos) =>
      currentVideos.map((video) => (video.id === videoId ? { ...video, processed: true } : video)),
    );
    setSelectedVideo((currentSelected) =>
      currentSelected?.id === videoId ? { ...currentSelected, processed: true } : currentSelected,
    );
  };

  return (
    <div className="app-shell min-h-screen">
      <div className="app-background">
        <div className="app-orb app-orb-primary" />
        <div className="app-orb app-orb-secondary" />
        <div className="app-grid" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <Header />

        <HeroSection
          heroMetrics={heroMetrics}
          onUploadClick={() => {
            setActiveTab('upload');
            setUploadRequestKey((currentKey) => currentKey + 1);
          }}
          onWebcamClick={() => setActiveTab('webcam')}
          isUploading={isUploading}
        />

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1.35fr_0.95fr]">
          <aside className="space-y-6">
            <ModeSelector activeTab={activeTab} onTabChange={setActiveTab} />
            <VideoLibrary videos={videos} selectedVideo={selectedVideo} onSelectVideo={handleVideoSelect} />
          </aside>

          <main className="space-y-6">
            {activeTab === 'upload' ? (
              <UploadPanel
                onUploadSuccess={handleUploadSuccess}
                setIsUploading={setIsUploading}
                openRequestKey={uploadRequestKey}
              />
            ) : (
              <WebcamPanel onUploadSuccess={handleUploadSuccess} setIsUploading={setIsUploading} />
            )}

            <VideoPlayerPanel
              selectedVideo={selectedVideo}
              onDetectionComplete={handleDetectionComplete}
              setIsProcessing={setIsProcessing}
            />
          </main>

          <aside className="space-y-6">
            <DetectionResults detections={detections} processing={isProcessing} />
          </aside>
        </section>
      </div>
    </div>
  );
}
