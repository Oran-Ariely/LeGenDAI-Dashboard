"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import styles from './LeadsTable.module.css'; // We can reuse styles or use custom styling

export default function TimeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('days') || 'all';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('days');
    } else {
      params.set('days', value);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid var(--glass-border)',
      borderRadius: '8px',
      padding: '0.25rem 0.75rem',
      width: 'fit-content'
    }}>
      <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
      <select
        value={currentFilter}
        onChange={handleChange}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: '0.9rem',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        <option value="all" style={{ background: '#121214' }}>כל הזמנים</option>
        <option value="today" style={{ background: '#121214' }}>היום</option>
        <option value="7" style={{ background: '#121214' }}>7 ימים אחרונים</option>
        <option value="30" style={{ background: '#121214' }}>30 ימים אחרונים</option>
      </select>
    </div>
  );
}
