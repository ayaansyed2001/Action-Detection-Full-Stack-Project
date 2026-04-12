import { CheckCircle, Play, Video } from 'lucide-react';
import { fetchVideoDetections } from '../services/api';

export default function VideoLibrary({ videos, selectedVideo, onSelectVideo }) {
  const handleSelect = async (video) => {
    if (!video.processed) {
      onSelectVideo(video, []);
      return;
    }

    try {
      const nextDetections = await fetchVideoDetections(video.id);
      onSelectVideo(video, nextDetections);
    } catch (error) {
      console.error('Fetch error:', error);
      onSelectVideo(video, []);
    }
  };

  return (
    <div className="glass-panel rounded-[28px] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="panel-kicker">Library</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Uploaded videos</h3>
        </div>
        <div className="soft-badge">
          <Video className="h-4 w-4" />
          {videos.length}
        </div>
      </div>

      <div className="custom-scroll max-h-[30rem] space-y-3 overflow-y-auto pr-1">
        {videos.length === 0 ? (
          <div className="empty-state">
            <Video className="h-10 w-10 text-slate-500" />
            <h4 className="mt-4 text-lg font-medium text-white">No footage yet</h4>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
              Start by uploading a clip or recording from webcam to populate the review queue.
            </p>
          </div>
        ) : (
          videos.map((video) => (
            <button
              key={video.id}
              onClick={() => handleSelect(video)}
              className={`video-list-card ${selectedVideo?.id === video.id ? 'video-list-card--active' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="video-list-card__thumb">
                  <Play className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="truncate text-sm font-semibold text-white">Video #{video.id}</p>
                      <p className="mt-1 text-xs text-slate-400">{new Date(video.uploaded_at).toLocaleString()}</p>
                    </div>
                    {video.processed ? (
                      <span className="soft-badge soft-badge--success">
                        <CheckCircle className="h-4 w-4" />
                        Ready
                      </span>
                    ) : (
                      <span className="soft-badge soft-badge--muted">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
