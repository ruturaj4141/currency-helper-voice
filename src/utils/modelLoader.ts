
import * as tf from '@tensorflow/tfjs';

// This is a utility for loading the TensorFlow.js model for currency detection
// In a production app, this would load a trained model from a server or local storage

export type LoadModelOptions = {
  onProgress?: (progress: number) => void;
};

export async function loadCurrencyDetectionModel(options?: LoadModelOptions): Promise<tf.GraphModel> {
  try {
    // Simulate model loading with progress updates
    if (options?.onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        options.onProgress(i);
      }
    }
    
    // Console warning to indicate this is a demo
    console.warn('Using placeholder model for demo purposes. This would be replaced with a real currency detection model.');
    
    // Create a simple model that returns demo results for testing
    const input = tf.input({shape: [224, 224, 3]});
    const output = tf.layers.dense({units: 7, activation: 'softmax'}).apply(input);
    const model = tf.model({inputs: input, outputs: output as tf.SymbolicTensor});
    
    return model as unknown as tf.GraphModel;
  } catch (error) {
    console.error('Error loading currency detection model:', error);
    throw error;
  }
}

// This simulates a more consistent currency detection process
// In a real app, this would use computer vision and a trained model
export async function detectCurrency(model: tf.GraphModel, imageElement: HTMLImageElement | HTMLVideoElement): Promise<number> {
  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get pixel data from the video frame to simulate analysis
    // This helps make our demo more realistic by analyzing the actual image
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create canvas context');
    }
    
    // Draw the current video frame to the canvas
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    
    // Get the average color of the image to simulate detection
    // In a real model, this would be replaced with proper image analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Calculate average RGB values of the image
    let totalR = 0, totalG = 0, totalB = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
    }
    
    const pixelCount = data.length / 4;
    const avgR = totalR / pixelCount;
    const avgG = totalG / pixelCount;
    const avgB = totalB / pixelCount;
    
    console.log('Image analysis:', { avgR, avgG, avgB });
    
    // Calculate color relationships for more robust detection
    const redGreenRatio = avgR / avgG;
    const redBlueRatio = avgR / avgB;
    const greenBlueRatio = avgG / avgB;
    
    console.log('Color ratios:', { redGreenRatio, redBlueRatio, greenBlueRatio });
    
    // Completely revised currency detection algorithm with more specific rules
    
    // 50 rupee notes are distinctly fluorescent blue
    if (avgB > 120 && avgB > avgR * 1.2 && avgB > avgG * 1.2) {
      console.log('Detected as 50 rupee (fluorescent blue)');
      return 50;
    }
    
    // 2000 rupee notes are distinctly magenta (high red and blue, lower green)
    else if (avgR > 140 && avgB > 110 && avgR / avgG > 1.2 && avgB / avgG > 1.1) {
      console.log('Detected as 2000 rupee (magenta)');
      return 2000;
    }
    
    // 200 rupee notes are bright yellow (high red and green, low blue)
    else if (avgR > 140 && avgG > 140 && avgB < 100 && redBlueRatio > 1.5 && greenBlueRatio > 1.5) {
      console.log('Detected as 200 rupee (bright yellow)');
      return 200;
    }
    
    // 20 rupee notes are greenish-yellow (high green, medium red, low blue)
    else if (avgG > avgR * 1.1 && avgG > avgB * 1.5 && avgG > 120) {
      console.log('Detected as 20 rupee (greenish-yellow)');
      return 20;
    }
    
    // 500 rupee notes are stone grey (balanced RGB values)
    else if (Math.abs(avgR - avgG) < 15 && Math.abs(avgR - avgB) < 15 && Math.abs(avgG - avgB) < 15 && avgR > 90 && avgR < 160) {
      console.log('Detected as 500 rupee (stone grey)');
      return 500;
    }
    
    // 10 rupee notes are chocolate brown (high red, medium green, low blue)
    else if (avgR > 100 && avgR > avgB * 1.3 && redGreenRatio > 1.1 && redGreenRatio < 1.5 && greenBlueRatio > 1.2) {
      console.log('Detected as 10 rupee (chocolate brown)');
      return 10;
    }
    
    // 100 rupee notes are lavender/purple (elevated red and blue compared to green)
    else if (avgR > 110 && avgB > avgG * 1.1 && avgR > avgG * 1.1) {
      console.log('Detected as 100 rupee (lavender/purple)');
      return 100;
    }
    
    // Enhanced fallback logic with better confidence scoring
    else {
      console.log('Using fallback detection logic');
      
      // Calculate confidence scores for each note type based on color similarity
      const scores = new Map<number, number>();
      
      // Score for 50 rupee (blue)
      scores.set(50, avgB / (avgR + avgG) * 100);
      
      // Score for 2000 rupee (magenta)
      scores.set(2000, ((avgR + avgB) / (2 * avgG)) * 80);
      
      // Score for 200 rupee (yellow)
      scores.set(200, ((avgR + avgG) / (2 * avgB)) * 90);
      
      // Score for 20 rupee (greenish-yellow)
      scores.set(20, (avgG / (avgR + avgB)) * 100);
      
      // Score for 500 rupee (grey)
      const greyness = 100 - (Math.abs(avgR - avgG) + Math.abs(avgR - avgB) + Math.abs(avgG - avgB));
      scores.set(500, greyness);
      
      // Score for 10 rupee (brown)
      scores.set(10, (avgR / avgB) * (avgG / avgB) * 50);
      
      // Score for 100 rupee (lavender)
      scores.set(100, ((avgR + avgB) / (2 * avgG)) * 70);
      
      console.log('Confidence scores:', Object.fromEntries(scores));
      
      // Find the note with the highest confidence score
      let highestScore = 0;
      let bestMatch = 100; // Default fallback
      
      scores.forEach((score, note) => {
        if (score > highestScore) {
          highestScore = score;
          bestMatch = note;
        }
      });
      
      console.log(`Fallback detection result: ${bestMatch} rupee note with confidence score ${highestScore}`);
      return bestMatch;
    }
  } catch (error) {
    console.error('Error during currency detection:', error);
    throw error;
  }
}
