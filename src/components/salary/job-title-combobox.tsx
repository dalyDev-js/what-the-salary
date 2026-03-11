'use client';
import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons';
import axios from '@/lib/axios';
import type { JobStats } from '@/types';

interface JobTitleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function JobTitleCombobox({ value, onChange, error }: JobTitleComboboxProps) {
  const [query, setQuery] = useState(value ?? '');
  const [results, setResults] = useState<JobStats[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    setQuery(value ?? '');
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get<{ data: JobStats[] }>('/jobs', {
          params: { search: query.trim(), limit: 8 },
        });
        setResults(res.data.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasExactMatch = results.some(
    r => r.jobTitle.toLowerCase() === query.trim().toLowerCase()
  );

  const showDropdown = open && query.trim().length >= 2 && (results.length > 0 || (!loading && !hasExactMatch));

  const selectTitle = (title: string) => {
    setQuery(title);
    onChange(title);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        <input
          type="text"
          value={query}
          placeholder="e.g. Software Engineer"
          autoComplete="off"
          onChange={e => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className={`w-full rounded-lg border ${error ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-900 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white placeholder:text-gray-400`}
        />
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
          {results.map(job => (
            <button
              key={job.jobSlug}
              type="button"
              onMouseDown={() => selectTitle(job.jobTitle)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <span className="text-gray-900 dark:text-white font-medium">{job.jobTitle}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 shrink-0">
                {job.count} {job.count === 1 ? 'entry' : 'entries'}
              </span>
            </button>
          ))}

          {!hasExactMatch && query.trim().length >= 2 && (
            <>
              {results.length > 0 && (
                <div className="h-px bg-gray-100 dark:bg-gray-800 mx-2" />
              )}
              <button
                type="button"
                onMouseDown={() => selectTitle(query.trim())}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-green-600 dark:text-green-400"
              >
                <PlusIcon className="w-4 h-4 shrink-0" />
                <span>Create &ldquo;<span className="font-medium">{query.trim()}</span>&rdquo;</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
