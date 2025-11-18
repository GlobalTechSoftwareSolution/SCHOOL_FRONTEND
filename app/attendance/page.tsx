"use client";

import { useState, useRef } from "react";
import axios from "axios";

export default function AttendanceScanner() {
  const videoRef = useRef(null);
  const [message, setMessage] = useState("");

  const API_URL =
    "https://globaltechsoftwaresolutions.cloud/school-api/api/school_attendance/";

  // Get Location
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("📍 LOCATION FETCHED", pos.coords);
          resolve(pos.coords);
        },
        (err) => reject(err)
      );
    });
  };

  // Capture Face
  const captureFace = () => {
    return new Promise((resolve) => {
      console.log("📸 Capturing face...");
      const video = videoRef.current;

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, 400, 400);

      canvas.toBlob((blob) => {
        console.log("✅ FACE IMAGE CAPTURED");
        resolve(blob);
      }, "image/jpeg");
    });
  };

  // Send Attendance
  const sendAttendance = async (faceBlob, coords) => {
    console.log("📡 Sending attendance...");

    const formData = new FormData();
    formData.append("face_image", faceBlob); // ✔ correct field name
    formData.append("latitude", coords.latitude);
    formData.append("longitude", coords.longitude);

    console.log("📤 Sending FACE BLOB");

    try {
      const response = await axios.post(API_URL, formData);

      console.log("✅ API RESPONSE:", response.data);

      return response.data;

    } catch (err) {
      console.error("❌ ERROR SENDING ATTENDANCE:", err);
      throw err;
    }
  };

  // MAIN FLOW
  const handleFaceAttendance = async () => {
    setMessage("Scanning...");

    console.log("▶ Starting face scan...");

    try {
      const coords = await getLocation();
      const faceBlob = await captureFace();
      const result = await sendAttendance(faceBlob, coords);

      console.log("🔍 FACE MATCH RESULT:", result);

      if (result.match === true) {
        console.log("🎉 FACE MATCHED!");

        const name = result.user?.name || "User";
        const role = result.user?.role || "Unknown";
        const email = result.user?.email;

        console.log("👤 User:", name, role, email);

        setMessage(`${name} Check-in Successful (${role})`);
      } else {
        setMessage("Face does not match. Try again.");
      }
    } catch (error) {
      setMessage("Attendance failed.");
    }
  };

  return (
    <div className="p-4">
      <h2>Face Attendance</h2>

      <video
        ref={videoRef}
        autoPlay
        width="350"
        height="350"
        style={{ border: "2px solid black" }}
      />

      <button
        onClick={handleFaceAttendance}
        className="mt-4 p-3 bg-blue-600 text-white rounded"
      >
        Start Attendance
      </button>

      <p className="mt-4 text-lg font-semibold">{message}</p>
    </div>
  );
}
