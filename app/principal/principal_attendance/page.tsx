"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { Users, UserCheck, UserX, Calendar, AlertCircle, RefreshCw, Download } from "lucide-react";
import jsPDF from 'jspdf';

interface AttendanceRecord {
  id: number;
  student_email: string;
  email?: string; // General email field for all roles
  student_name: string;
  fullname?: string; // For teachers, admins, principals, etc.
  class_name: string;
  date: string;
  check_in: string;
  check_out: string | null;
  sec: string;
  status: "Present" | "Absent" | "Late" | string;
  role: string;
  marked_by_role: string;
  marked_by_email?: string;
  reason?: string;
  remarks?: string;
  department_name?: string;
}

interface ClassData {
  id: number;
  class_name: string;
  section: string;
}

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

const PrincipalAttendanceReport = () => {
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<AttendanceRecord[]>([]);
  const [presentStudents, setPresentStudents] = useState<AttendanceRecord[]>([]);
  const [absentStudents, setAbsentStudents] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [filterType, setFilterType] = useState<"day" | "week" | "month" | "year">("day");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "present" | "absent" | "students">("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");

  // Card Components
  const AttendanceCard = ({ record }: { record: AttendanceRecord }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "Present": return "bg-green-100 text-green-800 border-green-200";
        case "Absent": return "bg-red-100 text-red-800 border-red-200";
        case "Late": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "Present": return "✅";
        case "Absent": return "❌";
        case "Late": return "⏰";
        default: return "📝";
      }
    };

    const getRoleColor = (role: string) => {
      switch (role) {
        case "student": return "bg-blue-100 text-blue-800 border-blue-200";
        case "teacher": return "bg-purple-100 text-purple-800 border-purple-200";
        case "principal": return "bg-indigo-100 text-indigo-800 border-indigo-200";
        case "admin": return "bg-pink-100 text-pink-800 border-pink-200";
        case "management": return "bg-orange-100 text-orange-800 border-orange-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                {record.student_name || record.fullname || 'N/A'}
              </h3>
              <p className="text-gray-500 text-xs mt-1 truncate">
                {record.email || record.student_email || 'N/A'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(record.status)}`}>
                {getStatusIcon(record.status)} {record.status || 'N/A'}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getRoleColor(record.role)}`}>
                {record.role ? record.role.toUpperCase() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-3 flex-1">
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div>
                <span className="text-gray-500">Date:</span>
                <p className="font-medium text-gray-900">
                  {record.date ? new Date(record.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Class/Sec:</span>
                <p className="font-medium text-gray-900">
                  {record.class_name || 'N/A'} / {record.sec || 'N/A'}
                </p>
              </div>
            </div>
            
            {record.check_in && (
              <div className="text-xs text-gray-500">
                Check-in: {record.check_in}
              </div>
            )}
            
            {record.department_name && (
              <div className="text-xs text-gray-500">
                Department: {record.department_name}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t pt-3">
            <div className="text-xs text-gray-600">
              <div className="line-clamp-2">
                {record.reason || record.remarks || (
                  <span className="text-gray-400 italic">No remarks</span>
                )}
              </div>
              <div className="mt-1 text-gray-400">
                Marked by: {record.marked_by_role || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatsCard = ({ title, value, color, icon }: { title: string; value: string | number; color: "blue" | "green" | "red" | "yellow"; icon: React.ReactNode }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600", 
      red: "from-red-500 to-red-600",
      yellow: "from-yellow-500 to-yellow-600"
    };

    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-xs sm:text-sm font-medium">{title}</p>
            <p className={`text-xl sm:text-2xl font-bold mt-1 sm:mt-2 ${
              color === 'green' ? 'text-green-600' :
              color === 'red' ? 'text-red-600' :
              color === 'yellow' ? 'text-yellow-600' : 'text-gray-900'
            }`}>
              {value}
            </p>
          </div>
          <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg sm:rounded-xl flex items-center justify-center text-white text-sm sm:text-lg`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  // Rest of your existing logic remains exactly the same...
  // ✅ Fetch all attendance (all departments) with proper error handling
  const fetchAttendance = async () => {
    console.log("🔍 Fetching all attendance records...");
    
    try {
      setLoading(true);
      setError("");
      
      // Fetch attendance for all departments (student, teacher, principal, admin, management)
      console.log("📥 Fetching attendance and teachers data...");
      const [attendanceRes, teachersRes] = await Promise.all([
        axios.get(`${API_BASE}/attendance/`),
        axios.get(`${API_BASE}/teachers/`)
      ]);
      
      console.log("📥 Attendance response:", attendanceRes.data);
      console.log("📥 Teachers response:", teachersRes.data);
      
      if (Array.isArray(attendanceRes.data)) {
        // Create a map of teacher emails to their details (fullname and department)
        const teacherMap = new Map<string, { fullname: string; department_name: string; email: string }>();
        if (Array.isArray(teachersRes.data)) {
          teachersRes.data.forEach((teacher: any) => {
            const teacherEmail = teacher.email || teacher.user_details?.email;
            if (!teacherEmail) return;

            teacherMap.set(teacherEmail, {
              fullname:
                teacher.fullname ||
                teacher.name ||
                teacher.user_details?.fullname ||
                "",
              department_name:
                teacher.department_name ||
                teacher.department ||
                "",
              email: teacherEmail,
            });
          });
        }
        console.log("📚 Teacher map created with", teacherMap.size, "entries");

        // Merge teacher details into attendance records
        const attendanceData = attendanceRes.data.map((record: any) => {
          // Try to match by email or student_email
          const emailToMatch = record.email || record.student_email || record.user_email;
          const teacherInfo = emailToMatch ? teacherMap.get(emailToMatch) : undefined;

          const mergedFullname =
            teacherInfo?.fullname ||
            record.fullname ||
            record.student_name ||
            record.name ||
            record.user_details?.fullname ||
            "";

          const mergedDepartment =
            teacherInfo?.department_name ||
            record.department_name ||
            record.department ||
            record.class_name ||
            "";

          const mergedEmail =
            teacherInfo?.email ||
            record.email ||
            record.student_email ||
            record.user_email ||
            "";

          const mergedRecord = {
            ...record,
            fullname: mergedFullname,
            email: mergedEmail,
            department_name: mergedDepartment,
          };
          
          console.log("📄 Merged attendance record:", mergedRecord);
          return mergedRecord;
        });
        
        setAllAttendance(attendanceData);
        console.log("✅ All attendance set with", attendanceData.length, "records");
        
        // Separate present and absent
        const present = attendanceData.filter(student => {
          const isPresent = student.status === "Present";
          console.log(`🔍 Filtering present - Status: ${student.status}, Is present: ${isPresent}`);
          return isPresent;
        });
        
        const absent = attendanceData.filter(student => {
          const isAbsent = student.status === "Absent";
          console.log(`🔍 Filtering absent - Status: ${student.status}, Is absent: ${isAbsent}`);
          return isAbsent;
        });
        
        setPresentStudents(present);
        setAbsentStudents(absent);
        console.log(`✅ Present: ${present.length}, Absent: ${absent.length}`);
      } else {
        console.error("❌ Unexpected API response format:", attendanceRes.data);
        setError("Received invalid data format from server");
      }
    } catch (error: any) {
      console.error("❌ Error fetching attendance:", error);
      setError(error.response?.data?.message || "Failed to fetch attendance data");
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log("🏁 Attendance fetch completed");
    }
  };

  // ✅ Fetch student-only attendance
  const fetchStudentAttendance = async () => {
    console.log("🔍 Fetching student-only attendance...");
    
    try {
      setLoading(true);
      setError("");
      
      // Fetch student attendance only
      console.log("📥 Fetching student attendance data...");
      const res = await axios.get(`${API_BASE}/student_attendance/`);
      console.log("📥 Student attendance response:", res.data);
      
      if (Array.isArray(res.data)) {
        const studentData = res.data.map(record => {
          const mappedRecord = {
            ...record,
            role: "student",
            student_email: record.student || "",
            sec: record.section || "",
            check_in: record.created_time || "",
            check_out: null,
            marked_by_role: "teacher",
            marked_by_email: record.teacher || ""
          };
          
          console.log("📄 Mapped student record:", mappedRecord);
          return mappedRecord;
        });
        
        setStudentAttendance(studentData);
        console.log("✅ Student attendance set with", studentData.length, "records");
      } else {
        console.error("❌ Unexpected API response format:", res.data);
        setError("Received invalid data format from server");
      }
    } catch (error: any) {
      console.error("❌ Error fetching student attendance:", error);
      setError(error.response?.data?.message || "Failed to fetch student attendance data");
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log("🏁 Student attendance fetch completed");
    }
  };

  // ✅ Fetch classes and sections
  const fetchClasses = async () => {
    console.log("🔍 Fetching classes...");
    
    try {
      console.log("📥 Fetching classes data...");
      const res = await axios.get(`${API_BASE}/classes/`);
      console.log("📥 Classes response:", res.data);
      
      if (Array.isArray(res.data)) {
        setClasses(res.data);
        console.log("✅ Classes set with", res.data.length, "records");
      }
    } catch (error: any) {
      console.error("❌ Error fetching classes:", error);
    }
  };

  useEffect(() => {
    console.log("🔄 Initializing attendance data...");
    fetchAttendance();
    fetchStudentAttendance();
    fetchClasses();
  }, []);

  // ✅ Refresh function
  const handleRefresh = async () => {
    console.log("🔄 Refreshing attendance data...");
    setRefreshing(true);
    
    if (activeTab === "students") {
      await fetchStudentAttendance();
    } else {
      await fetchAttendance();
    }
    
    console.log("✅ Refresh completed");
  };

  // ✅ PROFESSIONAL PDF GENERATION FUNCTION
  const generatePDF = () => {
    setRefreshing(true);
    
    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      
      // Use filteredData for PDF generation
      const pdfData = filteredData.length > 0 ? filteredData : allAttendance;
      const pdfPresent = pdfData.filter(s => s.status === "Present");
      const pdfAbsent = pdfData.filter(s => s.status === "Absent");
      const pdfLate = pdfData.filter(s => s.status === "Late");
      
      // Colors for professional design
      const colors = {
        primary: [41, 128, 185] as [number, number, number],
        success: [39, 174, 96] as [number, number, number],
        danger: [231, 76, 60] as [number, number, number],
        warning: [243, 156, 18] as [number, number, number],
        dark: [44, 62, 80] as [number, number, number],
        light: [241, 242, 246] as [number, number, number]
      };

      // Helper function to add section headers
      const addSectionHeader = (title: string, y: number) => {
        pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
        pdf.rect(margin, y, contentWidth, 12, 'F');
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFontSize(14);
        pdf.text(title, margin + 5, y + 8);
        return y + 15;
      };

      // Helper function to add statistics card
      const addStatCard = (label: string, value: string, color: [number, number, number], x: number, y: number, width: number) => {
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.rect(x, y, width, 25, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.text(value, x + (width / 2), y + 12, { align: 'center' });
        pdf.setFontSize(8);
        pdf.text(label.toUpperCase(), x + (width / 2), y + 20, { align: 'center' });
      };

      // Helper function to add table
      const addTable = (headers: string[], rows: string[][], startY: number) => {
        const rowHeight = 10;
        const colWidths = [50, 35, 30, 25, 30];
        
        // Table header
        pdf.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.rect(margin, startY, contentWidth, rowHeight, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        
        let xPos = margin + 2;
        headers.forEach((header, index) => {
          pdf.text(header, xPos, startY + 7);
          xPos += colWidths[index] || 30;
        });
        
        // Table rows
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(8);
        
        let currentY = startY + rowHeight;
        
        rows.forEach((row, rowIndex) => {
          if (currentY > pageHeight - 20) {
            pdf.addPage();
            currentY = 20;
            
            // Add header on new page
            pdf.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
            pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(9);
            
            let xPos = margin + 2;
            headers.forEach((header, index) => {
              pdf.text(header, xPos, currentY + 7);
              xPos += colWidths[index] || 30;
            });
            
            currentY += rowHeight;
            pdf.setTextColor(0, 0, 0);
          }
          
          // Alternate row colors
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
            pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
          }
          
          let xPos = margin + 2;
          row.forEach((cell, cellIndex) => {
            pdf.text(cell, xPos, currentY + 7);
            xPos += colWidths[cellIndex] || 30;
          });
          
          currentY += rowHeight;
        });
        
        return currentY + 10;
      };

      // 📄 COVER PAGE
      pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.rect(0, 0, pageWidth, 80, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text('ATTENDANCE REPORT', pageWidth / 2, 40, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.text('Comprehensive Attendance Analysis', pageWidth / 2, 55, { align: 'center' });
      
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })}`, pageWidth / 2, 120, { align: 'center' });
      
      let filterInfo = `Filter: ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`;
      if (filterType === 'month' || filterType === 'year') {
        filterInfo += ` | ${months[selectedMonth - 1]} ${selectedYear}`;
      }
      if (activeTab === 'students' && selectedClass) {
        filterInfo += ` | Class: ${selectedClass}`;
        if (selectedSection) {
          filterInfo += ` - ${selectedSection}`;
        }
      }
      pdf.text(filterInfo, pageWidth / 2, 135, { align: 'center' });

      // 📊 EXECUTIVE SUMMARY PAGE
      pdf.addPage();
      yPosition = 20;
      
      yPosition = addSectionHeader('EXECUTIVE SUMMARY', yPosition);
      
      // Overall statistics from filtered data
      const totalRecords = pdfData.length;
      const totalPresent = pdfPresent.length;
      const totalAbsent = pdfAbsent.length;
      const totalLate = pdfLate.length;
      const overallPercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
      
      // Statistics cards
      const cardWidth = (contentWidth - 15) / 4;
      addStatCard('Total Records', totalRecords.toString(), colors.primary, margin, yPosition, cardWidth);
      addStatCard('Present', totalPresent.toString(), colors.success, margin + cardWidth + 5, yPosition, cardWidth);
      addStatCard('Absent', totalAbsent.toString(), colors.danger, margin + (cardWidth * 2) + 10, yPosition, cardWidth);
      addStatCard('Late', totalLate.toString(), colors.warning, margin + (cardWidth * 3) + 15, yPosition, cardWidth);
      
      yPosition += 35;
      
      // Attendance Rate Gauge
      pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
      pdf.rect(margin, yPosition, contentWidth, 40, 'F');
      
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(16);
      pdf.text(`Overall Attendance Rate: ${overallPercentage}%`, margin + 10, yPosition + 15);
      
      // Progress bar
      const barWidth = contentWidth - 20;
      pdf.setFillColor(200, 200, 200);
      pdf.rect(margin + 10, yPosition + 25, barWidth, 8, 'F');
      
      const progressWidth = (barWidth * overallPercentage) / 100;
      if (overallPercentage >= 80) {
        pdf.setFillColor(colors.success[0], colors.success[1], colors.success[2]);
      } else if (overallPercentage >= 60) {
        pdf.setFillColor(colors.warning[0], colors.warning[1], colors.warning[2]);
      } else {
        pdf.setFillColor(colors.danger[0], colors.danger[1], colors.danger[2]);
      }
      pdf.rect(margin + 10, yPosition + 25, progressWidth, 8, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('0%', margin + 10, yPosition + 40);
      pdf.text('100%', margin + 10 + barWidth - 15, yPosition + 40);
      
      yPosition += 50;

      // Class-wise Breakdown
      const classBreakdown = pdfData.reduce((acc: any, student) => {
        const className = student.class_name || 'Unknown Class';
        if (!acc[className]) {
          acc[className] = { present: 0, absent: 0, total: 0 };
        }
        acc[className].total++;
        if (student.status === "Present") acc[className].present++;
        if (student.status === "Absent") acc[className].absent++;
        return acc;
      }, {});

      yPosition = addSectionHeader('CLASS-WISE BREAKDOWN', yPosition);
      
      pdf.setFontSize(10);
      let classY = yPosition;
      
      Object.keys(classBreakdown).forEach(className => {
        if (classY > pageHeight - 30) {
          pdf.addPage();
          classY = 20;
          yPosition = 20;
        }
        
        const classData = classBreakdown[className];
        const classPercentage = classData.total > 0 ? Math.round((classData.present / classData.total) * 100) : 0;
        
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFontSize(10);
        pdf.text(className, margin, classY);
        
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Present: ${classData.present} | Absent: ${classData.absent} | Total: ${classData.total} | Rate: ${classPercentage}%`, 
                 margin + 50, classY);
        
        classY += 8;
      });
      
      yPosition = classY + 10;

      // ✅ DETAILED ATTENDANCE RECORDS
      if (pdfData.length > 0) {
        pdf.addPage();
        yPosition = 20;
        
        yPosition = addSectionHeader('DETAILED ATTENDANCE RECORDS', yPosition);
        
        const tableHeaders = ['Name', 'Role', 'Class/Sec', 'Date', 'Status'];
        const tableRows = pdfData.slice(0, 50).map(student => [
          student.student_name?.substring(0, 18) || 'N/A',
          (student.role || 'N/A').substring(0, 8),
          `${student.class_name?.substring(0, 6) || 'N/A'}/${student.sec || 'N/A'}`,
          student.date ? new Date(student.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : 'N/A',
          student.status || 'N/A'
        ]);
        
        yPosition = addTable(tableHeaders, tableRows, yPosition);
      }

      // 📈 PRESENT STUDENTS ANALYSIS
      if (pdfPresent.length > 0) {
        pdf.addPage();
        yPosition = 20;
        
        yPosition = addSectionHeader('PRESENT STUDENTS ANALYSIS', yPosition);
        
        const presentHeaders = ['Name', 'Role', 'Class', 'Date', 'Check-in'];
        const presentRows = pdfPresent.slice(0, 40).map(student => [
          student.student_name?.substring(0, 18) || 'N/A',
          (student.role || 'N/A').substring(0, 8),
          student.class_name?.substring(0, 10) || 'N/A',
          student.date ? new Date(student.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : 'N/A',
          student.check_in || 'N/A'
        ]);
        
        yPosition = addTable(presentHeaders, presentRows, yPosition);
      }

      // ⚠️ ABSENT STUDENTS ANALYSIS
      if (pdfAbsent.length > 0) {
        pdf.addPage();
        yPosition = 20;
        
        yPosition = addSectionHeader('ABSENT STUDENTS ANALYSIS', yPosition);
        
        const absentHeaders = ['Name', 'Role', 'Class', 'Date', 'Reason'];
        const absentRows = pdfAbsent.slice(0, 40).map(student => [
          student.student_name?.substring(0, 18) || 'N/A',
          (student.role || 'N/A').substring(0, 8),
          student.class_name?.substring(0, 10) || 'N/A',
          student.date ? new Date(student.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : 'N/A',
          (student.reason || student.remarks || 'No reason').substring(0, 20)
        ]);
        
        yPosition = addTable(absentHeaders, absentRows, yPosition);
      }

      // 📝 CONCLUSION PAGE
      pdf.addPage();
      yPosition = 20;
      
      yPosition = addSectionHeader('REPORT SUMMARY & CONCLUSIONS', yPosition);
      
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(11);
      
      const conclusions = [
        `• Total attendance records analyzed: ${totalRecords}`,
        `• Overall attendance rate: ${overallPercentage}%`,
        `• Present: ${totalPresent} (${totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0}%)`,
        `• Absent: ${totalAbsent} (${totalRecords > 0 ? Math.round((totalAbsent / totalRecords) * 100) : 0}%)`,
        `• Late arrivals: ${totalLate} (${totalRecords > 0 ? Math.round((totalLate / totalRecords) * 100) : 0}%)`,
        `• Report period: ${months[selectedMonth - 1]} ${selectedYear}`,
        `• Data filter: ${filterType.charAt(0).toUpperCase() + filterType.slice(1)} view`,
        activeTab === 'students' && selectedClass ? `• Class filter: ${selectedClass}${selectedSection ? ` - ${selectedSection}` : ''}` : '',
        `• Report generated on: ${new Date().toLocaleDateString()}`
      ].filter(line => line);
      
      conclusions.forEach((line, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, margin + 5, yPosition);
        yPosition += 8;
      });
      
      yPosition += 15;
      
      // Recommendations based on attendance rate
      pdf.setFontSize(12);
      pdf.text('RECOMMENDATIONS:', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      let recommendation = '';
      if (overallPercentage >= 90) {
        recommendation = 'Excellent attendance rate! Maintain current monitoring practices.';
      } else if (overallPercentage >= 75) {
        recommendation = 'Good attendance rate. Consider following up with frequently absent users.';
      } else if (overallPercentage >= 60) {
        recommendation = 'Moderate attendance rate. Recommended to implement attendance improvement strategies.';
      } else {
        recommendation = 'Low attendance rate. Immediate intervention and communication recommended.';
      }
      
      pdf.text(recommendation, margin + 5, yPosition);
      yPosition += 15;
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('This report was generated automatically by School Management System', 
               pageWidth / 2, pageHeight - 10, { align: 'center' });
      pdf.text('Confidential - For authorized use only', 
               pageWidth / 2, pageHeight - 5, { align: 'center' });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Attendance-Report-${timestamp}.pdf`;
      
      // Save PDF
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate professional PDF report');
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ Calculate attendance statistics based on active tab
  const getDisplayData = () => {
    switch (activeTab) {
      case "present":
        return presentStudents;
      case "absent":
        return absentStudents;
      case "students":
        // Use dedicated student attendance endpoint data
        return studentAttendance;
      default:
        return allAttendance;
    }
  };

  const displayData = getDisplayData();

  const stats = {
    totalRecords: filteredData.length,
    present: filteredData.filter(item => item.status === "Present").length,
    absent: filteredData.filter(item => item.status === "Absent").length,
    late: filteredData.filter(item => item.status === "Late").length,
    presentPercentage: filteredData.length > 0 ? 
      Math.round((filteredData.filter(item => item.status === "Present").length / filteredData.length) * 100) : 0
  };

  // ✅ Get unique classes from student attendance
  const allStudentRecords = studentAttendance.length > 0 ? studentAttendance : allAttendance.filter(record => record.role === "student");
  const uniqueClasses = [...new Set(allStudentRecords
    .map(record => record.class_name)
    .filter(Boolean)
  )].sort();

  // ✅ Get unique sections for selected class from all student records
  const uniqueSections = selectedClass
    ? [...new Set(allStudentRecords
        .filter(record => record.class_name === selectedClass)
        .map(record => record.sec)
        .filter(Boolean)
      )].sort()
    : [];

  // Month and Year options
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // ✅ Filter by day/week/month/year with proper date handling
  useEffect(() => {
    const filterByTime = (data: AttendanceRecord[], type: typeof filterType) => {
      if (!Array.isArray(data) || data.length === 0) return [];
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      return data.filter((a) => {
        if (!a.date) return false;
        
        try {
          const date = new Date(a.date);
          if (isNaN(date.getTime())) return false;
          
          switch (type) {
            case "day":
              const recordDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              return recordDate.getTime() === today.getTime();
            case "week": {
              const firstDayOfWeek = new Date(today);
              firstDayOfWeek.setDate(today.getDate() - today.getDay());
              const lastDayOfWeek = new Date(firstDayOfWeek);
              lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
              return date >= firstDayOfWeek && date <= lastDayOfWeek;
            }
            case "month":
              return date.getFullYear() === selectedYear && date.getMonth() + 1 === selectedMonth;
            case "year":
              return date.getFullYear() === selectedYear;
            default:
              return true;
          }
        } catch (err) {
          console.error("Error parsing date:", a.date, err);
          return false;
        }
      });
    };

    let filtered = filterByTime(displayData, filterType);
    
    // Apply class and section filters for students tab
    if (activeTab === "students") {
      if (selectedClass) {
        filtered = filtered.filter(record => record.class_name === selectedClass);
      }
      if (selectedSection) {
        filtered = filtered.filter(record => record.sec === selectedSection);
      }
    }
    
    setFilteredData(filtered);
  }, [allAttendance, studentAttendance, presentStudents, absentStudents, filterType, activeTab, selectedMonth, selectedYear, selectedClass, selectedSection]);

  // ✅ Loading state
  if (loading) {
    return (
      <DashboardLayout role="principal">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading attendance records...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ✅ Error state
  if (error && allAttendance.length === 0) {
    return (
      <DashboardLayout role="principal">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="principal">
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50/30 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            {/* Back Button */}
            <div className="flex justify-start mb-3 sm:mb-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Student Attendance</h1>
                <p className="text-gray-600 text-sm sm:text-base">View and monitor student attendance records</p>
              </div>
              <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-0">
                <button
                  onClick={generatePDF}
                  disabled={refreshing || allAttendance.length === 0}
                  className="px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg sm:rounded-xl font-medium flex items-center gap-2 transition-colors text-sm sm:text-base"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  {refreshing ? 'Generating...' : 'Export PDF'}
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg sm:rounded-xl font-medium flex items-center gap-2 transition-colors text-sm sm:text-base"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <StatsCard 
              title="Total Records" 
              value={stats.totalRecords} 
              color="blue" 
              icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}
            />
            <StatsCard 
              title="Present" 
              value={stats.present} 
              color="green" 
              icon={<UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />}
            />
            <StatsCard 
              title="Absent" 
              value={stats.absent} 
              color="red" 
              icon={<UserX className="h-4 w-4 sm:h-5 sm:w-5" />}
            />
            <StatsCard 
              title="Late" 
              value={stats.late} 
              color="yellow" 
              icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5" />}
            />
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setSelectedClass("");
                  setSelectedSection("");
                }}
                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm ${
                  activeTab === "all" 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Attendance ({allAttendance.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("students");
                  setSelectedClass("");
                  setSelectedSection("");
                  fetchStudentAttendance(); // Fetch student-specific data
                }}
                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm ${
                  activeTab === "students" 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🎓 Students ({studentAttendance.length > 0 ? studentAttendance.length : allAttendance.filter(r => r.role === "student").length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("present");
                  setSelectedClass("");
                  setSelectedSection("");
                }}
                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm ${
                  activeTab === "present" 
                    ? "bg-green-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ✅ Present ({presentStudents.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("absent");
                  setSelectedClass("");
                  setSelectedSection("");
                }}
                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm ${
                  activeTab === "absent" 
                    ? "bg-red-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ❌ Absent ({absentStudents.length})
              </button>
            </div>

            {/* Class and Section Filters - Show only for Students tab */}
            {activeTab === "students" && (
              <div className="border-t pt-4 sm:pt-6 mb-4 sm:mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Class Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Filter by Class
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setSelectedSection(""); // Reset section when class changes
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm sm:text-base"
                    >
                      <option value="">All Classes</option>
                      {uniqueClasses.map((className) => (
                        <option key={className} value={className}>
                          {className}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Filter by Section
                    </label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      disabled={!selectedClass}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      <option value="">All Sections</option>
                      {uniqueSections.map((section) => (
                        <option key={section} value={section}>
                          {section}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Date Filters */}
            <div className={`${activeTab === "students" ? "" : "border-t"} pt-4 sm:pt-6`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Filter Type Buttons */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Filter Range
                  </label>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setFilterType("day")}
                      className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs font-medium border transition-colors ${
                        filterType === "day"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType("week")}
                      className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs font-medium border transition-colors ${
                        filterType === "week"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      This Week
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType("month")}
                      className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs font-medium border transition-colors ${
                        filterType === "month"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      This Month
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType("year")}
                      className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs font-medium border transition-colors ${
                        filterType === "year"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      This Year
                    </button>
                  </div>
                </div>

                {/* Month Dropdown */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Select Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(parseInt(e.target.value));
                      setFilterType("month");
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Dropdown */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Select Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(parseInt(e.target.value));
                      setFilterType("month");
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && allAttendance.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                <p className="text-yellow-800 text-sm sm:text-base">{error}</p>
              </div>
            </div>
          )}

          {/* Attendance Cards Grid */}
          <div className="bg-transparent">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 sm:py-16 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  {allAttendance.length === 0 ? "No Attendance Records" : "No Records Found"}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
                  {allAttendance.length === 0 
                    ? "No attendance records are available in the system."
                    : `No attendance records found for the selected ${activeTab} students in the current ${filterType}.`
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {filteredData.map((record) => (
                  <AttendanceCard key={record.id} record={record} />
                ))}
              </div>
            )}
          </div>

          {/* Summary Footer */}
          {filteredData.length > 0 && (
            <div className="mt-4 sm:mt-6 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredData.length}</span> of{" "}
                    <span className="font-semibold">{displayData.length}</span> {activeTab} students
                    {activeTab !== "all" && ` (from ${allAttendance.length} total records)`}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                      <span>Present: {stats.present}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                      <span>Absent: {stats.absent}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                      <span>Late: {stats.late}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Generation Loading Overlay */}
      {refreshing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-2 sm:gap-3 min-w-[180px] sm:min-w-[200px]">
            <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600" />
            <p className="text-gray-700 font-medium text-sm sm:text-base">Generating PDF Report...</p>
            <p className="text-xs sm:text-sm text-gray-500 text-center">Please wait</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PrincipalAttendanceReport;