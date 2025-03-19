
import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { getCurrencyById } from '@/utils/currencyData';
import { loadCurrencyDetectionModel, detectCurrency } from '@/utils/modelLoader';
import * as tf from '@tensorflow/tfjs';

type CurrencyDetectorProps = {
  videoElement: HTMLVideoElement | null;
  isActive: boolean;
  onDetectionStart?: () => void;
  onDetectionComplete?: (value: number | null) => void;
  onModelLoaded?: () => void;
  onError?: (error: Error) => void;
};

export interface CurrencyDetectorHandle {
  processFrame: () => Promise<number | null>;
}

const CurrencyDetector = forwardRef<CurrencyDetectorHandle, CurrencyDetectorProps>(({
  videoElement,
  isActive,
  onDetectionStart,
  onDetectionComplete,
  onModelLoaded,
  onError,
}, ref) => {
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoadProgress, setModelLoadProgress] = useState(0);
  const detectionInProgressRef = useRef(false);

  // Load model on component mount
  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        
        // Load TensorFlow.js backend
        await tf.ready();
        console.log('TensorFlow.js ready, backend:', tf.getBackend());
        
        // Load currency detection model
        const loadedModel = await loadCurrencyDetectionModel({
          onProgress: (progress) => {
            if (isMounted) {
              setModelLoadProgress(progress);
            }
          }
        });
        
        if (isMounted) {
          setModel(loadedModel);
          setIsModelLoading(false);
          onModelLoaded?.();
          console.log('Currency detection model loaded successfully');
        }
      } catch (error) {
        console.error('Error loading model:', error);
        if (isMounted) {
          setIsModelLoading(false);
          onError?.(error instanceof Error ? error : new Error('Failed to load model'));
        }
      }
    };

    loadModel();

    return () => {
      isMounted = false;
    };
  }, [onModelLoaded, onError]);

  // Function to process a frame and detect currency
  const processFrame = async () => {
    if (!videoElement || !model || !isActive || detectionInProgressRef.current) {
      console.log('Cannot process frame:', { 
        hasVideo: !!videoElement, 
        hasModel: !!model, 
        isActive, 
        inProgress: detectionInProgressRef.current 
      });
      return null;
    }

    try {
      detectionInProgressRef.current = true;
      onDetectionStart?.();
      console.log('Starting currency detection process');

      // Detect currency in the current video frame
      const detectedValue = await detectCurrency(model, videoElement);

      // Get currency details
      const currencyDetails = getCurrencyById(detectedValue);
      console.log('Detected currency:', currencyDetails);

      onDetectionComplete?.(detectedValue);
      detectionInProgressRef.current = false;
      return detectedValue;
    } catch (error) {
      console.error('Error during currency detection:', error);
      onError?.(error instanceof Error ? error : new Error('Detection failed'));
      detectionInProgressRef.current = false;
      return null;
    }
  };

  // Expose the processFrame method to parent components
  useImperativeHandle(ref, () => ({
    processFrame
  }));

  // This component doesn't render anything visible
  return null;
});

export default CurrencyDetector;
