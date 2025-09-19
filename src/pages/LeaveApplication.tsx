import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface Leave {
  id: number;
  empId: string;
  name: string;
  leaveType: string;
  department: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

const LeaveApplication: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

  // Employee form state
  const [leaveType, setLeaveType] = useState("Sick Leave");
  const [department, setDepartment] = useState("Logistic");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // LocalStorage key
  const STORAGE_KEY = 'leaveRequests';

  useEffect(() => {
    loadLeaves();
    // Poll every 5 seconds for realtime updates
    const interval = setInterval(loadLeaves, 5000);
    return () => clearInterval(interval);
  }, [isAdmin, user]);

  const loadLeaves = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let parsedLeaves = stored ? JSON.parse(stored) : [];
      
      // Ensure type safety after JSON parse
      const allLeaves: Leave[] = parsedLeaves.map((leave: any) => ({
        ...leave,
        status: leave.status as "Pending" | "Approved" | "Rejected"
      }));
      
      if (!isAdmin && user) {
        // Employees see only their own
        allLeaves = allLeaves.filter(leave => leave.empId === user.id);
      }

      setLeaves(allLeaves);
    } catch (error) {
      console.error('Error loading leaves:', error);
      setLeaves([]);
    }
  };

  const saveLeaves = (updatedLeaves: Leave[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeaves));
      // Trigger reload for realtime
      loadLeaves();
    } catch (error) {
      console.error('Error saving leaves:', error);
    }
  };

  const calculateDays = (start: string, end: string): number => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const diffTime = endDateObj.getTime() - startDateObj.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !startDate || !endDate || !reason) return;

    const newLeave: Leave = {
      id: Date.now(),
      empId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      leaveType,
      department,
      startDate,
      endDate,
      days: calculateDays(startDate, endDate),
      reason,
      status: "Pending"
    };

    const updatedLeaves = [...leaves, newLeave];
    saveLeaves(updatedLeaves);

    // Reset form
    setLeaveType("Sick Leave");
    setDepartment("Logistic");
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  const handleApprove = (id: number) => {
    const updatedLeaves = leaves.map(leave =>
      leave.id === id ? { ...leave, status: "Approved" as const } : leave
    ) as Leave[];
    saveLeaves(updatedLeaves);
  };

  const handleReject = (id: number) => {
    const updatedLeaves = leaves.map(leave =>
      leave.id === id ? { ...leave, status: "Rejected" as const } : leave
    ) as Leave[];
    saveLeaves(updatedLeaves);
  };

  // Filter for employee: only their leaves (already filtered in load)
  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch = leave.empId.toLowerCase().includes(search.toLowerCase()) ||
                          leave.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || leave.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl p-6 mb-6 shadow-lg">
          <h1 className="text-3xl font-bold">My Leave Applications</h1>
          <p className="mt-2 text-lg">Apply for leave or view your requests</p>
        </div>

        {/* Apply Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply for Leave</h2>
          <form onSubmit={handleApplyLeave}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Logistic">Logistic</option>
                  <option value="Database">Database</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter reason for leave..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition-all"
              >
                Submit Leave Request
              </button>
            </div>
          </form>
        </div>

        {/* Employee's Leave History */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Leave History</h2>
            {leaves.length === 0 && (
              <p className="text-gray-500 text-center">No leave requests yet. Apply above to get started.</p>
            )}
          </div>
          {leaves.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeaves.map((leave, index) => (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{leave.leaveType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{`${leave.startDate} to ${leave.endDate}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{leave.days}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            leave.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : leave.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLeave(leave)}
                          className="px-3 py-1 text-sm bg-teal-500 text-white rounded-md hover:bg-teal-600"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin view
  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl p-6 mb-6 shadow-lg">
        <h1 className="text-3xl font-bold">Employee Leave Management</h1>
        <p className="mt-2 text-lg">Track and manage leave requests efficiently</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <input
          type="text"
          placeholder="Search By Emp ID or Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-3 py-2 w-full sm:w-1/3 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm"
        />

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("Pending")}
            className={`px-4 py-2 rounded-md font-medium ${filter === "Pending" ? "bg-yellow-500 text-white shadow" : "bg-gray-200"}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("Approved")}
            className={`px-4 py-2 rounded-md font-medium ${filter === "Approved" ? "bg-green-500 text-white shadow" : "bg-gray-200"}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("Rejected")}
            className={`px-4 py-2 rounded-md font-medium ${filter === "Rejected" ? "bg-red-500 text-white shadow" : "bg-gray-200"}`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter("All")}
            className={`px-4 py-2 rounded-md font-medium ${filter === "All" ? "bg-teal-500 text-white shadow" : "bg-gray-200"}`}
          >
            All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0.5">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold">
              <th className="px-4 py-2 rounded-tl-md">S No</th>
              <th className="px-4 py-2">Emp ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Leave Type</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Days</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 rounded-tr-md">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((leave, index) => (
                <tr
                  key={leave.id}
                  className="hover:shadow-lg hover:scale-105 transition-transform bg-white rounded-md mb-1 text-sm"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{leave.empId}</td>
                  <td className="px-4 py-2">{leave.name}</td>
                  <td className="px-4 py-2">{leave.leaveType}</td>
                  <td className="px-4 py-2">{leave.department}</td>
                  <td className="px-4 py-2">{leave.days}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        leave.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : leave.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedLeave(leave)}
                        className="px-3 py-1 text-sm bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-md hover:from-teal-600 hover:to-blue-600 shadow"
                      >
                        View
                      </button>
                      {leave.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(leave.id)}
                            className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(leave.id)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-3 text-center text-gray-500">
                  No leaves found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-3 text-teal-600">Leave Details</h2>
            <p><strong>Employee:</strong> {selectedLeave.name} ({selectedLeave.empId})</p>
            <p><strong>Type:</strong> {selectedLeave.leaveType}</p>
            <p><strong>Department:</strong> {selectedLeave.department}</p>
            <p><strong>Start Date:</strong> {selectedLeave.startDate}</p>
            <p><strong>End Date:</strong> {selectedLeave.endDate}</p>
            <p><strong>Days:</strong> {selectedLeave.days}</p>
            <p><strong>Reason:</strong> {selectedLeave.reason}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded text-sm ${
                  selectedLeave.status === "Approved"
                    ? "bg-green-100 text-green-800"
                    : selectedLeave.status === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {selectedLeave.status}
              </span>
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedLeave(null)}
                className="px-4 py-2 rounded-md bg-teal-500 text-white hover:bg-teal-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApplication;
