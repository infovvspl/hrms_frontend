import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import axios from "axios";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Partners from "./pages/Partners";
import PartnerWithUs from "./pages/PartnerWithUs";
import Solutions from "./pages/Solutions";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

import GoogleSuccess from "./pages/GoogleSuccess";
import Demo from "./pages/Demo";

import Employeee from "./pages/features/Employeee";
import AttendanceLanding from "./pages/features/Attendance";
import Attendance from "./pages/attendance/Attendance";
import DailyTracking from "./pages/attendance/DailyTracking";
import Shift from "./pages/attendance/Shift";
import Payroll from "./pages/features/Payroll";

import PayrollMain from "./pages/payroll/Payroll";
import SalaryDetails from "./pages/payroll/SalaryDetails";
import PayslipList from "./pages/payroll/Payslip";
import Recruitment from "./pages/features/Recruitment";
import Performance from "./pages/features/Performance";
import Asset from "./pages/features/Asset";
import Analytics from "./pages/features/Analytics";

import About from "./pages/company/About";
import Contact from "./pages/company/Contact";

import Company from "./pages/Company";
import Branch from "./pages/Branch";
import Role from "./pages/Role";
import Designation from "./pages/Designation";
import Department from "./pages/Department";
import PermissionPage from "./pages/PermissionPage";
import EmployeeTree from "./pages/EmployeeTree";


// Employee//
import Employee from "./pages/Employee";
import OfferLetterManagement from "./components/employee/OfferLetterManagement";
import ExperienceLetterManagement from "./components/employee/ExperienceLetterManagement";
import RelievingLetterManagement from "./components/employee/RelievingLetterManagement";
import WarningLetterManagement from "./components/employee/WarningLetterManagement";
import TerminationLetterManagement from "./components/employee/TerminationLetterManagement";
import EmployeeDocuments from "./components/employee/EmployeeDocuments";

// Employee Portal Pages //
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeLeave from "./pages/employee/Leave";
import EmployeeLeaveApply from "./pages/employee/LeaveApply";
import EmployeeLeaveHistory from "./pages/employee/LeaveHistory";
import EmployeeProfile from "./pages/employee/Profile";
import EmployeeAttendance from "./pages/employee/Attendance";
import EmployeePayroll from "./pages/employee/Payroll";
import EmployeeResignation from "./pages/employee/Resignation";

// Holiday//
import Holiday from "./pages/holiday/Holiday";
import HolidayCalendar from "./pages/holiday/HolidayCalendar";

// Leave//
import LeaveDashboard from "./pages/leave management/LeavePage";
import LeaveType from "./pages/leave management/LeaveType";
import LeaveRequest from "./pages/leave management/LeaveRequest";
import LeaveFeature from "./pages/features/Leave";

// Login History //
import LoginHistory from "./pages/LoginHistory";
import EmployeeLoginHistory from "./pages/employee/LoginHistory";

// Recruitment //
import ResumeAnalyser from "./pages/recruitment/ResumeAnalyser";
import InterviewScheduler from "./pages/recruitment/InterviewScheduler";

// Asset //
import AssetPage from "./pages/asset/AssetPage";
import EmployeeAsset from "./pages/employee/EmployeeAsset";
import TravelPage from "./pages/travel/TravelPage";
import EmployeeTravel from "./pages/employee/EmployeeTravel";

// ================= PROTECTED ROUTE =================
function ProtectedRoute({ children, requiredRole, requiredPermission }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "company";
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(requiredPermission && token ? true : false);

  useEffect(() => {
    if (!requiredPermission || !token) return;

    const fetchPermissions = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/permissions/my-permissions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const list = res.data.permissions || [];
        setPermissions(new Set(list));
      } catch (err) {
        console.error("Error checking route permission:", err);
        setPermissions(new Set());
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [token, requiredPermission]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === "employee" ? "/employee/dashboard" : "/dashboard"} replace />;
  }

  if (requiredPermission) {
    if (loading) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      );
    }
    if (permissions && !permissions.has(requiredPermission)) {
      alert(`Access Denied: You do not have permission to access this module ("${requiredPermission}").`);
      return <Navigate to={role === "employee" ? "/employee/dashboard" : "/dashboard"} replace />;
    }
  }

  return children;
}

