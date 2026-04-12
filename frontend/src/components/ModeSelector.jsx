import { Camera, Sparkles, Upload } from 'lucide-react';

const tabConfig = {
  upload: {
    icon: Upload,
    label: 'Upload Video',
    description: 'Drop in surveillance clips and run instant AI action detection.',
  },
  webcam: {
    icon: Camera,
    label: 'Webcam Studio',
    description: 'Capture a live scene, review it, and send it straight to analysis.',
  },
};

export default function ModeSelector({ activeTab, onTabChange }) {
  return (
    <div className="glass-panel rounded-[28px] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="panel-kicker">Input modes</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Capture workflow</h3>
        </div>
        <div className="soft-badge">
          <Sparkles className="h-4 w-4" />
          Interactive
        </div>
      </div>

      <div className="grid gap-3">
        {Object.entries(tabConfig).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = activeTab === key;

          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`mode-card ${isActive ? 'mode-card--active' : ''}`}
            >
              <div className="mode-card__icon">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{config.label}</p>
                  {isActive && <span className="soft-badge soft-badge--compact">Active</span>}
                </div>
                <p className="mt-1 text-sm text-slate-400">{config.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
