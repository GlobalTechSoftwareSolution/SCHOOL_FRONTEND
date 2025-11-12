// app/attendance/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

// Types
type AttendanceMode = 'barcode' | 'video' | null;

interface AttendanceRecord {
  id: string;
  name: string;
  department: string;
  position: string;
  timestamp: Date;
  method: 'barcode' | 'video';
  confidence?: number;
  status: 'present' | 'late' | 'early';
}

// Sample staff data
const staffMembers = [
  { id: 'ADM001', name: 'Dr. Sarah Johnson', department: 'Administration', position: 'Principal' },
  { id: 'ADM002', name: 'Mr. Robert Chen', department: 'Administration', position: 'Vice Principal' },
  { id: 'ADM003', name: 'Ms. Priya Sharma', department: 'Management', position: 'Academic Director' },
  { id: 'ADM004', name: 'Mr. David Wilson', department: 'Management', position: 'Operations Manager' },
  { id: 'TCH001', name: 'Mrs. Lisa Anderson', department: 'Mathematics', position: 'Senior Teacher' },
  { id: 'TCH002', name: 'Mr. James Brown', department: 'Science', position: 'Head of Department' },
  { id: 'TCH003', name: 'Ms. Maria Garcia', department: 'Languages', position: 'Teacher' },
  { id: 'TCH004', name: 'Mr. Ahmed Khan', department: 'IT', position: 'Technical Coordinator' },
  { id: 'ADM005', name: 'Mrs. Emily Davis', department: 'HR', position: 'HR Manager' },
  { id: 'ADM006', name: 'Mr. Kevin Martin', department: 'Finance', position: 'Finance Officer' }
];

