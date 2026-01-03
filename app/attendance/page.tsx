
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
import axios from 'axios';

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;


interface BackendResponse {
  status: 'success' | 'fail' | 'error' | 'Present' | string;
  message?: string;
  error?: string;
  id?: string | number;
  user?: string | { email?: string; role?: string; fullname?: string;[key: string]: unknown }; // backend returns 'user' as name or object
  user_email?: string;
  user_name?: string;
  user_full_name?: string;
  fullname?: string;
  email?: string;
  role?: string;
  user_role?: string;
  method_used?: string;
  debug_info?: unknown;
  // Fields that might be returned by backend
  attendance_status?: 'checkin' | 'checkout' | 'completed';
  check_in?: string;
  check_out?: string;
  checkin_time?: string;
  checkout_time?: string;
  has_checkin?: boolean;
  date?: string;
  // Face recognition specific fields
  face_recognition_used?: boolean;
  distance?: number;
  // Add generic index signature for any other fields
  [key: string]: unknown;
}

const AttendanceSystem = () => {
  const [attendanceMode, setAttendanceMode] = useState<'face' | 'barcode' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState(''); // NEW: role
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [scannedEmail, setScannedEmail] = useState<string | null>(null); // show scanned email before sending
  const [checkinTime, setCheckinTime] = useState<string | null>(null); // Store check-in time
  const [checkoutTime, setCheckoutTime] = useState<string | null>(null); // Store check-out time

  // Add state to manually track check-in status
  const [userCheckedIn, setUserCheckedIn] = useState<boolean>(false);


  // New state for barcode scanner mode
  const [barcodeScanMode, setBarcodeScanMode] = useState<'camera' | 'upload'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const webcamRef = useRef<Webcam | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceModelRef = useRef<blazeface.BlazeFaceModel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current location with retry and fallback
  const getCurrentLocation = useCallback((): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      const optionsHighAccuracy = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000 // Accept cached location up to 1 minute old
      };

      const optionsLowAccuracy = {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000 // Accept cached location up to 1 minute old
      };

      // First try high accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn("High accuracy location failed, trying low accuracy...", error);
          // If high accuracy fails, try low accuracy
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            },
            (errorLow) => {
              reject(errorLow);
            },
            optionsLowAccuracy
          );
        },
        optionsHighAccuracy
      );
    });
  }, []);

  // Initialize face detection model
  const initializeFaceDetection = useCallback(async () => {
    try {
      await tf.ready();
      const model = await blazeface.load();
      faceModelRef.current = model;
    } catch {
      setMessage('Error initializing face detection');
    }
  }, []);

  useEffect(() => {
    initializeFaceDetection();

    // Try to get location initially
    getCurrentLocation()
      .then(loc => {
        setCurrentLocation(loc);
      })
      .catch(() => {
        console.warn('Location retrieval failed, defaulting to (0,0)');
        setCurrentLocation({ latitude: 0, longitude: 0 });
      });



    // Restore attendance state (check-in status) for today
    try {
      const savedState = localStorage.getItem('attendanceState');
      if (savedState) {
        const { date, checkedIn, email } = JSON.parse(savedState);
        const today = new Date().toDateString();

        // Only restore if it's the same day
        if (date === today) {
          setUserCheckedIn(checkedIn);
          console.log(`Restored attendance state: ${checkedIn ? 'Checked In' : 'Checked Out'}`);
        } else {
          // New day or reset
          localStorage.removeItem('attendanceState');
        }
      }
    } catch (e) {
      console.error('Error restoring attendance state', e);
    }

    return () => {
      // cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => {
          t.stop();
        });
        streamRef.current = null;
      }
    };
  }, [initializeFaceDetection, getCurrentLocation]);

  // Reset user tracking
  const resetUserTracking = () => {
    setUserCheckedIn(false);
  };

  // Start camera for face recognition
  const startFaceRecognition = async () => {
    resetUserTracking(); // Reset tracking for new session

    try {
      setIsLoading(true);
      setMessage('');
      setUserName('');
      setUserRole('');
      setScannedEmail(null);
      setCheckinTime(null);
      setCheckoutTime(null);

      let location;
      try {
        location = await getCurrentLocation();
        setCurrentLocation(location);
      } catch (error) {
        if (currentLocation) {
          console.warn('Location refresh failed, using cached location:', error);
          location = currentLocation;
        } else {
          throw error;
        }
      }

      // Start webcam automatically via Webcam component; just set mode and active
      setAttendanceMode('face');
      setIsCameraActive(true);
    } catch {
      setMessage('Error accessing location or camera');
    } finally {
      setIsLoading(false);
    }
  };

  // Start barcode scanner (file upload mode)
  const startBarcodeScanner = async () => {
    resetUserTracking(); // Reset tracking for new session

    try {
      setIsLoading(true);
      setMessage('');
      setUserName('');
      setUserRole('');
      setScannedEmail(null);
      setCheckinTime(null);
      setCheckoutTime(null);

      let location;
      try {
        location = await getCurrentLocation();
        setCurrentLocation(location);
      } catch (error) {
        if (currentLocation) {
          console.warn('Location refresh failed, using cached location:', error);
          location = currentLocation;
        } else {
          throw error;
        }
      }

      setAttendanceMode('barcode');
      setBarcodeScanMode('upload'); // Default to upload, but user can switch
      setIsCameraActive(false);
    } catch {
      setMessage('Error preparing barcode scanner');
    } finally {
      setIsLoading(false);
    }
  };

  // Decode image using ZXing library (hard decoding)
  const decodeImageHard = async (img: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
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
      return decoded.getText();
    } catch {
      setMessage('Error accessing location or camera');
    }
  };

  // Handle file upload for barcode scanning
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    setScannedEmail(null);
    setCheckinTime(null);
    setCheckoutTime(null);

    const fileReader = new FileReader();

    fileReader.onload = async () => {
      const img = new Image();
      img.src = fileReader.result as string;

      img.onload = async () => {
        // First try normal decoding
        const reader = new BrowserMultiFormatReader();

        try {
          const normal = await reader.decodeFromImageElement(img);
          const decodedText = normal.getText();
          setScannedEmail(decodedText);

          // Process attendance
          setTimeout(async () => {
            let loc = currentLocation;
            if (!loc) {
              try {
                loc = await getCurrentLocation();
                setCurrentLocation(loc);
              } catch {
                // Fallback to 0,0
                console.warn('Location failed during upload, using fallback');
                loc = { latitude: 0, longitude: 0 };
                setCurrentLocation(loc);
              }
            }
            await markAttendanceWithBarcode(decodedText, loc!);
          }, 600);
          return;
        } catch {
        }

        // Try strong decoding
        const strong = await decodeImageHard(img);
        if (strong) {
          setScannedEmail(strong);

          // Process attendance
          setTimeout(async () => {
            let loc = currentLocation;
            if (!loc) {
              try {
                loc = await getCurrentLocation();
                setCurrentLocation(loc);
              } catch {
                // Fallback to 0,0
                console.warn('Location failed during upload, using fallback');
                loc = { latitude: 0, longitude: 0 };
                setCurrentLocation(loc);
              }
            }
            await markAttendanceWithBarcode(strong, loc!);
          }, 600);
        } else {
          setMessage("❌ Barcode not detected (image too blurry)");
          setIsLoading(false);
        }
      };
    };

    fileReader.readAsDataURL(file);
  };

  // Trigger file upload
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Stop camera & scanning
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => {
        t.stop();
      });
      streamRef.current = null;
    }

    setIsCameraActive(false);
    setAttendanceMode(null);
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, []);


  // Format time for display
  const formatTime = useCallback((timeString: string | null) => {
    if (!timeString || timeString === 'null' || timeString === 'undefined') return 'Not recorded';

    try {
      // Handle HH:mm:ss or HH:mm format (e.g., "13:35:52")
      if (typeof timeString === 'string' && timeString.includes(':') && !timeString.includes('T') && !timeString.includes('-')) {
        const parts = timeString.split(':');
        let hours = parseInt(parts[0]);
        const minutes = parts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
      }

      const date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString; // Fallback
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  }, []);

  // Handle backend response shape
  const handleBackendResult = useCallback((result: BackendResponse) => {
    if (!result) {
      setMessage('No response from server');
      return;
    }

    // Check for success: either a status field or presence of standard attendance fields
    const isSuccess = result.status === 'success' ||
      result.id ||
      result.user_email ||
      result.check_in ||
      result.status === 'Present';

    if (isSuccess) {
      // The backend 'mark' endpoint returns the serialized Attendance object
      // Based on Postman response: { id, user_email, user_name, check_in, check_out, status, role }

      // Safe access helpers for the user object/string union
      const userObj = typeof result.user === 'object' && result.user !== null ? result.user : null;
      const userStr = typeof result.user === 'string' ? result.user : null;

      const name = result.user_name || result.user_full_name || result.fullname || userObj?.fullname || userObj?.email || userStr || result.user_email || 'User';
      const email = result.user_email || userObj?.email || userStr || result.email || '';
      const role = result.role || result.user_role || userObj?.role || 'N/A';
      const checkin = result.check_in || result.checkin_time || null;
      const checkout = result.check_out || result.checkout_time || null;

      // Determine action performed based on response fields
      const isCheckoutAction = (checkout && checkout !== 'null' && checkout !== 'Not recorded');
      const actionPerformed = isCheckoutAction ? 'checkout' : 'checkin';

      setUserName(name);
      setUserRole(role);
      setCheckinTime(checkin);
      setCheckoutTime(checkout);

      // Update local tracking state for next scan
      if (email) {
        const nextScanShouldBeCheckout = !isCheckoutAction;
        setUserCheckedIn(nextScanShouldBeCheckout);

        // Persist state to localStorage so it survives reloads
        localStorage.setItem('attendanceState', JSON.stringify({
          date: new Date().toDateString(),
          checkedIn: nextScanShouldBeCheckout,
          email: email
        }));
      }

      // Customize message based on what action was performed
      let actionMessage = '';
      if (actionPerformed === 'checkin') {
        actionMessage = `✅ Check-in marked for ${name} (${role}) at ${formatTime(checkin)}`;
      } else {
        actionMessage = `✅ Check-out marked for ${name} (${role}) at ${formatTime(checkout)}`;
      }
      
      // Add face recognition indicator if applicable
      if (result.face_recognition_used) {
        actionMessage += ' [Face Recognition]';
      }
      
      setMessage(actionMessage);

      // keep displayed for 5 seconds then reset
      setTimeout(() => {
        setMessage('');
        setUserName('');
        setUserRole('');
        setScannedEmail(null);
        setCheckinTime(null);
        setCheckoutTime(null);
      }, 5000);
    } else {
      // Handle error cases
      let emsg = result.message || result.error;

      if (!emsg) {
        const fieldErrors = Object.entries(result)
          .filter(([, v]) => Array.isArray(v))
          .map(([k, v]) => `${k}: ${(v as unknown[]).join(', ')}`)
          .join('; ');

        emsg = fieldErrors || (Object.keys(result).length > 0 ? JSON.stringify(result) : 'Attendance failed');
      }

      if (emsg === 'User not found') {
        emsg = 'Face or barcode not recognized. Please try again.';
      }

      setMessage(`❌ ${emsg}`);
    }
  }, [formatTime]);

  // Mark attendance with face (send 'image' field)
  const markAttendanceWithFace = useCallback(async (imageData: string, location: { latitude: number; longitude: number }) => {
    try {
      setIsLoading(true);
      setMessage('Recognizing face...');
      setUserName('');
      setUserRole('');

      const formData = new FormData();
      const blob = dataURLtoBlob(imageData);

      // Send image file to backend for face recognition
      formData.append('image', blob, 'face.jpg');
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());

      // const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/attendance/mark/`, formData, {
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('Attendance Success:', response.data);
      if (response.data) {
        handleBackendResult(response.data);
      }

    } catch (error: unknown) {
      console.error('Attendance Error:', error);
      let errorMsg = 'Face not recognized or invalid request';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK') {
          errorMsg = 'Network error: Backend server not accessible. Please ensure your Django backend server is running at http://127.0.0.1:8000';
        } else if (error.response) {
          const data = error.response.data as BackendResponse;
          errorMsg = data.message || data.error || JSON.stringify(data);
        } else if (error.request) {
          errorMsg = 'No response received from server. Please check your backend connection.';
        } else {
          errorMsg = error.message;
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
      stopCamera();
    }
  }, [handleBackendResult, stopCamera]);

  // Capture image for face recognition
  const captureAndDetectFace = useCallback(async () => {
    if (!webcamRef.current || !faceModelRef.current || !currentLocation) {
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

      if (!imageSrc) {
        setMessage('Failed to capture image. Try again.');
        return;
      }

      // convert base64 to Image to run local detection if needed
      const img = new Image();
      img.src = imageSrc;
      await new Promise(resolve => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setMessage('Error processing image');
        return;
      }
      ctx.drawImage(img, 0, 0);

      // run a local face detection pass to provide faster feedback (optional)
      const predictions = await faceModelRef.current!.estimateFaces(canvas, false);
      if (!predictions || predictions.length === 0) {
        setMessage('No face detected. Please position your face clearly.');
        return;
      }

      // Convert base64 to blob and send to backend as 'image' (backend expects request.FILES.get('image') or 'file')
      await markAttendanceWithFace(imageSrc, currentLocation);
    } catch {
      setMessage('Error processing face image');
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation, markAttendanceWithFace]);

  // Utility: dataURL -> Blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Mark attendance with barcode (send 'user_email' field)
  const markAttendanceWithBarcode = useCallback(async (barcodeData: string, location: { latitude: number; longitude: number }) => {
    try {
      setIsLoading(true);
      setMessage('Processing barcode...');
      setUserName('');
      setUserRole('');

      // The backend 'mark' action expects 'user_email'
      const formData = new FormData();
      formData.append('user_email', barcodeData);
      formData.append('method', 'barcode');
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());

      // Add explicit check-out indicator based on local state
      if (userCheckedIn) {
        // Current time in HH:mm:ss format
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }); // HH:mm:ss
        formData.append('check_out', timeStr);
      }

      const response = await axios.post('http://127.0.0.1:8000/api/attendance/mark/', formData, {
        headers: {
          'Accept': 'application/json',
          // Omit Content-Type for FormData
        }
      });

      if (response.data) {
        handleBackendResult(response.data);
      }
    } catch (error: unknown) {
      console.error("Barcode Attendance Error:", error);
      let errorMsg = 'Error connecting to server';
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data as BackendResponse;
        errorMsg = data.message || data.error || JSON.stringify(data);
      }
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
      stopCamera();
    }
  }, [userCheckedIn, handleBackendResult, stopCamera]);

  // Check if backend is accessible
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/health/'); // or any simple endpoint to test
        console.log('Backend is accessible:', response.status);
      } catch (error) {
        console.error('Backend is not accessible. Please ensure your Django backend server is running at http://127.0.0.1:8000');
        setMessage('⚠️ Backend server not accessible. Please ensure your Django backend server is running at http://127.0.0.1:8000');
      }
    };
    checkBackend();
  }, []);


  // Scan barcode from webcam
  const scanBarcodeFromWebcam = useCallback(async () => {
    if (!webcamRef.current || !isScanning) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    await new Promise(resolve => { img.onload = resolve; });

    const reader = new BrowserMultiFormatReader();
    try {
      // Try normal decode first
      const result = await reader.decodeFromImageElement(img);
      const text = result.getText();

      if (text) {
        // Stop scanning immediately
        setIsScanning(false);
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }

        setScannedEmail(text);

        // Mark attendance
        setTimeout(async () => {
          let loc = currentLocation;
          if (!loc) {
            try {
              loc = await getCurrentLocation();
              setCurrentLocation(loc);
            } catch {
              // Fallback
              loc = { latitude: 0, longitude: 0 };
              setCurrentLocation(loc);
            }
          }
          await markAttendanceWithBarcode(text, loc!);
        }, 500);
      }
    } catch {
      // No barcode found in this frame, continue scanning
    }
  }, [isScanning, currentLocation, getCurrentLocation, markAttendanceWithBarcode]);

  // Start continuous scanning
  useEffect(() => {
    if (isScanning && isCameraActive && attendanceMode === 'barcode' && barcodeScanMode === 'camera') {
      scanIntervalRef.current = setInterval(scanBarcodeFromWebcam, 500); // Scan every 500ms
    }
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [isScanning, isCameraActive, attendanceMode, barcodeScanMode, scanBarcodeFromWebcam]);

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
                Location Ready ({currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)})
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

            {/* Barcode Mode: Selection (Camera vs Upload) */}
            {attendanceMode === 'barcode' && !isCameraActive && barcodeScanMode === 'upload' && (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Barcode Attendance</h2>

                <div className="flex justify-center gap-4 mb-6">
                  <button
                    onClick={() => {
                      setBarcodeScanMode('camera');
                      setIsCameraActive(true);
                      setIsScanning(true);
                    }}
                    className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    </div>
                    <span className="font-medium">Use Camera</span>
                  </button>

                  <button
                    className="flex flex-col items-center p-4 border-2 border-green-500 bg-green-50 rounded-lg cursor-default"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <span className="font-medium">Upload Image</span>
                  </button>
                </div>

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

            {/* Live Barcode Camera View */}
            {attendanceMode === 'barcode' && isCameraActive && barcodeScanMode === 'camera' && (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Scan Barcode</h2>

                <div className="relative bg-black rounded-lg overflow-hidden mb-4 mx-auto max-w-md">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 640,
                      height: 480,
                      facingMode: 'environment' // Use back camera if available
                    }}
                    className="w-full h-auto"
                    onUserMedia={() => setIsScanning(true)}
                    onUserMediaError={(error) => {
                      console.error('[Attendance] Webcam access error:', error);
                      setMessage('Webcam access error');
                    }}
                  />
                  <div className="absolute inset-0 border-2 border-green-500 rounded-lg pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-48 border-2 border-green-400 bg-green-400/10 rounded-lg flex items-center justify-center">
                      <p className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">Align Barcode Here</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center flex-col sm:flex-row">
                  <div className="text-sm text-gray-500 animate-pulse mb-2 sm:mb-0 sm:mr-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Scanning...
                  </div>

                  <button
                    onClick={() => {
                      setIsScanning(false);
                      setIsCameraActive(false);
                      setBarcodeScanMode('upload');
                    }}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
                  >
                    Switch to Upload
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            {(message || userName) && (
              <div className={`mt-6 p-4 rounded-lg text-center ${message.includes('✅')
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

