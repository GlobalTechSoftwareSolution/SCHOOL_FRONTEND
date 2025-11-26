'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import {
  BrowserMultiFormatReader,
  HybridBinarizer,
  RGBLuminanceSource,
  BinaryBitmap
} from "@zxing/library";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface BackendResponse {
  status: 'success' | 'fail' | 'error';
  message?: string;
  user?: string; // backend returns 'user' as name in your code
  email?: string;
  role?: string;
  method_used?: string;
  debug_info?: any;
  // Fields that might be returned by backend
  attendance_status?: 'checkin' | 'checkout' | 'completed';
  checkin_time?: string;
  checkout_time?: string;
  has_checkin?: boolean;
  date?: string;
  // Add generic index signature for any other fields
  [key: string]: any;
}

const AttendanceSystem = () => {
  const [attendanceMode, setAttendanceMode] = useState<'face' | 'barcode' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState(''); // NEW: role
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [scannedEmail, setScannedEmail] = useState<string | null>(null); // show scanned email before sending
  const [checkinTime, setCheckinTime] = useState<string | null>(null); // Store check-in time
  const [checkoutTime, setCheckoutTime] = useState<string | null>(null); // Store check-out time
  
  // Add state to manually track check-in status
  const [userCheckedIn, setUserCheckedIn] = useState<boolean>(false);
  const [lastUserEmail, setLastUserEmail] = useState<string | null>(null);

  const webcamRef = useRef<Webcam | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceModelRef = useRef<blazeface.BlazeFaceModel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current location
  const getCurrentLocation = useCallback((): Promise<{ latitude: number; longitude: number }> => {
    console.log('[Attendance] getCurrentLocation called');
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.error('[Attendance] Geolocation is not supported in this browser');
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(
            '[Attendance] Location received',
            position.coords.latitude,
            position.coords.longitude
          );
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('[Attendance] Error getting current location', error);
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
    try {
      await tf.ready();
      const model = await blazeface.load();
      faceModelRef.current = model;
      console.log('[Attendance] BlazeFace model loaded successfully');
    } catch (error) {
      console.error('[Attendance] Error loading BlazeFace model:', error);
      setMessage('Error initializing face detection');
    }
  }, []);

  useEffect(() => {
    console.log('[Attendance] AttendanceSystem component mounted');
    initializeFaceDetection();

    // Try to get location initially
    getCurrentLocation()
      .then(loc => {
        console.log('[Attendance] Initial location obtained', loc);
        setCurrentLocation(loc);
      })
      .catch(err => {
        console.warn('[Attendance] Failed to get initial location:', err);
        setMessage('Location services unavailable. Some features may be limited.');
      });

    return () => {
      console.log('[Attendance] AttendanceSystem component unmounting, cleaning up resources');
      // cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => {
          console.log('[Attendance] Stopping media track');
          t.stop();
        });
        streamRef.current = null;
      }
    };
  }, [initializeFaceDetection, getCurrentLocation]);

  // Reset user tracking
  const resetUserTracking = () => {
    setUserCheckedIn(false);
    setLastUserEmail(null);
  };

  // Start camera for face recognition
  const startFaceRecognition = async () => {
    console.log('[Attendance] Starting face recognition process');
    resetUserTracking(); // Reset tracking for new session
    
    try {
      setIsLoading(true);
      setMessage('');
      setUserName('');
      setUserRole('');
      setScannedEmail(null);
      setCheckinTime(null);
      setCheckoutTime(null);

      const location = await getCurrentLocation();
      console.log('[Attendance] Location acquired for face recognition', location);
      setCurrentLocation(location);

      // Start webcam automatically via Webcam component; just set mode and active
      setAttendanceMode('face');
      setIsCameraActive(true);
      console.log('[Attendance] Face recognition mode activated, camera ready');
    } catch (error) {
      console.error('[Attendance] Error starting face recognition:', error);
      setMessage('Error accessing location or camera');
    } finally {
      setIsLoading(false);
    }
  };

  // Start barcode scanner (file upload mode)
  const startBarcodeScanner = async () => {
    console.log('[Attendance] Starting barcode scanner process');
    resetUserTracking(); // Reset tracking for new session
    
    try {
      setIsLoading(true);
      setMessage('');
      setUserName('');
      setUserRole('');
      setScannedEmail(null);
      setCheckinTime(null);
      setCheckoutTime(null);

      const location = await getCurrentLocation();
      console.log('[Attendance] Location acquired for barcode scanning', location);
      setCurrentLocation(location);

      setAttendanceMode('barcode');
      setIsCameraActive(false); // No camera needed for file upload
      console.log('[Attendance] Barcode scanning mode activated, file upload ready');
    } catch (error) {
      console.error('[Attendance] Error preparing barcode scanner:', error);
      setMessage('Error preparing barcode scanner');
    } finally {
      setIsLoading(false);
    }
  };

  // Decode image using ZXing library (hard decoding)
  const decodeImageHard = async (img: HTMLImageElement) => {
    console.log('[Attendance] Starting hard decoding process for image', img.width, img.height);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log('[Attendance] Failed to get 2D context for canvas');
      return null;
    }

    // Draw & preprocess
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const pixelData = ctx.getImageData(0, 0, img.width, img.height);

    const luminanceSource = new RGBLuminanceSource(
      pixelData.data,
      img.width,
      img.height
    );

    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

    const reader = new BrowserMultiFormatReader();

    try {
      const decoded = reader.decodeBitmap(binaryBitmap);
      console.log('[Attendance] Hard decoding successful', decoded.getText());
      return decoded.getText();
    } catch (error) {
      console.log('[Attendance] Hard decoding failed', error);
      return null;
    }
  };

  // Handle file upload for barcode scanning
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[Attendance] File upload initiated');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('[Attendance] No file selected for upload');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setScannedEmail(null);
    setCheckinTime(null);
    setCheckoutTime(null);

    const fileReader = new FileReader();

    fileReader.onload = async () => {
      console.log('[Attendance] File read completed, processing image');
      const img = new Image();
      img.src = fileReader.result as string;

      img.onload = async () => {
        console.log('[Attendance] Image loaded, starting barcode detection', img.width, img.height);
        // First try normal decoding
        const reader = new BrowserMultiFormatReader();

        try {
          const normal = await reader.decodeFromImageElement(img);
          const decodedText = normal.getText();
          console.log('[Attendance] Normal decoding successful', decodedText);
          setScannedEmail(decodedText);
          
          // Process attendance
          setTimeout(async () => {
            let loc = currentLocation;
            if (!loc) {
              try {
                console.log('[Attendance] Location not available, requesting current location');
                loc = await getCurrentLocation();
                setCurrentLocation(loc);
              } catch (e) {
                console.error('[Attendance] Failed to get location for barcode attendance', e);
                setMessage('Location required to mark attendance');
                setIsLoading(false);
                return;
              }
            }
            await markAttendanceWithBarcode(decodedText, loc!);
          }, 600);
          return;
        } catch (error) {
          console.log('[Attendance] Normal scan failed, trying strong mode', error);
        }

        // Try strong decoding
        const strong = await decodeImageHard(img);
        if (strong) {
          console.log('[Attendance] Strong decoding successful', strong);
          setScannedEmail(strong);
          
          // Process attendance
          setTimeout(async () => {
            let loc = currentLocation;
            if (!loc) {
              try {
                console.log('[Attendance] Location not available, requesting current location');
                loc = await getCurrentLocation();
                setCurrentLocation(loc);
              } catch (e) {
                console.error('[Attendance] Failed to get location for barcode attendance', e);
                setMessage('Location required to mark attendance');
                setIsLoading(false);
                return;
              }
            }
            await markAttendanceWithBarcode(strong, loc!);
          }, 600);
        } else {
          console.log('[Attendance] Barcode not detected in image');
          setMessage("❌ Barcode not detected (image too blurry)");
          setIsLoading(false);
        }
      };
    };

    fileReader.readAsDataURL(file);
  };

  // Trigger file upload
  const triggerFileUpload = () => {
    console.log('[Attendance] Triggering file upload dialog');
    fileInputRef.current?.click();
  };

  // Capture image for face recognition
  const captureAndDetectFace = useCallback(async () => {
    console.log('[Attendance] Face capture and detection initiated');
    if (!webcamRef.current || !faceModelRef.current || !currentLocation) {
      console.warn('[Attendance] Face detection prerequisites missing', {
        hasWebcam: !!webcamRef.current,
        hasModel: !!faceModelRef.current,
        hasLocation: !!currentLocation,
      });
      setMessage('Camera or location not ready');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      setUserName('');
      setUserRole('');
      setScannedEmail(null);
      setCheckinTime(null);
      setCheckoutTime(null);

      const imageSrc = webcamRef.current.getScreenshot();
      console.log('[Attendance] Screenshot captured', !!imageSrc);

      if (!imageSrc) {
        console.warn('[Attendance] Webcam failed to capture screenshot');
        setMessage('Failed to capture image. Try again.');
        return;
      }

      // convert base64 to Image to run local detection if needed
      const img = new Image();
      img.src = imageSrc;
      await new Promise(resolve => {
        img.onload = resolve;
        console.log('[Attendance] Image loaded for face detection');
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('[Attendance] Failed to get 2D context for face detection canvas');
        setMessage('Error processing image');
        return;
      }
      ctx.drawImage(img, 0, 0);

      // run a local face detection pass to provide faster feedback (optional)
      const predictions = await faceModelRef.current!.estimateFaces(canvas, false);
      console.log('[Attendance] Face detection predictions count', predictions ? predictions.length : 0);
      if (!predictions || predictions.length === 0) {
        setMessage('No face detected. Please position your face clearly.');
        return;
      }

      // Convert base64 to blob and send to backend as 'image' (backend expects request.FILES.get('image') or 'file')
      console.log('[Attendance] Face detected locally, sending to backend for recognition');
      await markAttendanceWithFace(imageSrc, currentLocation);
    } catch (error) {
      console.error('[Attendance] Error during face capture and detection:', error);
      setMessage('Error processing face image');
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation]);

  // Utility: dataURL -> Blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    console.log('[Attendance] Converting dataURL to Blob');
    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    console.log('[Attendance] Blob conversion completed');
    return new Blob([u8arr], { type: mime });
  };

  // Mark attendance with face (send 'image' field)
  const markAttendanceWithFace = async (imageData: string, location: { latitude: number; longitude: number }) => {
    console.log('[Attendance] Marking attendance with face recognition', location);
    try {
      setIsLoading(true);
      setMessage('Recognizing face...');
      setUserName('');
      setUserRole('');

      const formData = new FormData();
      const blob = dataURLtoBlob(imageData);
      // backend checks request.FILES.get('image') or request.FILES.get('file')
      formData.append('image', blob, 'face.jpg');
      // latitude and longitude expected
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
      // Add flag to indicate this is a face scan
      formData.append('method', 'face');
      // Add timestamp to help backend distinguish requests
      formData.append('timestamp', new Date().toISOString());
      // Add action type to help backend understand intent
      formData.append('action', 'attendance');
      
      // Add explicit check-in/check-out indicator based on local state
      if (lastUserEmail && userCheckedIn) {
        console.log('[Attendance] User has existing check-in, marking as checkout');
        formData.append('attendance_action', 'checkout');
        // For checkout, also send the current time
        formData.append('check_out_time', new Date().toISOString());
      } else {
        console.log('[Attendance] No existing check-in, marking as checkin');
        formData.append('attendance_action', 'checkin');
        // For checkin, also send the current time
        formData.append('check_in_time', new Date().toISOString());
      }
      
      // Also send the last user email to help backend identify the user
      // For first-time users, we'll need to get the email from the face recognition response
      if (lastUserEmail) {
        formData.append('user_email', lastUserEmail);
      }

      console.log('[Attendance] Sending face attendance request to backend with data:', {
        method: 'face',
        attendance_action: formData.get('attendance_action'),
        user_email: formData.get('user_email'),
        has_last_user_email: !!lastUserEmail,
        user_checked_in: userCheckedIn
      });

      console.log('[Attendance] Sending face attendance request to backend');
      // Use the correct endpoint for marking attendance - the attendance/mark endpoint
      const response = await fetch('https://school.globaltechsoftwaresolutions.cloud/api/attendance/mark/', {
        method: 'POST',
        body: formData
      });
      console.log('[Attendance] Face attendance response received', response.status);

      let result: BackendResponse | null = null;
      try {
        const jsonData = await response.json();
        result = jsonData as BackendResponse;
        console.log('[Attendance] Face attendance response parsed', result);
      } catch (e) {
        console.error('[Attendance] Failed to parse JSON response from face attendance', e);
        setMessage('Server returned non-JSON response');
        return;
      }

      if (result) {
        handleBackendResult(result);
      }
    } catch (error) {
      console.error('[Attendance] Error marking attendance with face:', error);
      setMessage('Error connecting to server');
    } finally {
      setIsLoading(false);
      // stop camera after attempt
      stopCamera();
    }
  };

  // Mark attendance with barcode (send 'barcode' field — backend treats barcode as email)
  const markAttendanceWithBarcode = async (barcodeData: string, location: { latitude: number; longitude: number }) => {
    console.log('[Attendance] Marking attendance with barcode', barcodeData, location);
    try {
      setIsLoading(true);
      setMessage('Processing barcode...');
      setUserName('');
      setUserRole('');

      const formData = new FormData();
      // backend expects 'barcode' (we send the scanned email as barcode)
      formData.append('barcode', barcodeData);
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
      // Add flag to indicate this is a barcode scan
      formData.append('method', 'barcode');
      // Add timestamp to help backend distinguish requests
      formData.append('timestamp', new Date().toISOString());
      // Add action type to help backend understand intent
      formData.append('action', 'attendance');
      
      // Add explicit check-in/check-out indicator based on local state
      if (lastUserEmail && userCheckedIn) {
        console.log('[Attendance] User has existing check-in, marking as checkout');
        formData.append('attendance_action', 'checkout');
        // For checkout, also send the current time
        formData.append('check_out_time', new Date().toISOString());
      } else {
        console.log('[Attendance] No existing check-in, marking as checkin');
        formData.append('attendance_action', 'checkin');
        // For checkin, also send the current time
        formData.append('check_in_time', new Date().toISOString());
      }
      
      // Also send the last user email to help backend identify the user
      // For barcode scans, the barcodeData is the email
      if (lastUserEmail) {
        formData.append('user_email', lastUserEmail);
      } else {
        // For first-time barcode scans, use the barcode data as the email
        formData.append('user_email', barcodeData);
      }

      console.log('[Attendance] Sending barcode attendance request to backend with data:', {
        method: 'barcode',
        barcode: barcodeData,
        attendance_action: formData.get('attendance_action'),
        user_email: formData.get('user_email'),
        has_last_user_email: !!lastUserEmail,
        user_checked_in: userCheckedIn
      });

      console.log('[Attendance] Sending barcode attendance request to backend');
      // Use the correct endpoint for marking attendance - the attendance/mark endpoint
      const response = await fetch('https://school.globaltechsoftwaresolutions.cloud/api/attendance/mark/', {
        method: 'POST',
        body: formData
      });
      console.log('[Attendance] Barcode attendance response received', response.status);

      let result: BackendResponse | null = null;
      try {
        const jsonData = await response.json();
        result = jsonData as BackendResponse;
        console.log('[Attendance] Barcode attendance response parsed', result);
      } catch (e) {
        console.error('[Attendance] Failed to parse JSON response from barcode attendance', e);
        setMessage('Server returned non-JSON response');
        return;
      }

      if (result) {
        handleBackendResult(result);
      }
    } catch (error) {
      console.error('[Attendance] Error marking attendance with barcode:', error);
      setMessage('Error connecting to server');
    } finally {
      setIsLoading(false);
      stopCamera();
    }
  };

  // Stop camera & scanning
  const stopCamera = () => {
    console.log('[Attendance] Stopping camera and cleaning up');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => {
        console.log('[Attendance] Stopping media track');
        t.stop();
      });
      streamRef.current = null;
    }
    
    setIsCameraActive(false);
    setAttendanceMode(null);
    console.log('[Attendance] Camera stopped and state reset');
  };

  // Handle backend response shape (your backend returns status/message/user/role)
  const handleBackendResult = (result: BackendResponse) => {
    console.log('[Attendance] Handling backend result', result);
    if (!result) {
      console.log('[Attendance] No response received from backend');
      setMessage('No response from server');
      return;
    }

    if (result.status === 'success') {
      const name = result.user || result.email || 'User';
      const email = result.email || '';
      const role = result.role || 'N/A';
      const attendanceStatus = result.attendance_status || null;
      const checkin = result.checkin_time || null;
      const checkout = result.checkout_time || null;
      
      // This logic determines what action we JUST performed based on our previous state
      let actionPerformed = 'checkin';
      if (email && lastUserEmail === email && userCheckedIn) {
        actionPerformed = 'checkout';
      }

      console.log('[Attendance] Success response received', { 
        name, 
        role, 
        attendanceStatus, 
        checkin, 
        checkout,
        email,
        actionPerformed,
        lastUserEmail,
        userCheckedIn
      });
      
      setUserName(name);
      setUserRole(role);
      setCheckinTime(checkin);
      setCheckoutTime(checkout);
      
      // Update local tracking state for next time
      // This logic prepares us for the NEXT action
      if (email) {
        if (lastUserEmail === email) {
          // Same user, toggle state for next action
          // If they were checked in, next action should be checkout
          // If they were checked out, next action should be checkin
          console.log(`[Attendance] Same user ${email}, toggling userCheckedIn from ${userCheckedIn} to ${!userCheckedIn}`);
          setUserCheckedIn(!userCheckedIn);
        } else {
          // New user, set initial state
          console.log(`[Attendance] New user ${email}, setting lastUserEmail and userCheckedIn to true`);
          setLastUserEmail(email);
          setUserCheckedIn(true); // Next action should be checkout
        }
      }
      
      // Customize message based on what action was performed
      if (actionPerformed === 'checkin') {
        if (checkin) {
          setMessage(`✅ Check-in marked for ${name} (${role}) at ${formatTime(checkin)}`);
        } else {
          setMessage(`✅ Check-in marked for ${name} (${role})`);
        }
      } else {
        if (checkout) {
          setMessage(`✅ Check-out marked for ${name} (${role}) at ${formatTime(checkout)}`);
        } else {
          setMessage(`✅ Check-out marked for ${name} (${role})`);
        }
      }

      // keep displayed for 3 seconds then reset
      setTimeout(() => {
        console.log('[Attendance] Clearing attendance result display');
        setMessage('');
        setUserName('');
        setUserRole('');
        setScannedEmail(null);
        setCheckinTime(null);
        setCheckoutTime(null);
      }, 3000);
    } else {
      // for 'fail' or 'error'
      const emsg = result.message || result.error || 'Attendance failed';
      console.error('[Attendance] Attendance failed', emsg, result);
      setMessage(`❌ ${emsg}`);
      // Optionally show debug info in console
      if (result.debug_info) console.debug('[Attendance] Debug info:', result.debug_info);
    }
  };

  // Format time for display
  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'Not recorded';
    
    try {
      // Assuming timeString is in ISO format
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 mt-14">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-10">School Attendance</h1>
            <p className="text-gray-600">Mark your attendance using face recognition or barcode scan</p>

            {currentLocation ? (
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Location Ready
              </div>
            ) : (
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
                </svg>
                Location not available
              </div>
            )}

            <div className="flex justify-start mb-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 mt-8 hover:text-gray-900 transition-colors duration-200 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            {/* Mode Selection */}
            {!isCameraActive && !attendanceMode && (
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Attendance Method</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <span className="text-sm text-gray-500 mt-1">Upload QR code or barcode image</span>
                  </button>
                </div>

              </div>
            )}

            {/* Camera View for Face Recognition */}
            {isCameraActive && attendanceMode === 'face' && (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Face Recognition</h2>

                <div className="relative bg-black rounded-lg overflow-hidden mb-4 mx-auto max-w-md">
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
                    onUserMedia={() => console.log('[Attendance] Webcam access granted')}
                    onUserMediaError={(error) => {
                      console.error('[Attendance] Webcam access error:', error);
                      setMessage('Webcam access error');
                    }}
                  />
                  <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-400 rounded-lg"></div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
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

                  <button
                    onClick={stopCamera}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Barcode Upload View */}
            {attendanceMode === 'barcode' && !isCameraActive && (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Barcode Image</h2>
                
                <div className="mb-6">
                  <div 
                    onClick={triggerFileUpload}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-600 mb-1">Click to upload barcode image</p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                  />
                </div>

                {/* Show scanned email when barcode detected */}
                {scannedEmail && (
                  <div className="mb-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm border border-blue-100">
                      Scanned: <span className="font-semibold ml-2">{scannedEmail}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
                >
                  Back to Options
                </button>
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
                    Welcome, <span className="font-bold">{userName}</span>
                    {userRole && <span className="ml-2 text-sm opacity-80">({userRole})</span>}
                  </div>
                )}
                
                {/* Display check-in and check-out times */}
                {(checkinTime || checkoutTime) && (
                  <div className="mt-3 text-sm">
                    <div className="flex justify-between max-w-xs mx-auto">
                      <span>Check-in:</span>
                      <span className="font-medium">{formatTime(checkinTime)}</span>
                    </div>
                    <div className="flex justify-between max-w-xs mx-auto mt-1">
                      <span>Check-out:</span>
                      <span className="font-medium">{formatTime(checkoutTime)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isLoading && !scannedEmail && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                  Processing...
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Ensure you have camera permissions enabled and good lighting for best results.</p>
            <p className="mt-2 text-xs text-gray-400">Scanned QR should contain the user email (backend expects the barcode value as email).</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AttendanceSystem;