// Barcode Scanner Component
const BarcodeAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopBarcodeScanner();
    };
  }, []);

  const startBarcodeScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      streamRef.current = stream;
      setIsScanning(true);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Cannot access camera. Please check permissions.');
    }
  };

  const stopBarcodeScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  };

  const handleBarcodeScan = (staffId: string) => {
    const staff = staffMembers.find(member => member.id === staffId);
    if (!staff) {
      alert('❌ Staff member not found in database');
      return;
    }

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const status: 'present' | 'late' | 'early' = 
      currentHour < 8 ? 'early' : 
      currentHour > 9 ? 'late' : 'present';

    const staffData: AttendanceRecord = {
      ...staff,
      timestamp: currentTime,
      method: 'barcode',
      status
    };

    setAttendanceRecords(prev => {
      const today = new Date().toDateString();
      const alreadyMarked = prev.find(record => 
        record.id === staffData.id && 
        new Date(record.timestamp).toDateString() === today
      );
      
      if (!alreadyMarked) {
        return [...prev, staffData];
      }
      return prev;
    });

    // Show professional notification
    showNotification(`✅ ${staff.name} - ${staff.position}`, 'marked present via barcode');
  };

  const simulateBarcodeScan = () => {
    const randomStaff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
    handleBarcodeScan(randomStaff.id);
  };

  const handleManualEntry = () => {
    const staffId = prompt('Enter Staff ID (e.g., ADM001, TCH002):');
    if (staffId) {
      handleBarcodeScan(staffId.toUpperCase());
    }
  };

  const showNotification = (title: string, message: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-right duration-500';
    notification.innerHTML = `
      <div class="font-semibold">${title}</div>
      <div class="text-sm opacity-90">${message}</div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 4000);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      early: 'bg-blue-100 text-blue-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          ID Card Scanner
        </h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          Professional Staff
        </span>
      </div>

      {/* Scanner Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {!isScanning ? (
          <button
            onClick={startBarcodeScanner}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-xl">📷</span>
            Activate Scanner
          </button>
        ) : (
          <button
            onClick={stopBarcodeScanner}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-xl">⏹️</span>
            Deactivate Scanner
          </button>
        )}
        
        <button
          onClick={simulateBarcodeScan}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3"
        >
          <span className="text-xl">👨‍💼</span>
          Test Scan
        </button>
        
        <button
          onClick={handleManualEntry}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3"
        >
          <span className="text-xl">⌨️</span>
          Manual Entry
        </button>
      </div>

      {/* Scanner Container */}
      <div className="bg-gray-900 rounded-xl p-4">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full max-w-2xl mx-auto rounded-lg bg-black min-h-[400px]"
            muted
            playsInline
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg">
              <div className="text-center text-white">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-xl font-semibold mb-2">ID Card Scanner Ready</p>
                <p className="text-gray-300">Activate scanner to begin staff verification</p>
              </div>
            </div>
          )}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-red-500 border-dashed w-80 h-48 animate-pulse rounded-lg"></div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{attendanceRecords.length}</div>
          <div className="text-sm text-gray-600">Total Marked</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {attendanceRecords.filter(r => r.status === 'present').length}
          </div>
          <div className="text-sm text-gray-600">On Time</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {attendanceRecords.filter(r => r.status === 'late').length}
          </div>
          <div className="text-sm text-gray-600">Late Arrivals</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {attendanceRecords.filter(r => r.status === 'early').length}
          </div>
          <div className="text-sm text-gray-600">Early Arrivals</div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            📋 Staff Attendance Records
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {attendanceRecords.length} / {staffMembers.length}
            </span>
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl text-gray-300 mb-4">📊</div>
              <p className="text-gray-500 font-medium">No attendance records</p>
              <p className="text-gray-400 text-sm">Start scanning staff ID cards to mark attendance</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {attendanceRecords.map((record, index) => (
                <div key={`${record.id}-${index}`} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-gray-900">{record.name}</span>
                        <span className={getStatusBadge(record.status)}>
                          {record.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.position} • {record.department} • ID: {record.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {record.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-blue-600 font-medium">ID SCAN</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Video Attendance Component
const VideoAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopVideoAttendance();
    };
  }, []);

  const startVideoAttendance = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      streamRef.current = stream;
      setIsRecording(true);
      
      // Simulate face recognition
      setTimeout(() => {
        markAttendanceFromVideo();
      }, 3000);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Cannot access camera. Please check permissions.');
    }
  };

  const stopVideoAttendance = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsRecording(false);
  };

  const markAttendanceFromVideo = () => {
    const randomStaff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const status: 'present' | 'late' | 'early' = 
      currentHour < 8 ? 'early' : 
      currentHour > 9 ? 'late' : 'present';

    const staffData: AttendanceRecord = {
      ...randomStaff,
      timestamp: currentTime,
      method: 'video',
      confidence: 92 + Math.random() * 8, // High confidence for staff
      status
    };

    setAttendanceRecords(prev => {
      const today = new Date().toDateString();
      const alreadyMarked = prev.find(record => 
        record.id === staffData.id && 
        new Date(record.timestamp).toDateString() === today
      );
      
      if (!alreadyMarked) {
        return [...prev, staffData];
      }
      return prev;
    });

    showNotification(
      `✅ ${staffData.name}`,
      `Face recognition confirmed - ${staffData.position}`
    );

    // Continue scanning
    if (isRecording) {
      setTimeout(() => {
        markAttendanceFromVideo();
      }, 5000);
    }
  };

  const simulateMultipleStaff = () => {
    const availableStaff = staffMembers.filter(staff => 
      !attendanceRecords.some(record => 
        record.id === staff.id && 
        new Date(record.timestamp).toDateString() === new Date().toDateString()
      )
    ).slice(0, 3);

    availableStaff.forEach((staff, index) => {
      setTimeout(() => {
        const currentTime = new Date();
        const status: 'present' | 'late' | 'early' = 
          currentTime.getHours() < 8 ? 'early' : 
          currentTime.getHours() > 9 ? 'late' : 'present';

        const staffData: AttendanceRecord = {
          ...staff,
          timestamp: currentTime,
          method: 'video',
          confidence: 95 + Math.random() * 5,
          status
        };

        setAttendanceRecords(prev => [...prev, staffData]);
        
        if (index === availableStaff.length - 1) {
          showNotification(
            'Multiple Staff Detected',
            `${availableStaff.length} staff members marked via facial recognition`
          );
        }
      }, index * 1000);
    });
  };

  const showNotification = (title: string, message: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-right duration-500';
    notification.innerHTML = `
      <div class="font-semibold">${title}</div>
      <div class="text-sm opacity-90">${message}</div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 4000);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      early: 'bg-blue-100 text-blue-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Facial Recognition System
        </h2>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          AI Powered
        </span>
      </div>

      {/* Video Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {!isRecording ? (
          <button
            onClick={startVideoAttendance}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-xl">👁️</span>
            Start Facial Recognition
          </button>
        ) : (
          <button
            onClick={stopVideoAttendance}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-xl">⏹️</span>
            Stop Recognition
          </button>
        )}
        
        <button
          onClick={simulateMultipleStaff}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3"
        >
          <span className="text-xl">👥</span>
          Simulate Group Entry
        </button>
      </div>

      {/* Video Container */}
      <div className="bg-gray-900 rounded-xl p-4">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full max-w-2xl mx-auto rounded-lg bg-black min-h-[400px]"
            muted
            playsInline
          />
          {!isRecording && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg">
              <div className="text-center text-white">
                <div className="text-4xl mb-4">👁️</div>
                <p className="text-xl font-semibold mb-2">Facial Recognition System</p>
                <p className="text-gray-300">Activate to begin staff identification</p>
              </div>
            </div>
          )}
          {isRecording && (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-green-500 border-dashed w-64 h-64 rounded-full animate-pulse"></div>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                🔍 Scanning for faces...
              </div>
            </>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{attendanceRecords.length}</div>
          <div className="text-sm text-gray-600">Facial Recognition</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(attendanceRecords.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / (attendanceRecords.length || 1))}%
          </div>
          <div className="text-sm text-gray-600">Avg. Confidence</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {new Set(attendanceRecords.map(r => r.department)).size}
          </div>
          <div className="text-sm text-gray-600">Departments</div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            👥 Facial Recognition Records
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              {attendanceRecords.length} identified
            </span>
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl text-gray-300 mb-4">👁️</div>
              <p className="text-gray-500 font-medium">No facial recognition records</p>
              <p className="text-gray-400 text-sm">Activate facial recognition to identify staff members</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {attendanceRecords.map((record, index) => (
                <div key={`${record.id}-${index}`} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-gray-900">{record.name}</span>
                        <span className={getStatusBadge(record.status)}>
                          {record.status.toUpperCase()}
                        </span>
                        {record.confidence && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                            {record.confidence.toFixed(1)}% match
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.position} • {record.department} • ID: {record.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {record.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-green-600 font-medium">FACE ID</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Attendance Page Component
export default function AttendancePage() {
  const [currentMode, setCurrentMode] = useState<AttendanceMode>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Professional Attendance System
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Secure staff attendance tracking for administration, management, and teaching professionals
          </p>
        </div>

        {/* Mode Selection */}
        {!currentMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
            <div 
              onClick={() => setCurrentMode('barcode')}
              className="bg-white border-2 border-blue-200 rounded-xl p-8 cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">ID Card Scanner</h3>
                <p className="text-gray-600 mb-4">
                  Quick staff verification using official ID cards and barcodes
                </p>
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  <strong>Recommended for:</strong> Individual check-ins, formal records
                </div>
              </div>
            </div>

            <div 
              onClick={() => setCurrentMode('video')}
              className="bg-white border-2 border-green-200 rounded-xl p-8 cursor-pointer hover:border-green-400 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <span className="text-3xl">👁️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Facial Recognition</h3>
                <p className="text-gray-600 mb-4">
                  Advanced AI-powered facial recognition for seamless entry
                </p>
                <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700">
                  <strong>Recommended for:</strong> Group entries, high-security areas
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Components */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {currentMode === 'barcode' && <BarcodeAttendance />}
          {currentMode === 'video' && <VideoAttendance />}
        </div>

        {/* Back Button */}
        {currentMode && (
          <div className="text-center mt-6">
            <button
              onClick={() => setCurrentMode(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
            >
              ← Back to Method Selection
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Professional Attendance System v2.0 • Secure • Confidential • Efficient</p>
        </div>
      </div>
    </div>
  );
}