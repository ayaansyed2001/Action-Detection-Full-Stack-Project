import { useEffect, useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { uploadVideoFile } from '../services/api';

export default function UploadPanel({ onUploadSuccess, setIsUploading, openRequestKey }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (openRequestKey > 0) {
      fileInputRef.current?.click();
    }
  }, [openRequestKey]);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setIsUploading(true);

    try {
      const video = await uploadVideoFile(file);
      onUploadSuccess(video, 'upload');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload video');
    } finally {
      setUploading(false);
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <section className="glass-panel rounded-[32px] p-5 sm:p-6">
      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />

      <div className="dashboard-banner">
        <div>
          <p className="panel-kicker">Upload station</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">Prepare footage for AI review</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Add a local video file to the pipeline. The upload control and API flow remain unchanged, now wrapped in a
            more polished experience.
          </p>
        </div>
        <div className="dashboard-banner__icon">
          <Upload className="h-7 w-7" />
        </div>
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="upload-dropzone mt-6 w-full"
      >
        <div className="upload-dropzone__icon">
          {uploading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Upload className="h-7 w-7" />}
        </div>
        <div>
          <p className="text-lg font-semibold text-white">{uploading ? 'Uploading footage...' : 'Choose a video file'}</p>
          <p className="mt-2 text-sm text-slate-400">MP4, WebM, AVI and other browser-supported formats</p>
        </div>
      </button>
    </section>
  );
}
