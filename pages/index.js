
import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  DollarSign, 
  BarChart2, 
  LineChart as LineChartIcon,
  Filter,
  X,
  Building,
  Calendar,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Initial sample data (we'll replace this with user input)
const initialIncomeData = [];

export default function IncomePage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [incomeData, setIncomeData] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [newIncome, setNewIncome] = useState({
    date: '',
    client: '',
    type: 'retainer',
    frequency: 'monthly',
    amount: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('incomeData');
    setIncomeData(saved ? JSON.parse(saved) : initialIncomeData);
  }, []);
  if (!incomeData) return null;
const handleDeleteIncome = (idToDelete) => {
  setIncomeData(currentData => 
    currentData.filter(income => income.id !== idToDelete)
  );
};
  // Handle new income entry
  const handleAddIncome = () => {
    if (!newIncome.date || !newIncome.client || !newIncome.amount) return;

    setIncomeData([
      ...incomeData,
      {
        id: Date.now(),
        ...newIncome,
        amount: parseFloat(newIncome.amount)
      }
    ]);

    setNewIncome({
      date: '',
      client: '',
      type: 'retainer',
      frequency: 'monthly',
      amount: '',
    });

    setShowAddModal(false);
  };

// Calculate monthly totals for chart
const monthlyData = incomeData.reduce((acc, income) => {
  const date = new Date(income.date);
  const month = date.toLocaleString('default', { month: 'short' });
  const monthIndex = date.getMonth(); // Get month index (0-11)
  
  if (!acc[monthIndex]) {
    acc[monthIndex] = {
      month,
      monthIndex,
      retainer: 0,
      commission: 0,
      total: 0
    };
  }
  acc[monthIndex][income.type] += income.amount;
  acc[monthIndex].total += income.amount;
  return acc;
}, {});

// Convert to array and sort by month index
const chartData = Object.values(monthlyData)
  .sort((a, b) => a.monthIndex - b.monthIndex);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Income Tracking</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={20} />
            Add Income
          </button>
        </div>

{/* Summary Cards */}
<div className="grid md:grid-cols-2 gap-6">
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-sm text-gray-500 mb-2">Monthly Average</h3>
    <p className="text-2xl font-bold text-green-600">
      ${(chartData.reduce((sum, month) => sum + month.total, 0) / Math.max(chartData.length, 1)).toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}
    </p>
  </div>
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-sm text-gray-500 mb-2">Year to Date Income</h3>
    <p className="text-2xl font-bold text-blue-600">
      ${chartData.reduce((sum, month) => sum + month.total, 0).toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}
    </p>
  </div>
</div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Income History</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded ${
                  chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                <BarChart2 size={20} />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded ${
                  chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                <LineChartIcon size={20} />
              </button>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="retainer" name="Retainer" fill="#3b82f6" />
                  <Bar dataKey="commission" name="Commission" fill="#10b981" />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Total Income" stroke="#3b82f6" />
                  <Line type="monotone" dataKey="retainer" name="Retainer" stroke="#10b981" />
                  <Line type="monotone" dataKey="commission" name="Commission" stroke="#f59e0b" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
<thead className="bg-gray-50">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
  </tr>
</thead>
<tbody className="divide-y divide-gray-200">
  {incomeData.sort((a, b) => new Date(b.date) - new Date(a.date)).map((income) => (
    <tr key={income.id}>
      <td className="px-6 py-4">{income.date}</td>
      <td className="px-6 py-4">{income.client}</td>
      <td className="px-6 py-4 capitalize">{income.type}</td>
      <td className="px-6 py-4 capitalize">{income.frequency}</td>
      <td className="px-6 py-4 text-right">${income.amount.toLocaleString()}</td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => handleDeleteIncome(income.id)}
          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
        >
          <X size={16} />
        </button>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>

        {/* Add Income Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Income</h2>
                <button onClick={() => setShowAddModal(false)}>
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input
                    type="text"
                    value={newIncome.client}
                    onChange={(e) => setNewIncome({ ...newIncome, client: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Client name"
                  />
                </div>

                <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
  <input
    list="income-types"
    type="text"
    value={newIncome.type}
    onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value })}
    className="w-full p-2 border rounded-lg"
    placeholder="Select or type income type"
  />
  <datalist id="income-types">
    <option value="retainer" />
    <option value="commission" />
    <option value="consulting" />
    <option value="project" />
  </datalist>
</div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    value={newIncome.frequency}
                    onChange={(e) => setNewIncome({ ...newIncome, frequency: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="one-time">One-time</option>
                    <option value="weekly">Weekly</option>
                    <option value="weekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      type="number"
                      value={newIncome.amount}
                      onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                      className="w-full pl-10 p-2 border rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIncome}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add Income
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}