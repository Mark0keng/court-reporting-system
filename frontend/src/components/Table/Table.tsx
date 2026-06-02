import React from 'react';
import './Table.scss';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowKey: (item: T) => string | number;
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data available.",
  rowKey,
}: TableProps<T>) {
  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="table-element">
          {/* Table Header */}
          <thead className="table-header">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`table-header-cell ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="table-body">
            {isLoading ? (
              // Loading Skeleton State
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={idx} className="table-row-loading">
                  {columns.map((col) => (
                    <td key={col.key} className="table-skeleton-cell">
                      <div className="table-skeleton-bar"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="table-row-empty">
                  <div className="table-empty-container">
                    <svg className="table-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4.5m16 0h-1.5m-15 0H5m11 4h.01M8 17h.01m4 0h.01" />
                    </svg>
                    <span className="table-empty-text">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((item) => (
                <tr
                  key={rowKey(item)}
                  className="table-row group/row"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`table-cell ${col.className || ''}`}
                    >
                      {col.render ? col.render(item) : (item as any)[col.key]?.toString()}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Table;
