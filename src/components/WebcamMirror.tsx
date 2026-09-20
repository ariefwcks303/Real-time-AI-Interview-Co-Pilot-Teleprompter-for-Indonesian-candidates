import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface WebcamMirrorProps {
  isCompact?: boolean;
}

export const WebcamMirror: React.FC<WebcamMirrorProps> = ({ isCompact = false }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [showEyeGuide, setShowEyeGuide] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);
    } catch (err: any) {
      console.warn('Webcam mirror error:', err);
      setErrorMsg('Izin kamera ditolak atau tidak tersedia.');
      setIsActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div 
      id="webcam-mirror-container"
      className={`relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950/80 transition ${
        isCompact ? 'h-32' : 'h-44 sm:h-52'
      }`}
    >
      {isActive ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100 opacity-80 filter contrast-[1.05]"
          />

          {/* Eye Contact Guideline (Camera Horizon Line) */}
          {showEyeGuide && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center">
              <div className="w-full border-b border-dashed border-rose-400/40 relative">
                <span className="absolute -top-5 left-3 px-2 py-0.5 bg-neutral-950/80 border border-neutral-800 rounded text-[10px] text-rose-300 font-medium">
                  Tatap di area garis ini (Lensa Kamera)
                </span>
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10 bg-neutral-950/70 backdrop-blur-md px-2 py-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => setShowEyeGuide(!showEyeGuide)}
              title={showEyeGuide ? 'Sembunyikan Garis Lensa' : 'Tampilkan Garis Lensa'}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 text-xs transition"
            >
              {showEyeGuide ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={stopCamera}
              title="Matikan Preview Kamera"
              className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-neutral-800 text-xs transition"
            >
              <CameraOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl mb-2 text-neutral-400">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-neutral-300 block">Latihan Kontak Mata (Eye Contact Mirror)</span>
          <p className="text-[11px] text-neutral-500 max-w-xs mt-1 mb-2.5">
            Nyalakan preview kamera agar Anda terbiasa membaca script tepat di garis pandang webcam laptop.
          </p>
          {errorMsg && (
            <div className="flex items-center gap-1 text-[11px] text-rose-400 mb-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          <button
            id="start-webcam-mirror-btn"
            onClick={startCamera}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition"
          >
            Aktifkan Cermin Kamera
          </button>
        </div>
      )}
    </div>
  );
};
