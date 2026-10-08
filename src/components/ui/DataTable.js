'use client';

const DataTable = ({
  columns = [],
  data = [],
  keyExtractor = (item, idx) => item?._id || item?.id || idx,
  isLoading = false,
  loadingRows = 5,
  emptyState = null,
  onRowClick = null,
  className = '',
  tableClassName = '',
  minWidth = 'min-w-[700px]',
}) => {
  const getAlignClass = (align) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  if (isLoading) {
    return (
      <div
        className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
      >
        <div className="overflow-x-auto overscroll-x-contain">
          <table className={`w-full text-xs ${minWidth} ${tableClassName}`}>
            <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={col.key || idx}
                    className={`px-5 py-3 font-semibold ${getAlignClass(col.align)} ${
                      col.headerClassName || ''
                    }`}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {Array.from({ length: loadingRows }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={col.key || cIdx} className="px-5 py-4">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    if (emptyState) return emptyState;

    return (
      <div
        className={`rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 ${className}`}
      >
        No records found.
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="overflow-x-auto overscroll-x-contain">
        <table className={`w-full text-xs ${minWidth} ${tableClassName}`}>
          <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`px-5 py-3 font-semibold ${getAlignClass(col.align)} ${
                    col.headerClassName || ''
                  }`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((item, rowIdx) => {
              const rowKey = keyExtractor(item, rowIdx);
              const isClickable = Boolean(onRowClick);

              return (
                <tr
                  key={rowKey}
                  onClick={isClickable ? () => onRowClick(item) : undefined}
                  className={`transition-colors ${
                    isClickable
                      ? 'cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {columns.map((col, colIdx) => {
                    const cellKey = `${rowKey}-${col.key || colIdx}`;
                    const content = col.render
                      ? col.render(item, rowIdx)
                      : item?.[col.key] ?? '—';

                    return (
                      <td
                        key={cellKey}
                        className={`px-5 py-3.5 ${getAlignClass(col.align)} ${
                          col.className || ''
                        }`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
