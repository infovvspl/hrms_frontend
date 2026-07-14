import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClock,
  FaMapMarkerAlt,
  FaFingerprint,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaSpinner,
  FaCamera,
  FaUserPlus,
  FaUserCheck,
  FaTrash,
  FaDatabase,
  FaShieldAlt,
  FaExclamationTriangle,
  FaArrowLeft,
  FaCalendarAlt
} from "react-icons/fa";
import EmployeeDashboardLayout from "../../layouts/EmployeeDashboardLayout";

// Distance helper
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return 999999;
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in metres
};

export default function EmployeeAttendance() {
  const [employee, setEmployee] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("employee") || "{}");
    } catch {
      return {};
    }
  });

  // View States
  const [viewMode, setViewMode] = useState("main"); // main | register | attendance
  const [currentTime, setCurrentTime] = useState(new Date());

  const [shifts, setShifts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [locationMode, setLocationMode] = useState("office"); // office | home
  const [scanState, setScanState] = useState("idle"); // idle | scanning | success | denied
  const [loading, setLoading] = useState(true);

  // Cyberpunk Face API & Web Camera States
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [faceMatcher, setFaceMatcher] = useState(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [detectedUser, setDetectedUser] = useState(null);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [countdown, setCountdown] = useState(null); // auto punch timer

  const [registerName, setRegisterName] = useState("");
  const [feedback, setFeedback] = useState(null); // { message, type: 'success' | 'error' }

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const matchStartRef = useRef(null);
  const isPunchingRef = useRef(false);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const employeeFullName = employee?.first_name
    ? `${employee.first_name} ${employee.last_name || ""}`.trim()
    : (employee?.name || "Employee");

  // Keep digital clock ticking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateWorkingHours = (punchInRaw, punchOutRaw) => {
    if (!punchInRaw || !punchOutRaw) return "--";
    const start = new Date(punchInRaw);
    const end = new Date(punchOutRaw);
    const diffMs = end - start;
    if (diffMs <= 0) return "0h 0m";
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  const formatTotalTime = (totalTimeStr, inRaw, outRaw) => {
    if (totalTimeStr) {
      const parts = totalTimeStr.split(":");
      if (parts.length >= 2) {
        const hrs = parseInt(parts[0], 10);
        const mins = parseInt(parts[1], 10);
        return `${hrs}h ${mins}m`;
      }
    }
    return calculateWorkingHours(inRaw, outRaw);
  };

  // Fetch Attendance Log & Shifts
  const fetchData = async () => {
    try {
      setLoading(true);
      const [shiftRes, logRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_SERVER_ADDRESS}/api/attendance/shifts`, { headers }).catch(() => ({ data: { shifts: [] } })),
        axios.get(`${import.meta.env.VITE_SERVER_ADDRESS}/api/attendance/logs`, { headers }).catch(() => ({ data: { logs: [] } }))
      ]);

      setShifts(shiftRes.data.shifts || shiftRes.data || []);

      const logData = logRes.data.logs || logRes.data || [];
      const formattedLogs = logData.map(l => {
        const punchInDate = l.punch_in_at ? new Date(l.punch_in_at) : null;
        const punchOutDate = l.punch_out_at ? new Date(l.punch_out_at) : null;

        const distIn = l.punch_in_latitude && l.punch_in_longitude
          ? getDistance(Number(l.punch_in_latitude), Number(l.punch_in_longitude), 12.9716, 77.5946)
          : null;
        const inOffice = distIn !== null ? distIn <= 100 : true;

        return {
          id: `LOG-${l.id}`,
          user_id: l.user_id,
          employeeName: l.employee_name,
          punchInRaw: l.punch_in_at,
          punchOutRaw: l.punch_out_at,
          shiftName: l.shift_name || "General Shift",
          date: punchInDate ? punchInDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "--",
          punchIn: punchInDate ? punchInDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--",
          punchOut: punchOutDate ? punchOutDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--",
          totalHours: formatTotalTime(l.total_time, l.punch_in_at, l.punch_out_at),
          location: inOffice ? "Office HQ" : "WFH / Home",
          status: punchInDate && l.shift_start_time ?
            (punchInDate.toLocaleTimeString("en-GB") > l.shift_start_time ? "Late Check-in" : "On Time") : "On Time",
          gpsStatus: inOffice ? "Inside Office" : "Outside Office"
        };
      });
      setLogs(formattedLogs);
    } catch (error) {
      console.error("Fetch employee attendance error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill employee name for setup
  useEffect(() => {
    if (employee?.first_name) {
      setRegisterName(`${employee.first_name} ${employee.last_name || ""}`.trim());
    } else if (employee?.name) {
      setRegisterName(employee.name);
    }
  }, [employee]);

  // Modern alert/toast feedback
  const showFeedback = (message, type = "info") => {
    setFeedback({ message, type });
    const delay = type === "error" ? 5000 : 3500;
    setTimeout(() => {
      setFeedback(prev => prev?.message === message ? null : prev);
    }, delay);
  };

  // Load all registered users' descriptors from the backend face_descriptor table
  const loadRegisteredUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_ADDRESS}/api/face-descriptor`, { headers });
      if (res.data && res.data.success) {
        const rows = res.data.data;
        setRegisteredUsers(rows);
        setDbConnected(true);

        if (rows.length > 0 && window.faceapi) {
          const parsed = rows.map((r) => {
            const descArray = new Float32Array(r.descriptor);
            const fullName = `${r.first_name || ""} ${r.last_name || ""}`.trim() || r.email || "Employee";
            return new window.faceapi.LabeledFaceDescriptors(fullName, [descArray]);
          });
          const matcher = new window.faceapi.FaceMatcher(parsed, 0.6);
          setFaceMatcher(matcher);
        } else {
          setFaceMatcher(null);
        }
      }
    } catch (err) {
      console.error("Failed to load registered users:", err);
      setDbConnected(false);
    }
  };

  // Initialize face-api.js library and load models from public assets
  useEffect(() => {
    const initFaceApi = async () => {
      try {
        await fetchData();

        if (!window.faceapi) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }
        setFaceApiLoaded(true);

        // Load models locally from public assets
        await Promise.all([
          window.faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector'),
          window.faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68'),
          window.faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition'),
        ]);
        setModelsLoaded(true);

        await loadRegisteredUsers();
      } catch (err) {
        console.error("Neural models load error:", err);
        showFeedback("Could not load facial AI library locally.", "error");
      }
    };

    initFaceApi();
  }, []);

  // Web Camera start
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Webcam blocked:", err);
      setCameraError("Camera access blocked. Please check system permissions.");
      setCameraActive(false);
    }
  };

  // Web Camera stop
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Launch camera when in register or attendance mode
  useEffect(() => {
    if (modelsLoaded && (viewMode === "register" || viewMode === "attendance")) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [modelsLoaded, viewMode]);

  // Live recognition drawing box loop
  const runDetection = async () => {
    if (!videoRef.current || !canvasRef.current || !window.faceapi || !modelsLoaded || !cameraActive) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const faceapi = window.faceapi;

    if (video.paused || video.ended || video.readyState < 2) {
      requestAnimationFrame(runDetection);
      return;
    }

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
      canvas.width = displaySize.width;
      canvas.height = displaySize.height;
      faceapi.matchDimensions(canvas, displaySize);
    }

    try {
      if (viewMode === "register") {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
          .withFaceLandmarks();

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
          const resizedDetections = faceapi.resizeResults(detection, displaySize);
          const box = resizedDetections.detection.box;

          // Draw HUD modern bounding box
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#6366f1";
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(99, 102, 241, 0.4)";

          const r = 8;
          const x = box.x;
          const y = box.y;
          const w = box.width;
          const h = box.height;

          ctx.beginPath();
          ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(99, 102, 241, 0.9)";
          ctx.fillRect(box.x, box.y - 30, box.width, 30);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 13px 'Inter', sans-serif";
          ctx.fillText("Face Detected - Click Capture Below", box.x + 10, box.y - 10);
        }
      } else if (viewMode === "attendance") {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
          const myRegistration = registeredUsers.find(r => String(r.user_id) === String(employee.id));
          let isMatched = false;
          let confidence = 0;
          let distance = 1;

          if (myRegistration && myRegistration.descriptor) {
            const targetDescriptor = new Float32Array(myRegistration.descriptor);
            distance = faceapi.euclideanDistance(detection.descriptor, targetDescriptor);
            confidence = 1 - distance;
            isMatched = distance < 0.6;
          }

          const resizedDetections = faceapi.resizeResults(detection, displaySize);
          const box = resizedDetections.detection.box;

          // Draw HUD bounding box: green if matched, red if mismatched/unknown
          ctx.lineWidth = 3;
          ctx.strokeStyle = isMatched ? "#10b981" : "#ef4444";
          ctx.shadowBlur = 8;
          ctx.shadowColor = isMatched ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)";

          const r = 8;
          const x = box.x;
          const y = box.y;
          const w = box.width;
          const h = box.height;

          ctx.beginPath();
          ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.stroke();

          ctx.shadowBlur = 0;

          // Label Tag Background
          ctx.fillStyle = isMatched ? "rgba(16, 185, 129, 0.9)" : "rgba(239, 68, 68, 0.9)";
          ctx.fillRect(box.x, box.y - 30, box.width, 30);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 13px 'Inter', sans-serif";

          const label = isMatched
            ? `${employeeFullName} (${Math.round(confidence * 100)}%)`
            : "Face Mismatch / Unknown Employee";
          ctx.fillText(label, box.x + 10, box.y - 10);

          if (isMatched) {
            setDetectedUser(employeeFullName);
            setDetectionConfidence(confidence);

            if (!matchStartRef.current) {
              matchStartRef.current = Date.now();
            }
            const elapsed = Date.now() - matchStartRef.current;
            const secondsLeft = Math.max(0, 2 - Math.floor(elapsed / 1000));
            setCountdown(secondsLeft);

            if (elapsed >= 2000 && !isPunchingRef.current) {
              isPunchingRef.current = true;
              const activeEmpLog = logs.find(log => log.punchOut === "--:--");
              const punchType = activeEmpLog ? "OUT" : "IN";
              handleMarkAttendance(punchType);
            }
          } else {
            setDetectedUser(null);
            setDetectionConfidence(0);
            matchStartRef.current = null;
            setCountdown(null);
          }
        } else {
          setDetectedUser(null);
          setDetectionConfidence(0);
          matchStartRef.current = null;
          setCountdown(null);
        }
      }
    } catch (e) {
      console.error("Frame recognition error:", e);
    }

    if (cameraActive && (viewMode === "register" || viewMode === "attendance")) {
      setTimeout(() => {
        requestAnimationFrame(runDetection);
      }, 150);
    }
  };

  useEffect(() => {
    if (cameraActive && (viewMode === "register" || viewMode === "attendance")) {
      requestAnimationFrame(runDetection);
    }
  }, [cameraActive, viewMode, registeredUsers]);

  // ── REGISTER FACE ──
  const handleRegisterFace = async () => {
    if (scanState === "scanning") return;

    const nameToRegister = registerName.trim();
    if (!nameToRegister) {
      showFeedback("Name is required.", "error");
      return;
    }

    setScanState("scanning");
    showFeedback(`Scanning credentials for "${nameToRegister}"...`, "info");

    try {
      const faceapi = window.faceapi;
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setScanState("denied");
        showFeedback("No face detected. Please center your face in the camera.", "error");
        setTimeout(() => setScanState("idle"), 3000);
        return;
      }

      const descriptorArray = Array.from(detection.descriptor);

      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_ADDRESS}/api/face-descriptor`,
        {
          user_id: employee.id,
          descriptor: descriptorArray
        },
        { headers }
      );

      if (res.data && res.data.success) {
        setScanState("success");
        showFeedback(`"${nameToRegister}" face registered successfully! 🎉`, "success");
        await loadRegisteredUsers();
        setTimeout(() => {
          setViewMode("main");
          setScanState("idle");
        }, 2000);
      }
    } catch (err) {
      console.error("Registration endpoint error:", err);
      setScanState("denied");
      showFeedback("Registration failed: " + (err.response?.data?.message || err.message), "error");
      setTimeout(() => setScanState("idle"), 3000);
    }
  };

  // ── MARK ATTENDANCE (IN/OUT) ──
  const handleMarkAttendance = async (type) => {
    if (!isInsideGeofence) {
      setScanState("denied");
      showFeedback("Access Denied: Must be inside Geofence HQ to mark attendance.", "error");
      setTimeout(() => {
        setViewMode("main");
        setScanState("idle");
        setCountdown(null);
        matchStartRef.current = null;
        isPunchingRef.current = false;
      }, 3000);
      return;
    }

    setScanState("scanning");
    showFeedback(`Biometrics verified! Submitting punch...`, "info");

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_ADDRESS}/api/attendance/punch`,
        {
          user_id: employee.id,
          shift_id: defaultShift?.id || 1,
          punch_type: 'face',
          longitude: String(officeConfig.lng),
          latitude: String(officeConfig.lat)
        },
        { headers }
      );

      setScanState("success");
      showFeedback(`Face recognized! Marked ${type} successfully!`, "success");
      await fetchData();
      setTimeout(() => {
        setViewMode("main");
        setScanState("idle");
        setCountdown(null);
        matchStartRef.current = null;
        isPunchingRef.current = false;
      }, 2000);
    } catch (err) {
      console.error("Punch transaction error:", err);
      setScanState("denied");
      showFeedback("Punch failed: " + (err.response?.data?.message || err.message), "error");
      setTimeout(() => {
        setScanState("idle");
        setCountdown(null);
        matchStartRef.current = null;
        isPunchingRef.current = false;
      }, 3000);
    }
  };

  // ── DELETE USER REGISTRATION ──
  const handleDeleteMyRegistration = async () => {
    if (!window.confirm("Are you sure you want to delete your Face ID profile? You will need to re-register before taking attendance.")) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_ADDRESS}/api/face-descriptor`,
        {
          user_id: employee.id,
          descriptor: [] // Send empty array to reset
        },
        { headers }
      );

      showFeedback("Your face ID profile has been removed.", "success");
      await loadRegisteredUsers();
    } catch (err) {
      console.error("Failed to delete face descriptor:", err);
      showFeedback("Failed to delete face profile.", "error");
    }
  };

  const [officeConfig, setOfficeConfig] = useState({
    name: "Bangalore Tech Park HQ",
    lat: null,
    lng: null,
    radius: 100,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setOfficeConfig((prev) => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
        }
      );
    }
  }, []);

  const simulatedCoords = locationMode === "office"
    ? { lat: 12.9718, lng: 77.5945, distance: 24 }
    : { lat: 12.9141, lng: 77.6413, distance: 8200 };

  const isInsideGeofence = simulatedCoords.distance <= officeConfig.radius;

  const defaultShift = shifts.find(s => s.shift_name === "General Shift") || shifts[0];
  const activeEmpLog = logs.find(log => log.punchOut === "--:--");
  const isPunchedIn = !!activeEmpLog;

  // Filter logs for today
  const todayStr = new Date().toDateString();
  const todayLogs = logs.filter(l => {
    return l.punchInRaw && new Date(l.punchInRaw).toDateString() === todayStr;
  });

  const isFaceRegistered = registeredUsers.some(r => String(r.user_id) === String(employee.id));

  // Determine punch details for display card
  const recentPunchLog = todayLogs.length > 0 ? todayLogs[0] : null;
  const punchInTime = recentPunchLog ? recentPunchLog.punchIn : "--:--";
  const punchOutTime = recentPunchLog ? recentPunchLog.punchOut : "--:--";

  const getTodayWorkedHours = () => {
    if (todayLogs.length === 0) return "--";

    let totalMs = 0;
    let isActive = false;

    todayLogs.forEach(l => {
      if (l.punchInRaw) {
        const start = new Date(l.punchInRaw);
        if (l.punchOutRaw) {
          const end = new Date(l.punchOutRaw);
          const diff = end - start;
          if (diff > 0) totalMs += diff;
        } else {
          // Running active session
          const diff = currentTime - start;
          if (diff > 0) totalMs += diff;
          isActive = true;
        }
      }
    });

    if (totalMs <= 0) return "0h 0m";
    const diffHrs = Math.floor(totalMs / 3600000);
    const diffMins = Math.floor((totalMs % 3600000) / 60000);
    return `${diffHrs}h ${diffMins}m${isActive ? " (Active)" : ""}`;
  };

  return (
    <EmployeeDashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-4 px-2 sm:px-4 animate-fadeIn bg-slate-50/50 rounded-[2.5rem]">

        {/* Loading models overlay */}
        {loading && !modelsLoaded && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <FaSpinner className="animate-spin text-indigo-600" size={42} />
            <span className="text-sm font-bold text-slate-700 tracking-widest uppercase">Initializing Biometric Security Nodes...</span>
          </div>
        )}

        {modelsLoaded && (
          <AnimatePresence mode="wait">
            {viewMode === "main" ? (
              <motion.div
                key="main-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Sleek Top Banner & Digital Clock */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-sm">
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                      <FaFingerprint className="text-indigo-600" /> Biometric Attendance Terminal
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Authenticate via face recognition to log shift punch logs.
                    </p>
                  </div>

                  {/* Digital Clock */}
                  <div className="flex items-center gap-4 bg-white border border-slate-200/60 px-5 py-3 rounded-2xl min-w-[200px] justify-between shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Digital Clock</span>
                      <span className="text-base font-black text-indigo-600 tracking-wider font-mono">
                        {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>
                    <FaClock className="text-slate-400 animate-pulse" size={18} />
                  </div>
                </div>

                {/* Feedback Panel */}
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-2xl text-xs font-bold border text-center flex items-center justify-center gap-2 ${feedback.type === "success"
                      ? "bg-emerald-50 border-emerald-250 text-emerald-700 shadow-sm"
                      : "bg-rose-50 border-rose-250 text-rose-600 shadow-sm"
                      }`}
                  >
                    <span>{feedback.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}</span>
                    <span>{feedback.message}</span>
                  </motion.div>
                )}

                {/* Main Cards Grid */}
                <div className="grid lg:grid-cols-12 gap-6">

                  {/* LEFT COLUMN: Status and actions */}
                  <div className="lg:col-span-8 space-y-6">

                    {/* Status Info Dashboard Card */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50 shadow-inner">
                          <FaClock size={20} />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Punch In Time</p>
                          <p className="text-2xl font-black text-slate-800 mt-1">{punchInTime}</p>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-650 flex items-center justify-center shrink-0 border border-rose-100/50 shadow-inner">
                          <FaClock size={20} />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Punch Out Time</p>
                          <p className="text-2xl font-black text-slate-800 mt-1">{punchOutTime}</p>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50 shadow-inner">
                          <FaClock size={20} />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Worked Hours</p>
                          <p className="text-xl font-black text-indigo-600 mt-1">{getTodayWorkedHours()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Main Biometric Action Card */}
                    <div className="bg-white border border-slate-200/50 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                      {/* Interactive backgrounds */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                      {!isFaceRegistered ? (
                        <div className="flex flex-col items-center text-center space-y-5 py-6">
                          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center shadow-sm">
                            <FaUserPlus size={26} />
                          </div>
                          <div className="space-y-1 max-w-md">
                            <h3 className="text-base font-black text-slate-850">Biometric Face ID Required</h3>
                            <p className="text-xs text-slate-500">
                              You haven't registered your Face ID descriptor profile yet. Please configure registration to enable marking attendance.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setViewMode("register");
                              setRegisterName(employeeFullName);
                            }}
                            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition duration-150 shadow-md shadow-indigo-100 hover:-translate-y-0.5"
                          >
                            <FaCamera /> First Register Face
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center space-y-5 py-6">
                          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center animate-pulse shadow-sm">
                            <FaUserCheck size={26} />
                          </div>
                          <div className="space-y-1 max-w-md">
                            <h3 className="text-base font-black text-slate-850">Biometrics Fully Configured</h3>
                            <p className="text-xs text-slate-500">
                              Your Face ID biometric profile is active. You can check-in or check-out by aligning your face in front of the camera.
                            </p>
                          </div>
                          <div className="flex flex-col items-center gap-3">
                            <button
                              onClick={() => {
                                setViewMode("attendance");
                              }}
                              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2.5 cursor-pointer transition duration-150 shadow-md shadow-indigo-100 hover:-translate-y-0.5 uppercase tracking-wider"
                            >
                              <FaFingerprint size={14} /> Take Attendance
                            </button>
                            <button
                              onClick={handleDeleteMyRegistration}
                              className="text-[10px] text-rose-500 hover:text-rose-600 hover:underline transition cursor-pointer"
                            >
                              Reset Face ID Profile
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Historical Logs Table */}
                    <div className="bg-white border border-slate-200/50 rounded-3xl overflow-hidden p-0 shadow-sm">
                      <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                        <FaHistory className="text-indigo-600" />
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Attendance logs &amp; history</h3>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/75 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-150/50">
                              <th className="px-5 py-3">Date</th>
                              <th className="px-5 py-3">Shift</th>
                              <th className="px-5 py-3">Punch In</th>
                              <th className="px-5 py-3">Punch Out</th>
                              <th className="px-5 py-3">Worked Hours</th>
                              <th className="px-5 py-3">Location</th>
                              <th className="px-5 py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {logs.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="text-center py-10 text-slate-400">
                                  No attendance logs found in history database.
                                </td>
                              </tr>
                            ) : (
                              logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/40 transition">
                                  <td className="px-5 py-3.5 font-bold text-slate-800 whitespace-nowrap">{log.date}</td>
                                  <td className="px-5 py-3.5 text-slate-650">{log.shiftName}</td>
                                  <td className="px-5 py-3.5 text-emerald-600 font-mono font-bold">{log.punchIn}</td>
                                  <td className="px-5 py-3.5 text-rose-500 font-mono font-bold">{log.punchOut}</td>
                                  <td className="px-5 py-3.5 text-slate-800 font-mono font-extrabold">{log.totalHours}</td>
                                  <td className="px-5 py-3.5">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${log.location === "Office HQ"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                      : "bg-amber-50 text-amber-700 border border-amber-100"
                                      }`}>
                                      {log.location}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${log.status === "On Time"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                      : "bg-rose-55/90 text-rose-600 border border-rose-100"
                                      }`}>
                                      {log.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: Simulator and general information */}
                  <div className="lg:col-span-4 space-y-6">

                    {/* Geofence Info & Simulator */}
                    <div className="bg-white border border-slate-200/50 rounded-3xl p-5 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Office HQ Geofence</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${isInsideGeofence
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-600 border-rose-200"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isInsideGeofence ? "bg-emerald-500 animate-ping" : "bg-rose-500"}`} />
                          {isInsideGeofence ? "Inside Office" : "Outside Office"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-medium">Office Center:</span>
                          <span className="text-slate-700 font-bold">{officeConfig.lat}° N, {officeConfig.lng}° E</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-medium">Distance to Office:</span>
                          <span className={`font-mono font-bold ${isInsideGeofence ? "text-emerald-650" : "text-rose-550"}`}>
                            {locationMode === "office" ? `${simulatedCoords.distance} meters` : "8.2 km (WFH)"}
                          </span>
                        </div>
                      </div>

                      {/* GPS Simulator buttons */}
                      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                          Simulate GPS Coordinates
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setLocationMode("office")}
                            className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${locationMode === "office" ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                              }`}
                          >
                            Office HQ
                          </button>
                          <button
                            onClick={() => setLocationMode("home")}
                            className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${locationMode === "home" ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                              }`}
                          >
                            WFH / Home
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Shift & Rule summary */}
                    <div className="bg-white border border-slate-200/50 rounded-3xl p-5 space-y-4 shadow-sm">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Shift parameters</h4>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Shift:</span>
                          <span className="text-slate-700 font-bold">{defaultShift?.shift_name || "General Shift"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Start time:</span>
                          <span className="text-slate-700 font-mono font-bold">{defaultShift?.start_time || "09:00"} AM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">End time:</span>
                          <span className="text-slate-700 font-mono font-bold">{defaultShift?.end_time || "18:00"} PM</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </motion.div>
            ) : (
              <motion.div
                key="camera-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* Back controls */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setViewMode("main");
                      setScanState("idle");
                      setCountdown(null);
                      matchStartRef.current = null;
                      isPunchingRef.current = false;
                    }}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-655 bg-white border border-slate-200/80 px-4.5 py-2.5 rounded-2xl cursor-pointer transition shadow-sm animate-fadeIn"
                  >
                    <FaArrowLeft /> Return to Main Dashboard
                  </button>

                  <div className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">
                    Mode: <span className="text-indigo-600">{viewMode === "register" ? "Face Registration" : "Face Attendance Recognition"}</span>
                  </div>
                </div>

                {/* HUD Camera view */}
                <div className="bg-white border border-slate-200/50 rounded-3xl overflow-hidden p-0 relative shadow-sm">

                  {/* Header bar of camera HUD */}
                  <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Feed
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      GPS Status: {isInsideGeofence ? "Inside Office (Valid)" : "Outside Office (Invalid)"}
                    </span>
                  </div>

                  <div className="relative aspect-[4/3] max-h-[500px] w-full bg-[#000] flex items-center justify-center">

                    {/* Feed Loading overlay */}
                    {!cameraActive && !cameraError && (
                      <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center gap-3 z-10">
                        <div className="w-12 h-12 border-3 border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Aligning Neural Grids...</p>
                      </div>
                    )}

                    {/* Camera Permission/Blocked Error */}
                    {cameraError && (
                      <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center gap-3 z-10">
                        <FaExclamationTriangle className="text-rose-500" size={42} />
                        <p className="text-xs font-bold text-rose-550">{cameraError}</p>
                      </div>
                    )}

                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full"
                    />

                    {/* Laser Scanner animation */}
                    {cameraActive && scanState === "idle" && (
                      <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_#6366f1] animate-sweep pointer-events-none" />
                    )}

                    {/* Countdown Overlay */}
                    {viewMode === "attendance" && countdown !== null && (
                      <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center z-10 pointer-events-none">
                        <div className="bg-slate-950/95 border border-indigo-500/40 px-6 py-4 rounded-3xl text-center space-y-1 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Hold Face Steady</p>
                          <p className="text-3xl font-black text-indigo-400 font-mono">{countdown}s</p>
                          <p className="text-[9px] text-indigo-400 font-bold">AUTOPUNCH TRIGGERING</p>
                        </div>
                      </div>
                    )}

                    {/* Corner overlay brackets */}
                    <div className="absolute top-6 left-6 w-5 h-5 border-t-2 border-l-2 border-indigo-500/40 rounded-tl-sm pointer-events-none" />
                    <div className="absolute top-6 right-6 w-5 h-5 border-t-2 border-r-2 border-indigo-500/40 rounded-tr-sm pointer-events-none" />
                    <div className="absolute bottom-6 left-6 w-5 h-5 border-b-2 border-l-2 border-indigo-500/40 rounded-bl-sm pointer-events-none" />
                    <div className="absolute bottom-6 right-6 w-5 h-5 border-b-2 border-r-2 border-indigo-500/40 rounded-tr-sm pointer-events-none" />
                  </div>

                  {/* HUD controls beneath camera stream */}
                  <div className="bg-slate-50 border-t border-slate-100 p-5">
                    {viewMode === "register" ? (
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 w-full space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                            Employee ID Registration Name
                          </label>
                          <input
                            type="text"
                            value={registerName}
                            onChange={(e) => setRegisterName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 px-4 py-3 rounded-xl text-xs font-bold outline-none transition"
                          />
                        </div>
                        <button
                          onClick={handleRegisterFace}
                          disabled={scanState === "scanning" || !cameraActive}
                          className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-md shadow-indigo-100"
                        >
                          {scanState === "scanning" ? (
                            <>
                              <FaSpinner className="animate-spin" size={12} /> Registering Profile...
                            </>
                          ) : (
                            <>✦ Capture &amp; Register</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="space-y-1 text-center md:text-left">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">FACIAL ATTENDANCE STATE</span>
                          <span className="text-xs text-slate-700 font-bold">
                            {detectedUser ? (
                              <span className="text-emerald-600">Recognized: {detectedUser} ({Math.round(detectionConfidence * 100)}% match)</span>
                            ) : (
                              <span className="text-rose-500">Detecting matching face descriptor profile...</span>
                            )}
                          </span>
                        </div>

                        {/* Explicit verification buttons (as backup triggers) */}
                        {detectedUser && isInsideGeofence && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleMarkAttendance(activeEmpLog ? "OUT" : "IN")}
                              disabled={scanState === "scanning"}
                              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer hover:bg-indigo-700 active:scale-95 transition shadow-sm"
                            >
                              {activeEmpLog ? "✔ Force Punch Out" : "✔ Force Punch In"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* Subtitle notes */}
                {viewMode === "attendance" && (
                  <div className="bg-white border border-slate-200/50 p-4.5 rounded-3xl flex items-start gap-3 shadow-sm">
                    <FaShieldAlt className="text-indigo-600 mt-0.5" size={16} />
                    <div className="space-y-1 text-left">
                      <h5 className="text-xs font-black text-slate-800">Biometric Geolocation Validation</h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        To guarantee punch validity, matching attendance is strictly authorized when inside the Office HQ geofence. The system will automatically check you out once the descriptor is held for 2 seconds.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

      </div>

      <style>{`
        @keyframes sweep {
          0%, 100% {
            top: 5%;
          }
          50% {
            top: 95%;
          }
        }
        .animate-sweep {
          animation: sweep 2.5s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out forwards;
        }
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </EmployeeDashboardLayout>
  );
}
