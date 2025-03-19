
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Loader2, Volume2, Info, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import CameraView from '@/components/CameraView';
import CurrencyDetector from '@/components/CurrencyDetector';
import VoiceFeedback from '@/components/VoiceFeedback';
import GestureHandler from '@/components/GestureHandler';
import AccessibilityInstructions from '@/components/AccessibilityInstructions';
import { appMessages, getCurrencyById } from '@/utils/currencyData';
import { cn } from '@/lib/utils';

// Add required dependencies
import '@tensorflow/tfjs';

const Index = () => {
  // State for camera and detection
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedValue, setDetectedValue] = useState<number | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Voice feedback state
  const [speechText, setSpeechText] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Helper function to create speech text for detected currency
  const createCurrencySpeechText = useCallback((value: number | null) => {
    if (value === null) {
      return appMessages.detectionFailed;
    }
    
    const currency = getCurrencyById(value);
    if (!currency) return `Unknown currency detected`;
    
    return `${currency.name} note detected. This is a ${currency.color} colored note with ${currency.description}.`;
  }, []);

  // Handle detection start
  const handleDetectionStart = useCallback(() => {
    setIsDetecting(true);
    setSpeechText(appMessages.detectionInProgress);
  }, []);

  // Handle detection completion
  const handleDetectionComplete = useCallback((value: number | null) => {
    setIsDetecting(false);
    setDetectedValue(value);
    
    const resultText = createCurrencySpeechText(value);
    setSpeechText(resultText);
    
    // Show toast for visual feedback
    if (value !== null) {
      const currency = getCurrencyById(value);
      if (currency) {
        toast({
          title: "Currency Detected",
          description: `${currency.name} (₹${currency.value})`,
          duration: 5000,
        });
      }
    } else {
      toast({
        title: "Detection Failed",
        description: "Could not identify the currency note. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [createCurrencySpeechText]);

  // Handle model loading complete
  const handleModelLoaded = useCallback(() => {
    setIsModelLoaded(true);
    setSpeechText(appMessages.welcome);
  }, []);

  // Handle error during model loading or detection
  const handleError = useCallback((error: Error) => {
    console.error('Error:', error);
    toast({
      title: "An error occurred",
      description: error.message,
      variant: "destructive",
      duration: 5000,
    });
    setSpeechText(`Error: ${error.message}`);
  }, []);

  // Handle camera stream
  const handleStream = useCallback((stream: MediaStream) => {
    setMediaStream(stream);
  }, []);

  // Handle video element reference
  const handleVideoElement = useCallback((element: HTMLVideoElement) => {
    setVideoElement(element);
  }, []);

  // Handle detection trigger (double tap)
  const handleDetectionTrigger = useCallback(() => {
    if (!isModelLoaded || isDetecting) return;
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    // Get the detector component and trigger detection
    const detector = document.getElementById('currency-detector') as any;
    if (detector && detector.processFrame) {
      detector.processFrame();
    }
  }, [isModelLoaded, isDetecting]);

  // Start camera when component mounts
  useEffect(() => {
    setIsCameraActive(true);
    
    // Show welcome speech after a short delay
    const timer = setTimeout(() => {
      setSpeechText(appMessages.welcome);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      
      // Clean up camera stream when component unmounts
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 py-4 bg-background border-b">
        <div className="container flex items-center justify-between">
          <h1 className="text-xl font-semibold">Currency Detector</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => setShowInstructions(true)}
              aria-label="Instructions"
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-6 px-4">
        <GestureHandler
          onDoubleTap={handleDetectionTrigger}
          onSwipeRight={() => setShowInstructions(true)}
          className="w-full h-full"
          disabled={!isModelLoaded}
        >
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Camera view */}
            <div className="camera-container w-full">
              <div className="camera-overlay w-full h-full relative">
                {isCameraActive ? (
                  <CameraView
                    onStream={handleStream}
                    onVideoElement={handleVideoElement}
                    isActive={isCameraActive}
                    className="w-full h-full rounded-2xl overflow-hidden"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-2xl">
                    <Button 
                      onClick={() => setIsCameraActive(true)}
                      className="flex items-center space-x-2"
                    >
                      <Camera className="h-5 w-5" />
                      <span>Start Camera</span>
                    </Button>
                  </div>
                )}

                {/* Camera guide frame */}
                <div className="camera-frame"></div>

                {/* Loading overlay */}
                {!isModelLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-10 rounded-2xl">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="text-white font-medium text-lg">Loading currency detection model...</p>
                    <p className="text-white/70 text-sm mt-2">Please wait</p>
                  </div>
                )}

                {/* Detection indicator */}
                {isDetecting && (
                  <div className="detection-indicator animate-pulse-light">
                    <p className="font-medium">Analyzing currency...</p>
                  </div>
                )}

                {/* Detection result overlay (only shown briefly) */}
                {detectedValue !== null && !isDetecting && (
                  <div className={cn(
                    "absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl",
                    "bg-white/70 backdrop-blur-md border border-white/30 shadow-lg",
                    "animate-scale-in"
                  )}>
                    <div className="flex items-center space-x-3">
                      {getCurrencyById(detectedValue) && (
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                          getCurrencyById(detectedValue)?.tailwindColor || "bg-primary"
                        )}>
                          ₹
                        </div>
                      )}
                      <div className="text-left">
                        <p className="text-sm text-foreground/70">Detected</p>
                        <p className="font-semibold">
                          {getCurrencyById(detectedValue)?.name || "Unknown Currency"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="glass p-4 rounded-xl max-w-md mx-auto text-center">
              <div className="flex items-center justify-center mb-2">
                <Volume2 className="h-5 w-5 mr-2 text-primary" />
                <p className="font-medium">Voice Guidance Active</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Double tap anywhere to detect currency. Swipe right for instructions.
              </p>
            </div>

            {/* Detection action button (for non-touch devices or as an alternative) */}
            <Button
              disabled={!isModelLoaded || isDetecting}
              onClick={handleDetectionTrigger}
              className="w-full max-w-md py-6 text-lg"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Detecting...
                </>
              ) : (
                "Detect Currency"
              )}
            </Button>
          </div>
        </GestureHandler>
      </main>

      {/* Currency detector (non-visual component) */}
      <CurrencyDetector
        videoElement={videoElement}
        isActive={isCameraActive && isModelLoaded}
        onDetectionStart={handleDetectionStart}
        onDetectionComplete={handleDetectionComplete}
        onModelLoaded={handleModelLoaded}
        onError={handleError}
      />

      {/* Voice feedback */}
      <VoiceFeedback
        text={speechText}
        onStart={() => setIsSpeaking(true)}
        onEnd={() => setIsSpeaking(false)}
        rate={0.95}
        pitch={1}
        lang="en-IN"
      />

      {/* Accessibility instructions modal */}
      <AccessibilityInstructions
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </div>
  );
};

export default Index;
