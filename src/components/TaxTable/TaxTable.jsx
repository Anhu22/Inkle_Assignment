import { useMemo, useState, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import './TaxTable.css';

// Helper function to capitalize first letter
const capitalizeFirst = (text) => {
  if (!text) return '-';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Custom hook for detecting clicks outside component
const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

// MultiSelect Dropdown Component
const MultiSelectDropdown = ({ column, options, isOpen, onClose, position }) => {
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const currentFilterValue = column.getFilterValue() || [];

  useOutsideClick(dropdownRef, onClose);

  const handleOptionToggle = (option) => {
    const newValue = currentFilterValue.includes(option)
      ? currentFilterValue.filter(item => item !== option)
      : [...currentFilterValue, option];

    column.setFilterValue(newValue.length > 0 ? newValue : undefined);
  };

  const handleSelectAll = () => {
    column.setFilterValue(options.map(opt => opt.value));
  };

  const handleClearAll = () => {
    column.setFilterValue(undefined);
    setSearchTerm('');
  };

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = currentFilterValue.length;

  return (
    <div
      ref={dropdownRef}
      className={`dropdown-filter ${position || ''}`}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 1000,
      }}
    >
      <div className="dropdown-header">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="dropdown-search"
        />
      </div>

      <div className="dropdown-actions">
        <button onClick={handleSelectAll} className="dropdown-action-btn">
          Select All
        </button>
        <button onClick={handleClearAll} className="dropdown-action-btn">
          Clear All
        </button>
      </div>

      <div className="dropdown-options">
        {filteredOptions.map(option => (
          <label key={option.value} className="dropdown-option">
            <input
              type="checkbox"
              checked={currentFilterValue.includes(option.value)}
              onChange={() => handleOptionToggle(option.value)}
              className="option-checkbox"
            />
            <span className="option-label">{option.label}</span>
          </label>
        ))}
        {filteredOptions.length === 0 && (
          <div className="no-options">No options found</div>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="selected-count">{selectedCount} selected</div>
      )}
    </div>
  );
};

