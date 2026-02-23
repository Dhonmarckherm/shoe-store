import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, X, RefreshCw, ScanFace, Video } from 'lucide-react';
import Button from './Button';

const MODEL_URL = '/models';

const FaceRecognition = ({
  onFaceDetected,
  mode = 'register', // 'register' or 'login'
  onCancel,
  isLoading = false,
  onNoFaceDetected // Optional callback when no face is detected
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectedFaceRef = useRef(null); // Ref for real-time face status
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [error, setError] = useState(null);
  const [detectedFace, setDetectedFace] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [noFaceTimeout, setNoFaceTimeout] = useState(false);
  const [faceLostCounter, setFaceLostCounter] = useState(0);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setError(null);
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
      } catch (err) {
        console.error('Error loading face-api models:', err);
        setError('Failed to load face recognition models. Please refresh the page.');
      }
    };

    loadModels();
  }, []);

  // Start video stream
  const startVideo = useCallback(async () => {
    try {
      setError(null);
      console.log('Requesting camera access...');
      
      // Stop any existing stream first
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      console.log('Camera stream obtained:', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Force play the video
        try {
          await videoRef.current.play();
          console.log('Video playing');
        } catch (playErr) {
          console.error('Error playing video:', playErr);
        }
      } else {
        console.error('Video ref is null, retrying in 100ms...');
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error('Delayed play error:', e));
          }
        }, 100);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      
      let errorMessage = 'Unable to access camera. ';
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Camera permission was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found. Please connect a camera device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += err.message || 'Please check your camera permissions.';
      }
      
      setError(errorMessage);
    }
  }, []);

  // Start video when models are loaded
  useEffect(() => {
    if (isModelLoaded) {
      startVideo();
    }
  }, [isModelLoaded]);

  // Also try to start video when component mounts if models already loaded
  useEffect(() => {
    if (isModelLoaded && !isVideoReady && !error) {
      const timer = setTimeout(() => {
        console.log('Auto-starting video...');
        startVideo();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isModelLoaded]);

  // Retry video start if there was an error but permissions might have changed
  useEffect(() => {
    if (error && error.includes('denied')) {
      const checkPermission = async () => {
        try {
          const result = await navigator.permissions.query({ name: 'camera' });
          if (result.state === 'granted') {
            console.log('Permission granted, retrying camera...');
            setError(null);
            startVideo();
          }
        } catch (e) {
          // permissions API not supported, ignore
        }
      };
      
      const interval = setInterval(checkPermission, 2000);
      return () => clearInterval(interval);
    }
  }, [error, startVideo]);

  // Handle video metadata loaded
  const handleVideoPlay = () => {
    console.log('Video metadata loaded, video ready');
    console.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
    setIsVideoReady(true);
    setError(null); // Clear any errors when video is working
  };

  // Handle video playing event
  const handleVideoPlaying = () => {
    console.log('Video is now playing');
    setIsVideoReady(true);
    setError(null);
  };

  // Handle video can play
  const handleCanPlay = () => {
    console.log('Video can play');
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  };

  // Detect face from video
  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Match canvas dimensions to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // Clear canvas and draw detections
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

    if (detections.length > 0) {
      setDetectedFace(detections[0].descriptor);
      detectedFaceRef.current = detections[0].descriptor; // Update ref for real-time access
      setFaceLostCounter(0); // Reset counter when face is detected
      if (noFaceTimeout) {
        setNoFaceTimeout(false); // Clear timeout state when face is found
      }
      return detections[0].descriptor;
    }

    // No face detected - increment counter
    setFaceLostCounter((prev) => {
      const newCount = prev + 1;
      // Show alert after 3 seconds (30 checks at 100ms interval)
      if (newCount >= 30 && !noFaceTimeout) {
        setNoFaceTimeout(true);
        if (onNoFaceDetected) {
          onNoFaceDetected();
        }
      }
      return newCount;
    });
    
    setDetectedFace(null);
    detectedFaceRef.current = null; // Clear ref when no face
    return null;
  };

  // Continuous face detection
  useEffect(() => {
    if (!isVideoReady) return;

    const interval = setInterval(async () => {
      await detectFace();
    }, 100);

    return () => clearInterval(interval);
  }, [isVideoReady]);

  // Capture face with countdown
  const handleCapture = () => {
    // Initial check using ref for real-time status
    if (!detectedFaceRef.current) {
      setError('No face detected. Please position your face in the frame.');
      return;
    }

    setCountdown(3);

    // Monitor face during countdown
    const faceMonitorInterval = setInterval(() => {
      if (!detectedFaceRef.current && countdown > 0) {
        // Face lost during countdown - cancel
        clearInterval(faceMonitorInterval);
        setCountdown(0);
        setError('Face was lost. Please keep your face visible and try again.');
      }
    }, 200);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          clearInterval(faceMonitorInterval);
          // CRITICAL: Final real-time check using ref right before submission
          console.log('Final face check - Face detected:', !!detectedFaceRef.current);
          if (!detectedFaceRef.current) {
            setError('Face was lost during capture. Please position your face and try again.');
            setCountdown(0);
            return 0;
          }
          // Capture face descriptor
          const faceDescriptor = Array.from(detectedFaceRef.current);
          console.log('Submitting face descriptor for authentication:', faceDescriptor.slice(0, 5), '...');
          onFaceDetected(faceDescriptor);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl">
        <div className="text-red-600 dark:text-red-400 text-center mb-4">
          {error}
        </div>
        <div className="flex gap-3">
          <Button onClick={startVideo} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Camera
          </Button>
          {onCancel && (
            <Button onClick={onCancel} variant="ghost">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!isModelLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-secondary-600 dark:text-secondary-400">
          Loading face recognition models...
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Video Container */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        <video
          ref={videoRef}
          onLoadedMetadata={handleVideoPlay}
          onCanPlay={handleCanPlay}
          onPlaying={handleVideoPlaying}
          onError={(e) => console.error('Video error:', e)}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover transform scale-x-[-1]"
          style={{ minWidth: '100%', minHeight: '100%', display: isVideoReady ? 'block' : 'none' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]"
          style={{ display: isVideoReady ? 'block' : 'none' }}
        />
        
        {/* Start Camera Overlay - shown when video is not ready */}
        {!isVideoReady && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary-900/90">
            <ScanFace className="w-16 h-16 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Camera Access Required
            </h3>
            <p className="text-secondary-300 text-sm mb-6 text-center px-4">
              Please allow camera access to use face recognition
            </p>
            <Button onClick={startVideo} size="lg">
              <Camera className="w-5 h-5 mr-2" />
              Start Camera
            </Button>
          </div>
        )}
        
        {/* Face Detection Guide - only show when video is ready */}
        {isVideoReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-48 h-64 border-2 border-dashed rounded-full transition-colors ${
              detectedFace ? 'border-green-400' : 'border-white/50'
            }`}>
              {detectedFace && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                  Face Detected
                </div>
              )}
            </div>
          </div>
        )}

        {/* Countdown Overlay */}
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-6xl font-bold text-white animate-pulse">
              {countdown}
            </div>
          </div>
        )}
      </div>

      {/* Controls - only show when video is ready */}
      {isVideoReady && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={handleCapture}
            disabled={!detectedFace || countdown > 0 || isLoading}
            isLoading={isLoading}
            size="lg"
            className="w-full sm:w-auto"
          >
            <ScanFace className="w-5 h-5 mr-2" />
            {mode === 'register' ? 'Register Face' : 'Login with Face'}
          </Button>
          
          {onCancel && (
            <Button onClick={onCancel} variant="ghost" size="lg">
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      )}

      {/* Instructions - only show when video is ready */}
      {isVideoReady && (
        <div className="mt-4 text-center text-sm text-secondary-500 dark:text-secondary-400">
          <p>Position your face within the oval guide</p>
          <p className="mt-1">Ensure good lighting and remove glasses if possible</p>
        </div>
      )}
      
      {/* Skip option when camera not started */}
      {!isVideoReady && onCancel && (
        <div className="mt-6 text-center">
          <Button onClick={onCancel} variant="ghost">
            Skip for now
          </Button>
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;
