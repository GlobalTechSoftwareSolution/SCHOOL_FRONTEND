'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import jsqr from 'jsqr';
import DashboardLayout from '../components/DashboardLayout';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface AttendanceResponse {
  success: boolean;
  message: string;
  user_name?: string;
  error?: string;
}

const AttendanceSystem = () => {
  const [attendanceMode, setAttendanceMode] = useState<'face' | 'barcode' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const barcodeVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceModelRef = useRef<blazeface.BlazeFaceModel | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Get current location
  const getCurrentLocation = useCallback((): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  // Initialize face detection model
  const initializeFaceDetection = useCallback(async () => {
    console.log('🤖 Initializing face detection model...');
    try {
      await tf.ready();
      console.log('⚡ TensorFlow.js is ready');
      
      console.log('📥 Loading BlazeFace model...');
      const model = await blazeface.load();
      faceModelRef.current = model;
      
      console.log('✅ BlazeFace model loaded successfully');
    } catch (error) {
      console.error('❌ Error loading face detection model:', error);
      setMessage('Error initializing face detection');
    }
  }, []);

  // Scan barcode from video stream
  const scanBarcode = useCallback(async () => {
    console.log('🔍 Scanning barcode...');
    
    if (!barcodeVideoRef.current || !currentLocation || attendanceMode !== 'barcode') {
      console.warn('⚠️ Missing required components for barcode scanning');
      return;
    }

    try {
      const video = barcodeVideoRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(scanBarcode);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsqr(imageData.data, imageData.width, imageData.height);

      if (code) {
        console.log('✅ Barcode detected:', code.data);
        // QR/Barcode detected
        const email = code.data;
        await markAttendanceWithBarcode(email, currentLocation);
      } else {
        animationFrameRef.current = requestAnimationFrame(scanBarcode);
      }

    } catch (error) {
      console.error('❌ Error scanning barcode:', error);
      animationFrameRef.current = requestAnimationFrame(scanBarcode);
    }
  }, [currentLocation, attendanceMode]);

  useEffect(() => {
    initializeFaceDetection();
    
    // Get initial location
    getCurrentLocation().then(setCurrentLocation).catch(console.error);

    // Add event listener for barcode scanning
    const handleScanBarcode = () => {
      if (attendanceMode === 'barcode' && isCameraActive) {
        scanBarcode();
      }
    };

    window.addEventListener('scanBarcode', handleScanBarcode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('scanBarcode', handleScanBarcode);
    };
  }, [initializeFaceDetection, getCurrentLocation, attendanceMode, isCameraActive, scanBarcode]);

  // Start camera for face recognition
  const startFaceRecognition = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setUserName('');
      
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      setAttendanceMode('face');
      setIsCameraActive(true);
      
    } catch (error) {
      console.error('Error starting face recognition:', error);
      setMessage('Error accessing camera');
    } finally {
      setIsLoading(false);
    }
  };

  // Start barcode scanner
  const startBarcodeScanner = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setUserName('');
      
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      setAttendanceMode('barcode');
      setIsCameraActive(true);
      
      // Start barcode scanning loop
      setTimeout(scanBarcode, 1000);
      
    } catch (error) {
      console.error('Error starting barcode scanner:', error);
      setMessage('Error accessing camera');
    } finally {
      setIsLoading(false);
    }
  };

  // Capture image for face recognition
  const captureAndDetectFace = useCallback(async () => {
    console.log('🔍 Starting face capture process...');
    
    if (!webcamRef.current || !faceModelRef.current || !currentLocation) {
      console.warn('⚠️ Missing required components for face capture');
      return;
    }

    try {
      console.log('📸 Capturing screenshot from webcam...');
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (!imageSrc) {
        console.error('❌ Failed to capture screenshot from webcam');
        setMessage('Failed to capture image. Please try again.');
        return;
      }
      
      console.log('✅ Screenshot captured successfully');

      // Convert base64 to image element
      console.log('🔄 Converting base64 to image element...');
      const img = new Image();
      img.src = imageSrc;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      console.log('✅ Image loaded successfully');

      // Create canvas for face detection
      console.log('🎨 Creating canvas for face detection...');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ Failed to get canvas context');
        setMessage('Error processing image');
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      console.log('✅ Canvas created and image drawn');

      // Perform face detection
      console.log('👁️ Detecting faces using BlazeFace...');
      const predictions = await faceModelRef.current.estimateFaces(canvas, false);
      console.log(`✅ Face detection complete. Found ${predictions.length} faces.`);
      
      if (predictions.length > 0) {
        // Face detected - send to backend for recognition
        console.log('✅ Face detected, sending to backend for recognition...');
        await markAttendanceWithFace(imageSrc, currentLocation);
      } else {
        console.warn('⚠️ No face detected in the captured image');
        setMessage('No face detected. Please position your face in the frame.');
      }

    } catch (error) {
      console.error('❌ Error in face detection:', error);
      setMessage('Error processing face detection');
    }
  }, [currentLocation]);

  // Mark attendance with face recognition
  const markAttendanceWithFace = async (imageData: string, location: { latitude: number; longitude: number }) => {
    console.log('📤 Marking attendance with face recognition...');
    
    try {
      setIsLoading(true);
      setMessage('Recognizing face...');
      console.log('📍 Location data:', location);

      const formData = new FormData();
      formData.append('face_image', dataURLtoBlob(imageData), 'face.jpg');
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
      
      console.log('📦 Form data prepared for submission');

      const response = await fetch('https://globaltechsoftwaresolutions.cloud/school-api/api/school_attendance/', {
        method: 'POST',
        body: formData,
      });
      
      console.log(`📡 Response received: ${response.status} ${response.statusText}`);

      const result: AttendanceResponse = await response.json();
      console.log('📥 Response data:', result);

      if (result.success) {
        console.log('✅ Attendance marked successfully');
        setMessage(`✅ ${result.message}`);
        setUserName(result.user_name || '');
        setIsCameraActive(false);
        
        // Reset after 3 seconds
        setTimeout(() => {
          setMessage('');
          setUserName('');
          setAttendanceMode(null);
        }, 3000);
      } else {
        console.warn('⚠️ Attendance marking failed:', result.error || 'Unknown error');
        setMessage(`❌ ${result.error || 'Face recognition failed'}`);
      }

    } catch (error) {
      console.error('❌ Error marking attendance with face:', error);
      setMessage('❌ Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark attendance with barcode
  const markAttendanceWithBarcode = async (barcodeData: string, location: { latitude: number; longitude: number }) => {
    console.log('📤 Marking attendance with barcode...');
    
    try {
      setIsLoading(true);
      setMessage('Processing barcode...');
      console.log('📍 Location data:', location);
      console.log('📱 Barcode data:', barcodeData);

      const formData = new FormData();
      formData.append('barcode', barcodeData);
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
      
      console.log('📦 Form data prepared for submission');

      const response = await fetch('https://globaltechsoftwaresolutions.cloud/school-api//api/school_attendance/', {
        method: 'POST',
        body: formData,
      });
      
      console.log(`📡 Response received: ${response.status} ${response.statusText}`);

      const result: AttendanceResponse = await response.json();
      console.log('📥 Response data:', result);

      if (result.success) {
        console.log('✅ Attendance marked successfully');
        setMessage(`✅ ${result.message}`);
        setUserName(result.user_name || '');
        setIsCameraActive(false);
        
        // Reset after 3 seconds
        setTimeout(() => {
          setMessage('');
          setUserName('');
          setAttendanceMode(null);
        }, 3000);
      } else {
        console.warn('⚠️ Attendance marking failed:', result.error || 'Invalid barcode');
        setMessage(`❌ ${result.error || 'Invalid barcode'}`);
      }

    } catch (error) {
      console.error('❌ Error marking attendance with barcode:', error);
      setMessage('❌ Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  // Manual barcode input (fallback)
  const handleManualBarcodeInput = async (email: string) => {
    console.log('📤 Marking attendance with manual input...');
    
    if (!email || !currentLocation) {
      console.warn('⚠️ Missing email or location for manual input');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Processing...');
      console.log('📍 Location data:', currentLocation);
      console.log('📧 Email data:', email);

      const formData = new FormData();
      formData.append('barcode', email);
      formData.append('latitude', currentLocation.latitude.toString());
      formData.append('longitude', currentLocation.longitude.toString());
      
      console.log('📦 Form data prepared for submission');

      const response = await fetch('https://globaltechsoftwaresolutions.cloud/school-api//api/school_attendance/', {
        method: 'POST',
        body: formData,
      });
      
      console.log(`📡 Response received: ${response.status} ${response.statusText}`);

      const result: AttendanceResponse = await response.json();
      console.log('📥 Response data:', result);

      if (result.success) {
        console.log('✅ Attendance marked successfully');
        setMessage(`✅ ${result.message}`);
        setUserName(result.user_name || '');
      } else {
        console.warn('⚠️ Attendance marking failed:', result.error || 'Invalid email');
        setMessage(`❌ ${result.error || 'Invalid email'}`);
      }

    } catch (error) {
      console.error('❌ Error with manual barcode input:', error);
      setMessage('❌ Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    console.log('⏹️ Stopping camera...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('🔇 Stopping track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (animationFrameRef.current) {
      console.log('⏹️ Cancelling animation frame');
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsCameraActive(false);
    setAttendanceMode(null);
    setMessage('');
    console.log('✅ Camera stopped');
  };

  // Utility function to convert data URL to blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    try {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)![1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (error) {
      console.error('Error converting data URL to blob:', error);
      // Return a default blob if conversion fails
      return new Blob([], { type: 'application/octet-stream' });
    }
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-14">
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-10">School Attendance</h1>
          <p className="text-gray-600">Mark your attendance using face recognition or barcode scan</p>
          
          {currentLocation && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Location Ready
            </div>
          )}
            {/* Back Button */}
          <div className="flex justify-start mb-4">
  <button
  type="button"
  onClick={() => window.history.back()}
  className="flex items-center text-gray-600 mt-8 hover:text-gray-900 transition-colors duration-200 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100"
>
  <svg
    className="w-5 h-5 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
  Back
</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Mode Selection */}
          {!isCameraActive && (
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Attendance Method</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Face Recognition Button */}
                <button
                  onClick={startFaceRecognition}
                  disabled={isLoading || !currentLocation}
                  className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-800">Face Recognition</span>
                  <span className="text-sm text-gray-500 mt-1">Use camera for face scan</span>
                </button>

                {/* Barcode Scanner Button */}
                <button
                  onClick={startBarcodeScanner}
                  disabled={isLoading || !currentLocation}
                  className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-800">Barcode Scan</span>
                  <span className="text-sm text-gray-500 mt-1">Scan QR code or barcode</span>
                </button>
              </div>

              {/* Manual Barcode Input */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Manual Barcode Input</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleManualBarcodeInput(e.currentTarget.value);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[type="email"]') as HTMLInputElement;
                      if (input) handleManualBarcodeInput(input.value);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Camera View */}
          {isCameraActive && (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {attendanceMode === 'face' ? 'Face Recognition' : 'Barcode Scanner'}
              </h2>

              <div className="relative bg-black rounded-lg overflow-hidden mb-4 mx-auto max-w-md">
                {attendanceMode === 'face' ? (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 640,
                      height: 480,
                      facingMode: 'user'
                    }}
                    className="w-full h-auto"
                    onUserMedia={() => console.log('📸 Webcam access granted')}
                    onUserMediaError={(error) => console.error('❌ Webcam access error:', error)}
                  />
                ) : (
                  <video
                    ref={barcodeVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-auto"
                    onPlay={() => console.log('▶️ Barcode scanner video playing')}
                  />
                )}
                
                {attendanceMode === 'face' && (
                  <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-400 rounded-lg"></div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                {attendanceMode === 'face' && (
                  <button
                    onClick={captureAndDetectFace}
                    disabled={isLoading}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                        Capture Face
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          {(message || userName) && (
            <div className={`mt-6 p-4 rounded-lg text-center ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : message.includes('❌')
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <div className="font-semibold text-lg">{message}</div>
              {userName && (
                <div className="mt-2 text-sm">
                  Welcome, <span className="font-bold">{userName}</span>!
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                Processing...
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Ensure you have camera permissions enabled and good lighting for best results.</p>
        </div>
      </div>

      {/* Initialize barcode scanner video */}
      {attendanceMode === 'barcode' && isCameraActive && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              navigator.mediaDevices.getUserMedia({ 
                video: { 
                  facingMode: 'environment',
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                } 
              }).then(stream => {
                console.log('📹 Barcode scanner stream initialized');
                const video = document.querySelector('video');
                if (video) {
                  video.srcObject = stream;
                  window.streamRef = stream;
                  // Start scanning
                  setTimeout(() => {
                    const scope = typeof window !== 'undefined' ? window : globalThis;
                    if (scope && scope.requestAnimationFrame) {
                      const scan = () => {
                        // This will trigger the scanBarcode function
                        window.dispatchEvent(new CustomEvent('scanBarcode'));
                        scope.requestAnimationFrame(scan);
                      };
                      scope.requestAnimationFrame(scan);
                    }
                  }, 1000);
                }
              }).catch(error => {
                console.error('❌ Error accessing barcode scanner:', error);
                const errorMessage = document.createElement('div');
                errorMessage.innerHTML = '<div class="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">Error accessing camera: ' + error.message + '</div>';
                document.querySelector('[data-barcode-error]')?.appendChild(errorMessage);
              });
            `
          }}
        />
      )}
    </div>
    <Footer />
    </>
  );
};

export default AttendanceSystem;