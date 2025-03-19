
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
  const detectionHistoryRef = useRef<Map<number, number>>(new Map()); // Store detection history for stability

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
      const detectionAttempts = 5; // Increased from 3 to 5 for better accuracy
      
      // Get multiple samples for better accuracy
      for (let i = 0; i < detectionAttempts; i++) {
        // Small delay between samples
        if (i > 0) await new Promise(resolve => setTimeout(resolve, 150));
        const result = await detectCurrency(model, videoElement);
        detectionResults.push(result);
        console.log(`Detection attempt ${i+1}: ${result} rupees`);
      }
      
      // Find the most common result (mode calculation)
      const resultCounts = new Map<number, number>();
      
      detectionResults.forEach(result => {
        const count = (resultCounts.get(result) || 0) + 1;
        resultCounts.set(result, count);
      });
      
      // Add weight to historical detections for stability between frames
      if (lastDetectionResultRef.current !== null) {
        // Add a historical bias to stabilize detections over time
        // This helps prevent rapid fluctuations between consecutive detections
        detectionHistoryRef.current.forEach((count, value) => {
          // Decay historical values (reduce their influence over time)
          const newCount = Math.max(1, Math.floor(count * 0.7));
          detectionHistoryRef.current.set(value, newCount);
          
          // Apply historical weight to current detection
          const currentCount = resultCounts.get(value) || 0;
          resultCounts.set(value, currentCount + Math.floor(newCount * 0.3));
        });
      }
      
      // Find the result with the highest count
      let maxCount = 0;
      let finalResult = 0;
      
      resultCounts.forEach((count, result) => {
        console.log(`Currency ${result} rupees has count: ${count}`);
        if (count > maxCount) {
          maxCount = count;
          finalResult = result;
        }
      });
      
      console.log(`Most frequent detection: ${finalResult} rupees with count ${maxCount}`);
      
      // Update detection history for next iteration
      const currentHistoryCount = detectionHistoryRef.current.get(finalResult) || 0;
      detectionHistoryRef.current.set(finalResult, currentHistoryCount + 2);
      
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
