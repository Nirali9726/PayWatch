import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertOctagon, Clock, ChevronLeft, ChevronRight, Globe, Layers } from 'lucide-react';

const PaymentsTable = ({ payments, loading, onRetryPayment, retryingIds }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'recovered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Recovered
          </span>
        );
      case 'retrying':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Retrying
          </span>
        );
      case 'abandoned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3.5 h-3.5" />
            Abandoned
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertOctagon className="w-3.5 h-3.5" />
            Failed
          </span>
        );
    }
  };

  const getSegmentBadge = (segment) => {
    const styles = {
      Enterprise: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      VIP: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      SMB: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      Consumer: 'bg-slate-800 text-slate-300 border-slate-700',
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${styles[segment] || styles.Consumer}`}>
        {segment}
      </span>
    );
  };

  const totalPages = Math.ceil((payments?.length || 0) / pageSize);
  const paginatedPayments = payments?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || [];

  if (loading) {
    return (
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-800/40 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden mb-12">
      {/* Table Header Bar */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Failed Transactions Audit Log
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-700 font-semibold">
              {payments.length} Total
            </span>
          </h3>
          <p className="text-xs text-slate-400">Transaction records, error causes, and retry execution controls</p>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#0b0f19] text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th scope="col" className="py-3.5 px-6">Customer</th>
              <th scope="col" className="py-3.5 px-4">Amount</th>
              <th scope="col" className="py-3.5 px-4">Gateway</th>
              <th scope="col" className="py-3.5 px-4">Method</th>
              <th scope="col" className="py-3.5 px-4">Failure Reason</th>
              <th scope="col" className="py-3.5 px-4">Geography</th>
              <th scope="col" className="py-3.5 px-4">Status</th>
              <th scope="col" className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {paginatedPayments.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers className="w-8 h-8 opacity-40 text-slate-400" />
                    <p className="text-sm font-medium">No payment records match your active filter criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedPayments.map((payment) => {
                const isRetryingCurrent = retryingIds.includes(payment.id) || payment.status === 'retrying';
                const isRecovered = payment.status === 'recovered';

                return (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-800/40 transition-colors duration-150 group"
                  >
                    {/* Customer */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                          {payment.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {payment.customerName}
                            </span>
                            {getSegmentBadge(payment.customerSegment)}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-mono text-blue-400">{payment.id}</span>
                            <span>•</span>
                            <span>{formatDate(payment.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-bold text-white">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>

                    {/* Gateway */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800/90 border border-slate-700 text-slate-200">
                        {payment.gateway}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4 text-slate-300">
                      {payment.paymentMethod}
                    </td>

                    {/* Failure Reason */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {payment.failureReason}
                      </span>
                    </td>

                    {/* Geography */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{payment.geography}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(payment.status)}
                    </td>

                    {/* Action: Retry Button */}
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onRetryPayment(payment)}
                        disabled={isRetryingCurrent || isRecovered}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                          isRecovered
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 cursor-not-allowed opacity-60'
                            : isRetryingCurrent
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60 cursor-wait opacity-80'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 border border-blue-400/30 hover:scale-105'
                        }`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRetryingCurrent ? 'animate-spin' : ''}`} />
                        <span>
                          {isRecovered ? 'Recovered' : isRetryingCurrent ? 'Retrying...' : 'Retry Payment'}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-3 bg-[#0b0f19] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, payments.length)} of {payments.length} records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTable;
