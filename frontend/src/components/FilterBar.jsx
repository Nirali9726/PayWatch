import React from 'react';
import { Search, Download, RotateCcw, Filter } from 'lucide-react';

const FilterBar = ({
  filters,
  onFilterChange,
  onResetFilters,
  onExportCSV,
  isExporting,
  totalResults,
}) => {
  const gateways = ['All', 'Stripe', 'PayPal', 'Adyen', 'Razorpay', 'Square'];
  const paymentMethods = [
    'All',
    'Credit Card',
    'Debit Card',
    'ACH',
    'Bank Transfer',
    'Apple Pay',
    'Google Pay',
  ];
  const customerSegments = ['All', 'Enterprise', 'SMB', 'Consumer', 'VIP'];
  const dateRanges = [
    { label: 'All Time', value: '' },
    { label: 'Last 7 Days', value: '7' },
    { label: 'Last 14 Days', value: '14' },
    { label: 'Last 30 Days', value: '30' },
  ];

  const activeFilterCount = Object.values(filters).filter((val) => val !== '' && val !== 'All').length;

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 mb-8 shadow-lg">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Filter Intelligence Data
              {activeFilterCount > 0 && (
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-500/30">
                  {activeFilterCount} Active
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Filter transactions by gateway, payment method, date, or segment</p>
          </div>
        </div>

        {/* Action Controls: Reset & CSV Export */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700/70 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}

          <button
            onClick={onExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md border border-blue-400/30 transition-all duration-150 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating CSV...' : 'Export to CSV'}</span>
          </button>
        </div>
      </div>

      {/* Filter Inputs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Search Input */}
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer, ID, or failure reason..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full bg-[#0b0f19] border border-slate-800 text-xs text-white rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
          />
        </div>

        {/* Gateway Select */}
        <div>
          <select
            value={filters.gateway || 'All'}
            onChange={(e) => onFilterChange('gateway', e.target.value)}
            className="w-full bg-[#0b0f19] border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Gateways</option>
            {gateways.filter((g) => g !== 'All').map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Payment Method Select */}
        <div>
          <select
            value={filters.paymentMethod || 'All'}
            onChange={(e) => onFilterChange('paymentMethod', e.target.value)}
            className="w-full bg-[#0b0f19] border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Methods</option>
            {paymentMethods.filter((m) => m !== 'All').map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Date Range Select */}
        <div>
          <select
            value={filters.days || ''}
            onChange={(e) => onFilterChange('days', e.target.value)}
            className="w-full bg-[#0b0f19] border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Segment Select */}
        <div>
          <select
            value={filters.customerSegment || 'All'}
            onChange={(e) => onFilterChange('customerSegment', e.target.value)}
            className="w-full bg-[#0b0f19] border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Segments</option>
            {customerSegments.filter((s) => s !== 'All').map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
