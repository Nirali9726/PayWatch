import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import MetricCards from '../components/MetricCards';
import ChartsSection from '../components/ChartsSection';
import FilterBar from '../components/FilterBar';
import PaymentsTable from '../components/PaymentsTable';
import Toast from '../components/Toast';
import api from '../utils/api';
import { RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [retryingIds, setRetryingIds] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    gateway: 'All',
    paymentMethod: 'All',
    customerSegment: 'All',
    geography: 'All',
    days: '',
    search: '',
  });

  // Fetch Stats and Payment Records from API
  const fetchDashboardData = useCallback(async (showRefreshingState = false) => {
    if (showRefreshingState) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.gateway && filters.gateway !== 'All') params.append('gateway', filters.gateway);
      if (filters.paymentMethod && filters.paymentMethod !== 'All') params.append('paymentMethod', filters.paymentMethod);
      if (filters.customerSegment && filters.customerSegment !== 'All') params.append('customerSegment', filters.customerSegment);
      if (filters.geography && filters.geography !== 'All') params.append('geography', filters.geography);
      if (filters.days) params.append('days', filters.days);
      if (filters.search) params.append('search', filters.search);

      const [statsRes, paymentsRes] = await Promise.all([
        api.get(`/payments/stats?${params.toString()}`),
        api.get(`/payments?${params.toString()}`),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (paymentsRes.data.success) {
        setPayments(paymentsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch intelligence data from server. Please verify backend connection.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      gateway: 'All',
      paymentMethod: 'All',
      customerSegment: 'All',
      geography: 'All',
      days: '',
      search: '',
    });
  };

  const handleRetryPayment = async (payment) => {
    setRetryingIds((prev) => [...prev, payment.id]);

    try {
      const res = await api.put(`/payments/${payment.id}/retry`);

      if (res.data.success) {
        setToast({
          type: 'retry',
          title: `Retry Triggered for ${payment.id}`,
          message: `Attempting automated recovery for ${payment.customerName} (${payment.gateway}).`,
        });

        setPayments((prev) =>
          prev.map((p) =>
            p.id === payment.id
              ? { ...p, status: 'retrying', retryStatus: 'processing', retryCount: (p.retryCount || 0) + 1 }
              : p
          )
        );

        setTimeout(() => {
          fetchDashboardData(true);
        }, 500);

        setTimeout(() => {
          fetchDashboardData(true);
        }, 4500);
      }
    } catch (err) {
      console.error('Failed to retry payment:', err);
      setToast({
        type: 'error',
        title: 'Retry Failed',
        message: err.response?.data?.message || `Could not retry payment ${payment.id}.`,
      });
    } finally {
      setRetryingIds((prev) => prev.filter((id) => id !== payment.id));
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (filters.gateway && filters.gateway !== 'All') params.append('gateway', filters.gateway);
      if (filters.paymentMethod && filters.paymentMethod !== 'All') params.append('paymentMethod', filters.paymentMethod);
      if (filters.customerSegment && filters.customerSegment !== 'All') params.append('customerSegment', filters.customerSegment);
      if (filters.geography && filters.geography !== 'All') params.append('geography', filters.geography);
      if (filters.days) params.append('days', filters.days);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/payments/export?${params.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PayWatch_Failures_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setToast({
        type: 'success',
        title: 'CSV Export Downloaded',
        message: 'Payment failure records successfully exported.',
      });
    } catch (err) {
      console.error('CSV Export Error:', err);
      setToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not generate CSV export file.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Navbar Header */}
      <Navbar />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {/* Top Banner Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">Executive Intelligence Overview</h2>
              <span className="p-1 rounded bg-blue-500/10 text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Real-time gateway analytics, failure root cause diagnostics, and retry automation</p>
          </div>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchDashboardData()}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-bold transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* 1. Metric Cards (4 Cards) */}
        <MetricCards stats={stats} loading={loading} />

        {/* 2. Intelligence Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onExportCSV={handleExportCSV}
          isExporting={isExporting}
          totalResults={payments.length}
        />

        {/* 3. Recharts Visual Analytics (4 Charts) */}
        <ChartsSection stats={stats} loading={loading} />

        {/* 4. Payments Failure Data Table */}
        <PaymentsTable
          payments={payments}
          loading={loading}
          onRetryPayment={handleRetryPayment}
          retryingIds={retryingIds}
        />
      </main>

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Dashboard;
