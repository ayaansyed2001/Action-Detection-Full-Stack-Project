import { Activity, Clock, Sparkles } from 'lucide-react';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getConfidenceTone(confidence) {
  if (confidence >= 0.8) return 'confidence-pill confidence-pill--high';
  if (confidence >= 0.6) return 'confidence-pill confidence-pill--medium';
  return 'confidence-pill confidence-pill--low';
}

export default function DetectionResults({ detections, processing }) {
  return (
    <div className="glass-panel rounded-[28px] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="panel-kicker">Results</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Detection highlights</h3>
        </div>
        <div className="soft-badge">
          <Activity className="h-4 w-4" />
          {detections.length}
        </div>
      </div>

      {processing ? (
        <div className="space-y-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="skeleton-card">
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton mt-3 h-3 w-1/3" />
              <div className="skeleton mt-4 h-9 w-24 rounded-full" />
            </div>
          ))}
        </div>
      ) : detections.length > 0 ? (
        <div className="custom-scroll max-h-[42rem] space-y-3 overflow-y-auto pr-1">
          {detections.map((detection, idx) => (
            <div key={detection.id || idx} className="detection-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="detection-card__icon">
                      <Activity className="h-4 w-4" />
                    </div>
                    <p className="truncate text-sm font-semibold text-white">{detection.action_label}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(detection.timestamp)}</span>
                  </div>
                </div>
                <div className={getConfidenceTone(detection.confidence)}>
                  {(detection.confidence * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state min-h-[20rem]">
          <Sparkles className="h-12 w-12 text-slate-500" />
          <h4 className="mt-4 text-lg font-medium text-white">Awaiting detections</h4>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
            Run action detection on a selected video to populate this intelligence panel with time-stamped events.
          </p>
        </div>
      )}
    </div>
  );
}