// ================= APP CONTENT =================
function AppContent() {
  const location = useLocation();

  const authPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/auth/google/callback",
    "/dashboard",
    "/company",
    "/branch",
    "/role",
    "/designation",
    "/department",
    "/employee-tree",
    "/employees",
    "/login-history",
    "/offer-letters",
    "/experience-letters",
    "/relieving-letters",
    "/warning-letters",
    "/termination-letters",
    "/attendance",
    "/daily-tracking",
    "/shift",
    "/payroll",
    "/payroll/salary-details",
    "/payroll/payslip",
    "/holiday",
    "/holiday/calendar",
    "/leave-types",
    "/leave-requests",
    "/leave-dashboard",
    "/employee/dashboard",
    "/employee/leave",
    "/employee/leave/apply",
    "/employee/leave/history",
    "/employee/profile",
    "/employee/attendance",
    "/employee/documents",
    "/employee/payroll",
    "/employee/resignation",
    "/employee/login-history",
    "/resume-analyser",
    "/interview-scheduler",
    "/assets",
    "/employee/assets",
    "/travel",
    "/employee/travel",
    "/permissions",
  ];

  const hideLayout = authPages.includes(location.pathname);

  return (
    <>
      {/* NAVBAR */}
      {!hideLayout && <Navbar />}

      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/partner-with-us" element={<PartnerWithUs />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* ================= AUTH ROUTES ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ================= GOOGLE OAUTH CALLBACK ================= */}
        <Route path="/auth/google/callback" element={<GoogleSuccess />} />


        <Route path="/demo-form" element={<Demo />} />
        <Route
          path="/branch"
          element={
            <ProtectedRoute requiredRole="company">
              <Branch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/role"
          element={
            <ProtectedRoute requiredRole="company">
              <Role />
            </ProtectedRoute>
          }
        />
        <Route
          path="/designation"
          element={
            <ProtectedRoute requiredRole="company">
              <Designation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/department"
          element={
            <ProtectedRoute requiredRole="company">
              <Department />
            </ProtectedRoute>
          }
        />
        <Route
          path="/permissions"
          element={
            <ProtectedRoute requiredRole="company">
              <PermissionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-tree"
          element={
            <ProtectedRoute requiredRole="company">
              <Company />
            </ProtectedRoute>
          }
        />



        <Route
          path="/employees"
          element={
            <ProtectedRoute requiredRole="company">
              <Employee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offer-letters"
          element={
            <ProtectedRoute requiredRole="company">
              <OfferLetterManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/experience-letters"
          element={
            <ProtectedRoute requiredRole="company">
              <ExperienceLetterManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/relieving-letters"
          element={
            <ProtectedRoute requiredRole="company">
              <RelievingLetterManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warning-letters"
          element={
            <ProtectedRoute requiredRole="company">
              <WarningLetterManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/termination-letters"
          element={
            <ProtectedRoute requiredRole="company">
              <TerminationLetterManagement />
            </ProtectedRoute>
          }
        />
        {/* ================= PROTECTED DASHBOARD ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="company">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= PROTECTED EMPLOYEE PORTAL ================= */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute requiredRole="employee" requiredPermission="Dashboard View">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/leave"
          element={
            <ProtectedRoute requiredRole="employee" requiredPermission="Leave Management">
              <EmployeeLeave />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/leave/apply"
          element={
            <ProtectedRoute requiredRole="employee" requiredPermission="Leave Management">
              <EmployeeLeaveApply />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/leave/history"
          element={
            <ProtectedRoute requiredRole="employee" requiredPermission="Leave Management">
              <EmployeeLeaveHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/attendance"
          element={
            <ProtectedRoute requiredRole="employee" requiredPermission="Attendance Management">
              <EmployeeAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/documents"
          element={
            <ProtectedRoute requiredRole="employee" requiredPermission="Document Manager">
              <EmployeeDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/payroll"
          element={
            <ProtectedRoute requiredRole="employee" requiredPermission="Payroll & Invoicing">
              <EmployeePayroll />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/resignation"
          element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeResignation />
            </ProtectedRoute>
          }
        />

        {/* ================= PROTECTED COMPANY ================= */}
        <Route
          path="/company"
          element={
            <ProtectedRoute requiredRole="company">
              <Company />
            </ProtectedRoute>
          }
        />

        {/* ================= FEATURES (PUBLIC) ================= */}
        <Route path="/employee-management" element={<Employeee />} />
        <Route path="/attendance-management" element={<AttendanceLanding />} />
        <Route path="/leave-management" element={<LeaveFeature />} />
        <Route path="/payroll-management" element={<Payroll />} />
        <Route path="/recruitment-management" element={<Recruitment />} />
        <Route path="/performance-management" element={<Performance />} />
        <Route path="/asset-management" element={<Asset />} />
        <Route path="/analytics-management" element={<Analytics />} />

        {/* ================= PROTECTED ADMIN PORTAL ================= */}
        <Route
          path="/attendance"
          element={
            <ProtectedRoute requiredRole="company">
              <Attendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/daily-tracking"
          element={
            <ProtectedRoute requiredRole="company">
              <DailyTracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shift"
          element={
            <ProtectedRoute requiredRole="company">
              <Shift />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payroll"
          element={
            <ProtectedRoute requiredRole="company">
              <PayrollMain />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payroll/salary-details"
          element={
            <ProtectedRoute requiredRole="company">
              <SalaryDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payroll/payslip"
          element={
            <ProtectedRoute requiredRole="company">
              <PayslipList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/holiday"
          element={
            <ProtectedRoute requiredRole="company">
              <Holiday />
            </ProtectedRoute>
          }
        />

        <Route
          path="/holiday/calendar"
          element={
            <ProtectedRoute requiredRole="company">
              <HolidayCalendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leave-dashboard"
          element={
            <ProtectedRoute requiredRole="company">
              <LeaveDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leave-types"
          element={
            <ProtectedRoute requiredRole="company">
              <LeaveType />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leave-requests"
          element={
            <ProtectedRoute requiredRole="company">
              <LeaveRequest />
            </ProtectedRoute>
          }
        />

        {/* ================= LOGIN HISTORY ================= */}
        <Route
          path="/login-history"
          element={
            <ProtectedRoute requiredRole="company">
              <LoginHistory />
            </ProtectedRoute>
          }
        />

        {/* ================= EMPLOYEE LOGIN HISTORY ================= */}
        <Route
          path="/employee/login-history"
          element={
            <ProtectedRoute requiredRole="employee" requiredPermission="Login History logs">
              <EmployeeLoginHistory />
            </ProtectedRoute>
          }
        />

        {/* ================= RESUME ANALYSER ================= */}
        <Route
          path="/resume-analyser"
          element={
            <ProtectedRoute requiredRole="company">
              <ResumeAnalyser />
            </ProtectedRoute>
          }
        />

        {/* ================= INTERVIEW SCHEDULER ================= */}
        <Route
          path="/interview-scheduler"
          element={
            <ProtectedRoute requiredRole="company">
              <InterviewScheduler />
            </ProtectedRoute>
          }
        />

        {/* ================= ASSET MANAGEMENT ================= */}
        <Route
          path="/assets"
          element={
            <ProtectedRoute requiredRole="company">
              <AssetPage />
            </ProtectedRoute>
          }
        />

        {/* ================= EMPLOYEE ASSET VIEW ================= */}
        <Route
          path="/employee/assets"
          element={
            <ProtectedRoute requiredRole="employee" requiredPermission="Asset Management">
              <EmployeeAsset />
            </ProtectedRoute>
          }
        />

        {/* ================= TRAVEL REIMBURSEMENT ================= */}
        <Route
          path="/travel"
          element={
            <ProtectedRoute requiredRole="company">
              <TravelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/travel"
          element={
            <ProtectedRoute requiredRole="employee" requiredPermission="Travel Reimbursement">
              <EmployeeTravel />
            </ProtectedRoute>
          }
        />

      </Routes>

      {/* FOOTER */}
      {!hideLayout && <Footer />}
    </>
  );
}

// ================= MAIN APP =================
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}