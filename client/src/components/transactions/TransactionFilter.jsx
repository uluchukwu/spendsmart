import { useState, useEffect, useRef } from 'react';
import { CATEGORIES, CATEGORY_LABELS, SORT_OPTIONS } from '../../utils/constants.js';
import styles from '../../styles/TransactionFilter.module.css';

const DEBOUNCE_MS = 400;

/**
 * @param {{ filters: object, onChange: (partial: object) => void }} props
 */
export default function TransactionFilter({ filters, onChange }) {
  const [search,   setSearch]   = useState(filters.search || '');
  const debounceRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange({ search, page: 1 });
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field, value) => {
    onChange({ [field]: value, page: 1 });
  };

  const handleClear = () => {
    setSearch('');
    onChange({ type: '', category: '', startDate: '', endDate: '', search: '', sort: '-date', page: 1 });
  };

  const hasActiveFilters =
    filters.type || filters.category || filters.startDate ||
    filters.endDate || search || filters.sort !== '-date';

  return (
    <div className={styles.filterBar}>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search descriptions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search transactions"
        />
        {search && (
          <button className={styles.clearSearch} onClick={() => setSearch('')} aria-label="Clear search">×</button>
        )}
      </div>

      <div className={styles.controls}>
        <select
          value={filters.type || ''}
          onChange={e => handleChange('type', e.target.value)}
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filters.category || ''}
          onChange={e => handleChange('category', e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.startDate || ''}
          onChange={e => handleChange('startDate', e.target.value)}
          aria-label="Start date"
          title="From date"
        />

        <input
          type="date"
          value={filters.endDate || ''}
          onChange={e => handleChange('endDate', e.target.value)}
          aria-label="End date"
          title="To date"
        />

        <select
          value={filters.sort || '-date'}
          onChange={e => handleChange('sort', e.target.value)}
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button className={styles.clearBtn} onClick={handleClear}>Clear filters</button>
        )}
      </div>
    </div>
  );
}
