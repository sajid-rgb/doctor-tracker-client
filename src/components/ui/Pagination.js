'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) => {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safeCurrentPage = Math.max(1, currentPage || 1);

  return (
    <div
      className={`flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-600 dark:text-slate-400 ${className}`}
    >
      <button
        type="button"
        onClick={() => onPageChange && onPageChange(safeCurrentPage - 1)}
        disabled={safeCurrentPage <= 1}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 sm:px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="hidden min-[400px]:inline">Previous</span>
        <span className="min-[400px]:hidden">Prev</span>
      </button>

      <span className="text-xs">
        Page <strong className="text-slate-900 dark:text-white font-semibold">{safeCurrentPage}</strong> of{' '}
        <strong className="text-slate-900 dark:text-white font-semibold">{safeTotalPages}</strong>
      </span>

      <button
        type="button"
        onClick={() => onPageChange && onPageChange(safeCurrentPage + 1)}
        disabled={safeCurrentPage >= safeTotalPages}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 sm:px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <span className="hidden min-[400px]:inline">Next</span>
        <span className="min-[400px]:hidden">Next</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default Pagination;
