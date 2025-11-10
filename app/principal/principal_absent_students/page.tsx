"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import axios from "axios";
import { 
  Calendar, 
  Users, 
  TrendingDown, 
  Filter,
  Download,
  RefreshCw
} from "lucide-react";

interface Absentee {
  id?: number;
  name: string;
  date: string;
  class?: string;
  section?: string;
}

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

const AbsentStudentsReport = () => {
  const [attendance, setAttendance] = useState([]);
const [filteredAbsentees, setFilteredAbsentees] = useState<Absentee[]>([]);
  const [filterType, setFilterType] = useState("day");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
const [selectedYear, setSelectedYear] = useState("");
const [selectedMonth, setSelectedMonth] = useState("");



  // ✅ Get date range based on filter
  const getDateRange = (type: string) => {
    const today = new Date();
    let startDate = new Date();

    switch (type) {
      case "week":
        startDate.setDate(today.getDate() - 6);
        break;
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    return { startDate, endDate: today };
  };

  // ✅ Filter absentees based on filter type
 const filterAbsentees = (data: any[]) => {
  return data.filter((item: any) => {
    const recordDate = new Date(item.date);
    const isAbsent = item.status?.toLowerCase() === "absent";

    const matchesYear = selectedYear
      ? recordDate.getFullYear().toString() === selectedYear
      : true;

    const matchesMonth =
      selectedMonth !== ""
        ? recordDate.getMonth() === Number(selectedMonth)
        : true;

    return isAbsent && matchesYear && matchesMonth;
  });
};

useEffect(() => {
  if (attendance.length > 0) {
    const filtered = filterAbsentees(attendance);
    setFilteredAbsentees(filtered);
  }
}, [attendance, selectedYear, selectedMonth]);



  // ✅ Fetch Attendance
  const fetchAttendance = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${API_BASE}/attendance/`);
      setAttendance(res.data || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ✅ Apply filter whenever attendance or filterType changes
 useEffect(() => {
  if (attendance.length > 0) {
    const filtered = filterAbsentees(attendance);
    setFilteredAbsentees(filtered);
  }
}, [attendance, selectedYear, selectedMonth]);


  // ✅ Export to CSV
  const exportToCSV = () => {
    const headers = ["Date", "Student Name", "Class", "Section", "Reason"];
    const csvData = filteredAbsentees.map((att: any) => [
      att.date,
      att.student_name || "N/A",
      att.class_name || "-",
      att.section || "-",
      att.reason || "—"
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `absent-students-${filterType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout role="principal">
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-lg">Loading attendance data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="principal">
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-red-500" />
              Absent Students Report
            </h1>
            <p className="text-gray-600">Monitor and track student attendance patterns</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{attendance.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Filter</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">{filterType}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent Students</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{filteredAbsentees.length}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <Users className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {attendance.length > 0 
                    ? `${Math.round(((attendance.length - filteredAbsentees.length) / attendance.length) * 100)}%`
                    : "0%"
                  }
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingDown className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <Filter className="w-5 h-5 text-gray-600" />
      Filter Absentees
    </h2>
  </div>

  {/* 🎯 Year & Month Selectors */}
  <div className="flex flex-wrap gap-6 mb-4">
    {/* Year Dropdown */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Select Year</label>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Years</option>
        {[2023, 2024, 2025, 2026].map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>

    {/* Month Dropdown */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Select Month</label>
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Months</option>
        {[
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ].map((month, index) => (
          <option key={month} value={index}>
            {month}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* Info Summary */}
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Users className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <p className="text-blue-800 font-medium">
          Showing absentees for{" "}
          {selectedMonth !== ""
            ? [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ][Number(selectedMonth)]
            : "all months"}{" "}
          {selectedYear || "all years"}
        </p>
        <p className="text-blue-600 text-sm">
          Found <span className="font-bold text-blue-800">{filteredAbsentees.length}</span> student(s)
        </p>
      </div>
    </div>
  </div>
</div>


        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredAbsentees.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Absentees Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                🎉 Excellent! No students were absent during the {filterType} period.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Date", "Student Name", "Class", "Section", "Reason"].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAbsentees.map((att: any, idx: number) => (
                      <tr 
                        key={att.id || idx} 
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {att.date}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">
                            {att.student_name || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {att.class_name || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {att.sec || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {att.remarks || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                  <div>
                    Showing <span className="font-semibold">{filteredAbsentees.length}</span> records
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Filtered by:</span>
                    <span className="font-semibold text-blue-600 capitalize">{filterType}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AbsentStudentsReport;