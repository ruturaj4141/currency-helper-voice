
import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type CameraViewProps = {
  onStream: (stream: MediaStream) => void;
  onVideoElement: (element: HTMLVideoElement) => void;
  isActive: boolean;
  className?: string;
};

const CameraView: React.FC<CameraViewProps> = ({ 
  onStream, 
  onVideoElement, 
  isActive,
  className 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const setupCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not supported in this browser');
        }

        // Request camera access with preferred settings
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          onVideoElement(videoRef.current);
          onStream(stream);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An unknown error occurred while accessing the camera'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isActive) {
      setupCamera();
    }

    return () => {
      // Clean up stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, onStream, onVideoElement]);

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 animate-fade-in">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">Accessing camera...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 p-6 animate-fade-in">
          <div className="glass p-6 rounded-2xl max-w-sm">
            <h3 className="text-xl font-semibold text-red-600 mb-2">Camera Error</h3>
            <p className="text-foreground/90">{error}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Please ensure you've granted camera permissions to this app and try refreshing the page.
            </p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        onCanPlay={() => setIsLoading(false)}
      />
    </div>
  );
};

export default CameraView;
