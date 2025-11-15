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

  // ✅ Fetch all attendance (all departments) with proper error handling
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch attendance for all departments (student, teacher, principal, admin, management)
      const [attendanceRes, teachersRes] = await Promise.all([
        axios.get(`${API_BASE}/attendance/`),
        axios.get(`${API_BASE}/teachers/`)
      ]);
      
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

          return {
            ...record,
            fullname: mergedFullname,
            email: mergedEmail,
            department_name: mergedDepartment,
          };
        });
        
        setAllAttendance(attendanceData);
        
        // Separate present and absent
        const present = attendanceData.filter(student => student.status === "Present");
        const absent = attendanceData.filter(student => student.status === "Absent");
        
        setPresentStudents(present);
        setAbsentStudents(absent);
      } else {
        console.error("Unexpected API response format:", attendanceRes.data);
        setError("Received invalid data format from server");
      }
    } catch (error: any) {
      console.error("Error fetching attendance:", error);
      setError(error.response?.data?.message || "Failed to fetch attendance data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Fetch student-only attendance
  const fetchStudentAttendance = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch student attendance only
      const res = await axios.get(`${API_BASE}/student_attendance/`);
      
      if (Array.isArray(res.data)) {
        const studentData = res.data.map(record => ({
          ...record,
          role: "student",
          student_email: record.student || "",
          sec: record.section || "",
          check_in: record.created_time || "",
          check_out: null,
          marked_by_role: "teacher",
          marked_by_email: record.teacher || ""
        }));
        setStudentAttendance(studentData);
      } else {
        console.error("Unexpected API response format:", res.data);
        setError("Received invalid data format from server");
      }
    } catch (error: any) {
      console.error("Error fetching student attendance:", error);
      setError(error.response?.data?.message || "Failed to fetch student attendance data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Fetch classes and sections
  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/classes/`);
      if (Array.isArray(res.data)) {
        setClasses(res.data);
      }
    } catch (error: any) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchStudentAttendance();
    fetchClasses();
  }, []);

  // ✅ Refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "students") {
      await fetchStudentAttendance();
    } else {
      await fetchAttendance();
    }
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
      <div className="p-6 bg-gray-50/30 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Attendance</h1>
                <p className="text-gray-600">View and monitor student attendance records</p>
              </div>
              <div className="flex gap-3 mt-4 sm:mt-0">
                <button
                  onClick={generatePDF}
                  disabled={refreshing || allAttendance.length === 0}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  {refreshing ? 'Generating...' : 'Export PDF'}
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalRecords}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">{stats.present}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-sm text-green-600">{stats.presentPercentage}% attendance rate</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">{stats.absent}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Late</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.late}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setSelectedClass("");
                  setSelectedSection("");
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
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
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "students" 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🎓 Students Only ({studentAttendance.length > 0 ? studentAttendance.length : allAttendance.filter(r => r.role === "student").length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("present");
                  setSelectedClass("");
                  setSelectedSection("");
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
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
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
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
              <div className="border-t pt-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Class Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Class
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setSelectedSection(""); // Reset section when class changes
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Section
                    </label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      disabled={!selectedClass}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            <div className={`${activeTab === "students" ? "" : "border-t"} pt-6`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filter Type Buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter Range
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setFilterType("day")}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
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
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
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
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
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
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(parseInt(e.target.value));
                      setFilterType("month");
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(parseInt(e.target.value));
                      setFilterType("month");
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800">{error}</p>
              </div>
            </div>
          )}

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredData.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {allAttendance.length === 0 ? "No Attendance Records" : "No Records Found"}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {allAttendance.length === 0 
                    ? "No attendance records are available in the system."
                    : `No attendance records found for the selected ${activeTab} students in the current ${filterType}.`
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {activeTab === "all" ? (
                        // Columns for All Attendance tab
                        <>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Remarks
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Department
                          </th>
                        </>
                      ) : (
                        // Columns for Students/Present/Absent tabs
                        <>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Class / Section
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Reason/Remarks
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredData.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        {activeTab === "all" ? (
                          // Row for All Attendance tab
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {student.fullname }
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {student.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                student.role === "student" 
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : student.role === "teacher"
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : student.role === "principal"
                                  ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                  : student.role === "admin"
                                  ? "bg-pink-100 text-pink-800 border border-pink-200"
                                  : student.role === "management"
                                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                                  : "bg-gray-100 text-gray-800 border border-gray-200"
                              }`}>
                                {student.role ? student.role.toUpperCase() : 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">
                                {student.date ? new Date(student.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                }) : 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {student.check_in && `Check-in: ${student.check_in}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                student.status === "Present" 
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : student.status === "Absent"
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              }`}>
                                {student.status === "Present" && "✅ "}
                                {student.status === "Absent" && "❌ "}
                                {student.status === "Late" && "⏰ "}
                                {student.status || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-700 max-w-xs">
                                <div className="truncate">
                                  {student.reason || student.remarks || (
                                    <span className="text-gray-400 italic">No remarks</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">
                                {student.department_name || (
                                  <span className="text-gray-400 italic">N/A</span>
                                )}
                              </div>
                              {student.sec && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Section: {student.sec}
                                </div>
                              )}
                            </td>
                          </>
                        ) : (
                          // Row for Students/Present/Absent tabs (unchanged)
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {student.student_name || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {student.student_email || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                student.role === "student" 
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : student.role === "teacher"
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : student.role === "principal"
                                  ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                  : student.role === "admin"
                                  ? "bg-pink-100 text-pink-800 border border-pink-200"
                                  : student.role === "management"
                                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                                  : "bg-gray-100 text-gray-800 border border-gray-200"
                              }`}>
                                {student.role ? student.role.toUpperCase() : 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">
                                {`${student.class_name || 'N/A'} / ${student.sec || 'N/A'}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">
                                {student.date ? new Date(student.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                }) : 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {student.check_in && `Check-in: ${student.check_in}`}
                                {student.check_out && ` | Check-out: ${student.check_out}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                student.status === "Present" 
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : student.status === "Absent"
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              }`}>
                                {student.status === "Present" && "✅ "}
                                {student.status === "Absent" && "❌ "}
                                {student.status === "Late" && "⏰ "}
                                {student.status || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              <div className="max-w-xs">
                                <div className="truncate">
                                  {student.reason || student.remarks || (
                                    <span className="text-gray-400 italic">No reason</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Marked by: {student.marked_by_role || 'N/A'}
                                </div>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Footer */}
          {filteredData.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredData.length}</span> of{" "}
                    <span className="font-semibold">{displayData.length}</span> {activeTab} students
                    {activeTab !== "all" && ` (from ${allAttendance.length} total records)`}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Present: {stats.present}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Absent: {stats.absent}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
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
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 min-w-[200px]">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-700 font-medium">Generating PDF Report...</p>
            <p className="text-sm text-gray-500 text-center">Please wait</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PrincipalAttendanceReport;