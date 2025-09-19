import React, { useEffect, useState } from 'react';
import { DollarSign, Plus, TrendingUp, Calendar, Edit, Trash2, Award, Calculator } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface SalaryRecord {
  id: string;
  userId: string;
  employeeName: string;
  baseSalary: number;
  incentives: number;
  deductions: number;
  month: number;
  year: number;
  status: 'pending' | 'paid';
  payDate?: string;
}

export const Salary: React.FC = () => {
  const {  isAdmin } = useAuth();
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SalaryRecord | null>(null);
  const [employees] = useState([
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' },
    { id: '4', name: 'Sarah Wilson' }
  ]);
  const [formData, setFormData] = useState({
    userId: '',
    baseSalary: '',
    incentives: '',
    deductions: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: 'pending' as 'pending' | 'paid',
  });

  useEffect(() => {
    fetchSalaryRecords();
  }, []);

  const fetchSalaryRecords = () => {
    // Mock data - in real app, this would come from API
    

    
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const selectedEmployee = employees.find(emp => emp.id === formData.userId);
    const newRecord: SalaryRecord = {
      id: editingRecord?.id || Date.now().toString(),
      userId: formData.userId,
      employeeName: selectedEmployee?.name || 'Unknown',
      baseSalary: parseFloat(formData.baseSalary),
      incentives: parseFloat(formData.incentives) || 0,
      deductions: parseFloat(formData.deductions) || 0,
      month: formData.month,
      year: formData.year,
      status: formData.status,
      payDate: formData.status === 'paid' ? new Date().toISOString().split('T')[0] : undefined
    };

    if (editingRecord) {
      setSalaryRecords(prev => prev.map(record => record.id === editingRecord.id ? newRecord : record));
    } else {
      setSalaryRecords(prev => [...prev, newRecord]);
    }

    setShowModal(false);
    setEditingRecord(null);
    setFormData({
      userId: '',
      baseSalary: '',
      incentives: '',
      deductions: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      status: 'pending',
    });
    setLoading(false);
  };

  const handleEdit = (record: SalaryRecord) => {
    setEditingRecord(record);
    setFormData({
      userId: record.userId,
      baseSalary: record.baseSalary.toString(),
      incentives: record.incentives.toString(),
      deductions: record.deductions.toString(),
      month: record.month,
      year: record.year,
      status: record.status,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this salary record?')) return;
    setSalaryRecords(prev => prev.filter(record => record.id !== id));
  };

  const updateStatus = (id: string, status: 'pending' | 'paid') => {
    setSalaryRecords(prev => prev.map(record => 
      record.id === id 
        ? { ...record, status, payDate: status === 'paid' ? new Date().toISOString().split('T')[0] : undefined }
        : record
    ));
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1];
  };

  const calculateTotal = (baseSalary: number, incentives: number, deductions: number) => {
    return baseSalary + incentives - deductions;
  };

  const totalSalaryPaid = salaryRecords
    .filter(record => record.status === 'paid')
    .reduce((sum, record) => sum + calculateTotal(record.baseSalary, record.incentives, record.deductions), 0);

  const totalPending = salaryRecords
    .filter(record => record.status === 'pending')
    .reduce((sum, record) => sum + calculateTotal(record.baseSalary, record.incentives, record.deductions), 0);

  const avgSalary = salaryRecords.length > 0 
    ? salaryRecords.reduce((sum, record) => sum + calculateTotal(record.baseSalary, record.incentives, record.deductions), 0) / salaryRecords.length
    : 0;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Salary Management</h1>
        <p className="text-gray-600">Manage employee salaries, incentives, and deductions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border border-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-green-500 shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-green-600">Total Paid</h3>
              <p className="text-2xl font-bold text-gray-900">${totalSalaryPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl shadow-sm p-6 border border-yellow-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-yellow-500 shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-yellow-600">Pending</h3>
              <p className="text-2xl font-bold text-gray-900">${totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-blue-500 shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-blue-600">Average Salary</h3>
              <p className="text-2xl font-bold text-gray-900">${Math.round(avgSalary).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-purple-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-purple-500 shadow-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-purple-600">Total Records</h3>
              <p className="text-2xl font-bold text-gray-900">{salaryRecords.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {isAdmin ? 'All Salary Records' : 'Your Salary Records'}
            </h2>
            {isAdmin && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                <span>Add Salary Record</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
            </div>
          ) : salaryRecords.length === 0 ? (
            <div className="p-12 text-center">
              <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Salary Records</h3>
              <p className="text-gray-500">No salary records found.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isAdmin && (
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Salary
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incentives
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salaryRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-white">
                              {record.employeeName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.employeeName}
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getMonthName(record.month)} {record.year}
                      </div>
                      {record.payDate && (
                        <div className="text-xs text-gray-500">
                          Paid: {new Date(record.payDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${record.baseSalary.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        +${record.incentives.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">
                        -${record.deductions.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        ${calculateTotal(record.baseSalary, record.incentives, record.deductions).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => isAdmin && updateStatus(record.id, record.status === 'paid' ? 'pending' : 'paid')}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          record.status === 'paid'
                            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
                        } ${!isAdmin ? 'cursor-default' : 'cursor-pointer'}`}
                        disabled={!isAdmin}
                      >
                        {record.status}
                      </button>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit Record"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {editingRecord ? 'Edit Salary Record' : 'Add Salary Record'}
            </h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee *
                </label>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({...formData, userId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {getMonthName(i + 1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Salary *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({...formData, baseSalary: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="5000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incentives
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.incentives}
                  onChange={(e) => setFormData({...formData, incentives: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deductions
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.deductions}
                  onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'pending' | 'paid'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {/* Calculation Preview */}
              {formData.baseSalary && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Calculation Preview</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Base Salary:</span>
                      <span>${parseFloat(formData.baseSalary || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Incentives:</span>
                      <span>+${parseFloat(formData.incentives || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Deductions:</span>
                      <span>-${parseFloat(formData.deductions || '0').toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-1 flex justify-between font-medium">
                      <span>Net Total:</span>
                      <span>${(parseFloat(formData.baseSalary || '0') + parseFloat(formData.incentives || '0') - parseFloat(formData.deductions || '0')).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRecord(null);
                  }}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? 'Saving...' : editingRecord ? 'Update Record' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};