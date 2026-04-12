import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, StopCircle, Upload } from 'lucide-react';
import { uploadVideoFile } from '../services/api';

export default function WebcamPanel({ onUploadSuccess, setIsUploading }) {
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [streamActive, setStreamActive] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
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
      streamRef.current.getTracks().forEach((track) => track.stop());
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
      mimeType: 'video/webm',
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
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
    setIsUploading(true);

    try {
      const file = new File([recordedBlob], `webcam-recording-${Date.now()}.webm`, {
        type: 'video/webm',
      });
      const video = await uploadVideoFile(file);
      setRecordedBlob(null);
      stopWebcam();
      onUploadSuccess(video, 'upload');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload recorded video');
    } finally {
      setUploading(false);
      setIsUploading(false);
    }
  };

  return (
    <section className="glass-panel rounded-[32px] p-5 sm:p-6">
      <div className="dashboard-banner">
        <div>
          <p className="panel-kicker">Live capture</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">Webcam recording studio</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Preview the webcam feed, record a sequence, then upload the resulting clip for the same backend analysis
            flow you already have.
          </p>
        </div>
        <div className="dashboard-banner__icon">
          <Camera className="h-7 w-7" />
        </div>
      </div>

      <div className="webcam-stage mt-6">
        <div className="webcam-stage__status">
          <span className={`status-chip ${streamActive ? 'status-chip--live' : ''}`}>
            <span className="status-dot" />
            {isRecording ? 'Recording' : streamActive ? 'Camera live' : recordedBlob ? 'Preview ready' : 'Idle'}
          </span>
        </div>
        <div className="aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
          {recordedBlob ? (
            <video src={URL.createObjectURL(recordedBlob)} controls className="h-full w-full object-contain" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-contain" />
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {!streamActive && !recordedBlob && (
          <button onClick={startWebcam} className="primary-button w-full justify-center">
            <Camera className="h-5 w-5" />
            Start webcam
          </button>
        )}

        {streamActive && !isRecording && !recordedBlob && (
          <>
            <button onClick={startRecording} className="danger-button w-full justify-center">
              <span className="recording-dot" />
              Start recording
            </button>
            <button onClick={stopWebcam} className="secondary-button w-full justify-center">
              Close feed
            </button>
          </>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="danger-button danger-button--active w-full justify-center sm:col-span-2"
          >
            <StopCircle className="h-5 w-5" />
            Stop recording
          </button>
        )}

        {recordedBlob && (
          <>
            <button onClick={uploadRecordedVideo} disabled={uploading} className="primary-button w-full justify-center">
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Upload & analyze
                </>
              )}
            </button>
            <button onClick={() => setRecordedBlob(null)} className="secondary-button w-full justify-center">
              Discard take
            </button>
          </>
        )}
      </div>
    </section>
  );
}
