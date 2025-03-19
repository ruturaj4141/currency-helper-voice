
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
  const lastDetectionResultRef = useRef<number | null>(null);

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

      // Perform multiple detection attempts to improve accuracy
      let detectionResults: number[] = [];
      const detectionAttempts = 3;
      
      // Get multiple samples for better accuracy
      for (let i = 0; i < detectionAttempts; i++) {
        // Small delay between samples
        if (i > 0) await new Promise(resolve => setTimeout(resolve, 200));
        const result = await detectCurrency(model, videoElement);
        detectionResults.push(result);
      }
      
      // Find the most common result (simple mode calculation)
      const resultCounts = new Map<number, number>();
      let maxCount = 0;
      let finalResult = 0;
      
      detectionResults.forEach(result => {
        const count = (resultCounts.get(result) || 0) + 1;
        resultCounts.set(result, count);
        if (count > maxCount) {
          maxCount = count;
          finalResult = result;
        }
      });
      
      // If we have a previous result and the new result is not confident (not majority),
      // stick with the previous result for stability
      if (maxCount <= detectionAttempts / 2 && lastDetectionResultRef.current !== null) {
        finalResult = lastDetectionResultRef.current;
      }
      
      // Store last detection result for consistency
      lastDetectionResultRef.current = finalResult;

      // Get currency details
      const currencyDetails = getCurrencyById(finalResult);
      console.log('Detected currency:', currencyDetails);

      onDetectionComplete?.(finalResult);
      detectionInProgressRef.current = false;
      return finalResult;
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
