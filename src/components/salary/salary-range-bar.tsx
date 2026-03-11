'use client';
import { formatSalary } from '@/lib/utils';

interface SalaryRangeBarProps {
  min: number;
  max: number;
  median: number;
  avg: number;
}

export function SalaryRangeBar({ min, max, median, avg }: SalaryRangeBarProps) {
  const range = max - min || 1;
  const medianPct = Math.min(Math.max(((median - min) / range) * 100, 2), 98);

  return (
    <div className="space-y-2">
      {/* Bar track */}
      <div className="relative h-2 rounded-full bg-gray-100 dark:bg-gray-700">
        {/* Filled gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-200 to-green-500" />
        {/* Median dot — absolutely positioned, no conflicting Tailwind transform classes */}
        <div
          style={{
            position: 'absolute',
            left: `${medianPct}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#15803d',
            outline: '2.5px solid white',
            outlineOffset: 0,
            zIndex: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>{formatSalary(min)}</span>
        <span className="font-semibold text-green-600">~{formatSalary(median)}</span>
        <span>{formatSalary(max)}</span>
      </div>
    </div>
  );
}
