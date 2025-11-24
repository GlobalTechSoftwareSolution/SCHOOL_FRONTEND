"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import axios from "axios";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

interface TransportDetail {
  id: number;
  user: string;
  route_name: string;
  bus_number: string;
  pickup_point: string;
  drop_point: string;
  driver_name: string;
  driver_phone: string;
  transport_fee: number;
  is_active: boolean;
  created_at?: string;
}

const TransportPage = () => {
  const [transports, setTransports] = useState<TransportDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTransport, setNewTransport] = useState({
    user: "",
    route_name: "",
    bus_number: "",
    pickup_point: "",
    drop_point: "",
    driver_name: "",
    driver_phone: "",
    transport_fee: "",
  });
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  // 🔹 Fetch Transport Details
  const fetchTransportDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE}/transport_details/`);
      setTransports(res.data);
    } catch (err) {
      console.error("Error fetching transport details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportDetails();
  }, []);

  // 🔹 Add New Transport Entry
  const handleAddTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("⏳ Adding transport details...");

    const payload = {
      user: newTransport.user.trim(),
      route_name: newTransport.route_name,
      bus_number: newTransport.bus_number,
      pickup_point: newTransport.pickup_point,
      drop_point: newTransport.drop_point,
      driver_name: newTransport.driver_name,
      driver_phone: newTransport.driver_phone,
      transport_fee: parseFloat(newTransport.transport_fee),
      is_active: true,
    };

    try {
      await axios.post(`${API_BASE}/transport_details/`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      setMessage("✅ Transport details added successfully!");
      setNewTransport({
        user: "",
        route_name: "",
        bus_number: "",
        pickup_point: "",
        drop_point: "",
        driver_name: "",
        driver_phone: "",
        transport_fee: "",
      });
      fetchTransportDetails();
      setActiveTab("list");
    } catch (error: any) {
      console.error("❌ Error adding transport:", error.response?.data || error);
      setMessage(
        `❌ Failed to add transport. ${
          error.response?.data
            ? JSON.stringify(error.response.data)
            : "Unknown server error"
        }`
      );
    }
  };

  return (
    <DashboardLayout role="management">
      <div className="p-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Transport Management</h1>
            <p className="text-gray-600 mt-2">Manage bus routes, drivers, and student transport</p>
          </div>
          <button
            onClick={() => setActiveTab(activeTab === "add" ? "list" : "add")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {activeTab === "add" ? "View All Transports" : "Add New Transport"}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("list")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "list"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Transports
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "add"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Add New
            </button>
          </nav>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg ${message.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}

        {/* Add Transport Form */}
        {activeTab === "add" && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <h2 className="text-xl font-bold">Add New Transport Route</h2>
              <p className="text-blue-100 mt-1">Fill in the details to create a new transport route</p>
            </div>
            <form onSubmit={handleAddTransport} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">User Email</label>
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={newTransport.user}
                  onChange={(e) =>
                    setNewTransport({ ...newTransport, user: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Route Name</label>
                <input
                  type="text"
                  placeholder="North Route, South Route, etc."
                  value={newTransport.route_name}
                  onChange={(e) =>
                    setNewTransport({ ...newTransport, route_name: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Bus Number</label>
                <input
                  type="text"
                  placeholder="BUS-001"
                  value={newTransport.bus_number}
                  onChange={(e) =>
                    setNewTransport({ ...newTransport, bus_number: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Pickup Point</label>
                <input
                  type="text"
                  placeholder="School Gate, Main Street, etc."
                  value={newTransport.pickup_point}
                  onChange={(e) =>
                    setNewTransport({ ...newTransport, pickup_point: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Drop Point</label>
                <input
                  type="text"
                  placeholder="School Gate, Main Street, etc."
                  value={newTransport.drop_point}
                  onChange={(e) =>
                    setNewTransport({ ...newTransport, drop_point: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Driver Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newTransport.driver_name}
                  onChange={(e) =>
                    setNewTransport({ ...newTransport, driver_name: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Driver Phone</label>
                <input
                  type="text"
                  placeholder="+1234567890"
                  value={newTransport.driver_phone}
                  onChange={(e) =>
                    setNewTransport({ ...newTransport, driver_phone: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Transport Fee (₹)</label>
                <input
                  type="number"
                  placeholder="500"
                  value={newTransport.transport_fee}
                  onChange={(e) =>
                    setNewTransport({ ...newTransport, transport_fee: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="md:col-span-2 flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Add Transport Route
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transport List */}
        {activeTab === "list" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Transport Routes</h2>
              <div className="text-sm text-gray-500">
                {transports.length} {transports.length === 1 ? 'route' : 'routes'} total
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transports.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {item.bus_number}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.is_active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{item.route_name}</h3>
                    
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="font-medium">Pickup:</span> {item.pickup_point}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="font-medium">Drop:</span> {item.drop_point}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="font-medium">Driver:</span> {item.driver_name}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <div>
                          <span className="font-medium">Phone:</span> {item.driver_phone}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="font-medium">Fee:</span> ₹{item.transport_fee}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-100">
                        <span className="font-medium">User:</span> {item.user}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TransportPage;