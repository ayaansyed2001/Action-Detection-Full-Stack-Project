import { Camera, Upload } from 'lucide-react';

export default function HeroSection({ heroMetrics, onUploadClick, onWebcamClick, isUploading }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
      <div className="hero-panel">
        <div className="hero-panel__glow" />
        <div className="relative z-10">
          <span className="eyebrow">AI-powered activity monitoring</span>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Detect motion patterns, review evidence, and surface events with a premium control room feel.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Upload archived footage or record directly from webcam, then inspect every detection inside a modern
            dashboard designed for rapid triage.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={onUploadClick} disabled={isUploading} className="primary-button">
              <Upload className="h-5 w-5" />
              Upload footage
            </button>
            <button onClick={onWebcamClick} className="secondary-button">
              <Camera className="h-5 w-5" />
              Open webcam studio
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
        {heroMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="metric-card">
              <div className="metric-icon">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{metric.value}</p>
                <p className="mt-1 text-sm text-slate-400">{metric.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
