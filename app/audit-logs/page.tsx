'use client';

import { useEffect, useState } from 'react';
import { getAllLogs, clearAllLogs, type AuditLog } from '../lib/auditLog';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'Login' | 'Logout' | 'Add Product' | 'Place Order'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = () => {
      const allLogs = getAllLogs();
      setLogs(allLogs);
      setLoading(false);
    };

    loadLogs();
  }, []);

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter((log) => log.action === filter);

  // Sort logs by date/time in descending order (newest first)
  const sortedLogs = [...filteredLogs].reverse();

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to delete all audit logs? This action cannot be undone.')) {
      clearAllLogs();
      setLogs([]);
      window.alert('All audit logs have been cleared.');
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Login':
        return 'bg-green-100 text-green-800';
      case 'Logout':
        return 'bg-gray-100 text-gray-800';
      case 'Add Product':
        return 'bg-blue-100 text-blue-800';
      case 'Place Order':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'Farmer' 
      ? 'bg-orange-100 text-orange-800' 
      : 'bg-cyan-100 text-cyan-800';
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="rounded-md bg-gray-200 hover:bg-gray-300 p-2 transition">
                <ArrowLeft size={20} />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
              <p className="text-sm text-gray-600">Track all user activities on the platform</p>
            </div>
          </div>
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-2 rounded-md bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium text-white transition"
          >
            <Trash2 size={18} />
            Clear All Logs
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All ({logs.length})
          </button>
          <button
            onClick={() => setFilter('Login')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === 'Login'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Login ({logs.filter((l) => l.action === 'Login').length})
          </button>
          <button
            onClick={() => setFilter('Logout')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === 'Logout'
                ? 'bg-gray-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Logout ({logs.filter((l) => l.action === 'Logout').length})
          </button>
          <button
            onClick={() => setFilter('Add Product')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === 'Add Product'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Add Product ({logs.filter((l) => l.action === 'Add Product').length})
          </button>
          <button
            onClick={() => setFilter('Place Order')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === 'Place Order'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Place Order ({logs.filter((l) => l.action === 'Place Order').length})
          </button>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Loading logs...</p>
            </div>
          </div>
        ) : sortedLogs.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900">No logs found</h3>
            <p className="text-sm text-gray-600 mt-2">
              {filter === 'all'
                ? 'Start using the platform to see audit logs here.'
                : `No "${filter}" actions found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
            <table className="w-full divide-y divide-gray-200 bg-white">
              {/* Table Header */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-200">
                {sortedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {log.username}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(log.role)}`}>
                        {log.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {log.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Stats */}
        {!loading && logs.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Total Logs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{logs.length}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Logins</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{logs.filter((l) => l.action === 'Login').length}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Products Added</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{logs.filter((l) => l.action === 'Add Product').length}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Orders Placed</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{logs.filter((l) => l.action === 'Place Order').length}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
