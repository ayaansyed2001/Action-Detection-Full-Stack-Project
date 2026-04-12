import { useState } from 'react';
import { Activity, AlertCircle, Loader2, Play } from 'lucide-react';
import { APP_ORIGIN, detectVideoActions } from '../services/api';

export default function VideoPlayerPanel({ selectedVideo, onDetectionComplete, setIsProcessing }) {
  const [processing, setProcessing] = useState(false);

  const handleDetectActions = async () => {
    if (!selectedVideo) return;

    setProcessing(true);
    setIsProcessing(true);

    try {
      const data = await detectVideoActions(selectedVideo.id);
      onDetectionComplete(selectedVideo.id, data.detections || []);
    } catch (error) {
      console.error('Detection error:', error);
      alert('Failed to detect actions');
    } finally {
      setProcessing(false);
      setIsProcessing(false);
    }
  };

  if (!selectedVideo) {
    return (
      <section className="glass-panel rounded-[32px] p-8 sm:p-12">
        <div className="empty-state min-h-[24rem]">
          <AlertCircle className="h-14 w-14 text-slate-500" />
          <h3 className="mt-5 text-2xl font-semibold text-white">No video selected</h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
            Choose an existing clip from the library, upload a new video, or capture one from webcam to unlock the
            player and detection insights.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel rounded-[32px] overflow-hidden">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Review player</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">Video #{selectedVideo.id}</h3>
        </div>
        <div className="soft-badge">
          <Play className="h-4 w-4" />
          Playback ready
        </div>
      </div>

      <div className="p-5 pt-0 sm:p-6 sm:pt-0">
        <div className="rounded-[24px] border border-white/10 bg-slate-950/90 p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
          <video
            controls
            className="aspect-video w-full rounded-[18px] bg-black object-contain"
            src={`${APP_ORIGIN}${selectedVideo.video_file}`}
          />
        </div>

        {!selectedVideo.processed && (
          <button onClick={handleDetectActions} disabled={processing} className="primary-button mt-5 w-full justify-center">
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Detecting actions...
              </>
            ) : (
              <>
                <Activity className="h-5 w-5" />
                Detect actions
              </>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
