
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import VoiceFeedback from './VoiceFeedback';
import { appMessages } from '@/utils/currencyData';

type AccessibilityInstructionsProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AccessibilityInstructions: React.FC<AccessibilityInstructionsProps> = ({
  isOpen,
  onClose,
}) => {
  // Auto-read instructions when opened
  const instructionsText = `
    Welcome to the Currency Detector app for visually impaired users.
    This app helps you identify Indian currency notes using your phone's camera.
    
    Gestures:
    Double tap anywhere on the screen to detect currency.
    Swipe right to hear these instructions again.
    Swipe left to access settings.
    
    To use:
    1. Position a currency note within the camera frame.
    2. Hold the phone steady.
    3. Double tap to start detection.
    4. Listen for the announcement of the detected denomination.
    
    For best results, ensure good lighting and a clear view of the currency note.
  `;

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <VoiceFeedback 
        text={instructionsText} 
        play={isOpen} 
        rate={0.95}
      />
      
      <div className="glass max-w-md w-full mx-4 rounded-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between bg-primary/10 px-6 py-4">
          <h2 className="text-xl font-semibold">How to Use This App</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={onClose}
            aria-label="Close instructions"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-foreground/80">
            This app helps you identify Indian currency notes using your phone's camera.
          </p>
          
          <div className="space-y-2">
            <h3 className="font-medium">Gestures:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Double tap anywhere to detect currency</li>
              <li>Swipe right for instructions</li>
              <li>Swipe left for settings</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Steps to Use:</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Position a currency note within the camera frame</li>
              <li>Hold the phone steady</li>
              <li>Double tap to start detection</li>
              <li>Listen for the announcement of the detected denomination</li>
            </ol>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-blue-800">
              For best results, ensure good lighting and a clear view of the currency note.
            </p>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-muted/50 flex justify-end">
          <Button onClick={onClose} className="w-full">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityInstructions;
