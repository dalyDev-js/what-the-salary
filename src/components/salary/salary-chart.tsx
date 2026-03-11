'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTranslations } from 'next-intl';

interface SalaryChartProps {
  data: { range: string; count: number }[];
}

export function SalaryChart({ data }: SalaryChartProps) {
  const t = useTranslations('salary');

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
        {t('distribution')}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb20" vertical={false} />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={false}
            contentStyle={{
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f9fafb',
              fontSize: '13px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
            }}
            labelStyle={{ color: '#9ca3af', marginBottom: '2px' }}
            itemStyle={{ color: '#86efac' }}
          />
          <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