export const TaxTable = ({ data, onEdit }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const headerRefs = {
    name: useRef(null),
    country: useRef(null),
    date: useRef(null),
    gender: useRef(null),
  };

  // Get unique names and countries
  const nameOptions = useMemo(() => {
    const names = [...new Set(data.map(item => item.name).filter(Boolean))];
    return names.sort().map(name => ({
      value: name,
      label: capitalizeFirst(name),
    }));
  }, [data]);

  const countryOptions = useMemo(() => {
    // Normalize country names (trim + lowercase) for deduplication
    const map = new Map();
    data.forEach(item => {
      if (!item.country) return;
      const raw = item.country.toString().trim();
      const key = raw.toLowerCase();
      if (!map.has(key)) map.set(key, capitalizeFirst(raw));
    });
    return Array.from(map.entries())
      .map(([key, label]) => ({ value: key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const dateOptions = useMemo(() => {
    const map = new Map();
    data.forEach(item => {
      if (!item.date) return;
      const raw = item.date.toString().trim();
      const key = raw.toLowerCase();
      if (!map.has(key)) map.set(key, raw);
    });
    return Array.from(map.entries()).map(([key, label]) => ({ value: key, label }));
  }, [data]);

  const genderOptions = useMemo(() => {
    const map = new Map();
    data.forEach(item => {
      if (!item.gender) return;
      const raw = item.gender.toString().trim();
      const key = raw.toLowerCase();
      if (!map.has(key)) map.set(key, capitalizeFirst(raw));
    });
    return Array.from(map.entries())
      .map(([key, label]) => ({ value: key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const handleDropdownToggle = (column) => {
    setOpenDropdown(openDropdown === column ? null : column);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ table }) => (
          <div className="header-with-filter" ref={headerRefs.name}>
            <span>Names</span>

            <button
              className={`filter-icon ${openDropdown === 'name' ? 'active' : ''} ${
                (table.getColumn('name')?.getFilterValue()?.length || 0) > 0
                  ? 'has-selection'
                  : ''
              }`}
              onClick={() => handleDropdownToggle('name')}
              aria-label="Filter names"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>

              {(table.getColumn('name')?.getFilterValue()?.length || 0) > 0 && (
                <span className="selection-badge">
                  {table.getColumn('name')?.getFilterValue()?.length}
                </span>
              )}
            </button>

            {openDropdown === 'name' && (
              <MultiSelectDropdown
                column={table.getColumn('name')}
                options={nameOptions}
                isOpen={openDropdown === 'name'}
                onClose={() => setOpenDropdown(null)}
                position="name"
              />
            )}
          </div>
        ),
        cell: (info) => (
          <div className="name-cell">
            <span className="name-text">{capitalizeFirst(info.getValue())}</span>
          </div>
        ),
      },

      {
        accessorKey: 'date',
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue || filterValue.length === 0) return true;
          const cell = row.getValue(columnId);
          const cellNorm = (cell || '').toString().trim().toLowerCase();
          return filterValue.includes(cellNorm);
        },
        header: ({ table }) => (
          <div className="header-with-filter" ref={headerRefs.date}>
            <span>Research Date</span>
            <button
              className={`filter-icon ${openDropdown === 'date' ? 'active' : ''} ${
                (table.getColumn('date')?.getFilterValue()?.length || 0) > 0
                  ? 'has-selection'
                  : ''
              }`}
              onClick={() => handleDropdownToggle('date')}
              aria-label="Filter dates"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>

              {(table.getColumn('date')?.getFilterValue()?.length || 0) > 0 && (
                <span className="selection-badge">
                  {table.getColumn('date')?.getFilterValue()?.length}
                </span>
              )}
            </button>

            {openDropdown === 'date' && (
              <MultiSelectDropdown
                column={table.getColumn('date')}
                options={dateOptions}
                isOpen={openDropdown === 'date'}
                onClose={() => setOpenDropdown(null)}
                position="date"
              />
            )}
          </div>
        ),
        cell: (info) => capitalizeFirst(info.getValue()) || '-',
      },

      {
        accessorKey: 'country',
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue || filterValue.length === 0) return true;
          const cell = row.getValue(columnId);
          const cellNorm = (cell || '').toString().trim().toLowerCase();
          return filterValue.includes(cellNorm);
        },
        header: ({ table }) => (
          <div className="header-with-filter" ref={headerRefs.country}>
            <span>Country</span>
            <button
              className={`filter-icon ${openDropdown === 'country' ? 'active' : ''} ${
                (table.getColumn('country')?.getFilterValue()?.length || 0) > 0
                  ? 'has-selection'
                  : ''
              }`}
              onClick={() => handleDropdownToggle('country')}
              aria-label="Filter countries"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>

              {(table.getColumn('country')?.getFilterValue()?.length || 0) > 0 && (
                <span className="selection-badge">
                  {table.getColumn('country')?.getFilterValue()?.length}
                </span>
              )}
            </button>

            {openDropdown === 'country' && (
              <MultiSelectDropdown
                column={table.getColumn('country')}
                options={countryOptions}
                isOpen={openDropdown === 'country'}
                onClose={() => setOpenDropdown(null)}
                position="country"
              />
            )}
          </div>
        ),
        cell: (info) => capitalizeFirst(info.getValue()) || '-',
      },

      {
        accessorKey: 'gender',
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue || filterValue.length === 0) return true;
          const cell = row.getValue(columnId);
          const cellNorm = (cell || '').toString().trim().toLowerCase();
          return filterValue.includes(cellNorm);
        },
        header: ({ table }) => (
          <div className="header-with-filter" ref={headerRefs.gender}>
            <span>Gender</span>
            <button
              className={`filter-icon ${openDropdown === 'gender' ? 'active' : ''} ${
                (table.getColumn('gender')?.getFilterValue()?.length || 0) > 0
                  ? 'has-selection'
                  : ''
              }`}
              onClick={() => handleDropdownToggle('gender')}
              aria-label="Filter gender"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>

              {(table.getColumn('gender')?.getFilterValue()?.length || 0) > 0 && (
                <span className="selection-badge">
                  {table.getColumn('gender')?.getFilterValue()?.length}
                </span>
              )}
            </button>

            {openDropdown === 'gender' && (
              <MultiSelectDropdown
                column={table.getColumn('gender')}
                options={genderOptions}
                isOpen={openDropdown === 'gender'}
                onClose={() => setOpenDropdown(null)}
                position="gender"
              />
            )}
          </div>
        ),
        cell: (info) => {
          const gender = info.getValue();
          const normalized = gender?.toLowerCase();
          const isMale = normalized === 'male';
          const isFemale = normalized === 'female';

          return (
            <div className={`gender-cell ${isMale ? 'male' : ''} ${isFemale ? 'female' : ''}`}>
              <span className="gender-dot"></span>
              {gender ? capitalizeFirst(gender) : '-'}
            </div>
          );
        },
      },

      {
        id: 'actions',
        header: 'Editor',
        cell: ({ row }) => (
          <button
            onClick={() => onEdit(row.original)}
            className="edit-button"
            aria-label={`Edit ${row.original.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
        ),
      },
    ],
    [data, openDropdown, nameOptions, countryOptions, dateOptions, genderOptions, onEdit]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
  });

  const getSelectedCount = (columnId) => {
    return table.getColumn(columnId)?.getFilterValue()?.length || 0;
  };

  return (
    <div className="table-container">
      {/* 
      ============================
      ORIGINAL GLOBAL FILTER BLOCK
      (Removed because it was commented wrongly)
      ============================
      */}

      <table className="tax-table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} style={{ position: 'relative' }}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Results count */}
      <div className="results-info">
        Showing {table.getRowModel().rows.length} of {data.length} records
      </div>

      {/* No results */}
      {table.getRowModel().rows.length === 0 && (
        <div className="no-results">No records found matching your filters.</div>
      )}
    </div>
  );
};
