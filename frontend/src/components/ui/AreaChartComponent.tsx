import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const sampleData = [
  { day: 'Mon', documents: 4, studyHours: 2.5 },
  { day: 'Tue', documents: 7, studyHours: 4.0 },
  { day: 'Wed', documents: 12, studyHours: 5.2 },
  { day: 'Thu', documents: 9, studyHours: 3.8 },
  { day: 'Fri', documents: 15, studyHours: 6.5 },
  { day: 'Sat', documents: 18, studyHours: 7.2 },
  { day: 'Sun', documents: 22, studyHours: 8.0 },
];

interface ChartProps {
  data?: typeof sampleData;
}

export const AreaChartComponent: React.FC<ChartProps> = ({ data = sampleData }) => {
  return (
    <div className="w-full h-64 font-mono text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis dataKey="day" stroke="#94A3B8" tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
          <YAxis stroke="#94A3B8" tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(13, 13, 23, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              color: '#F8FAFC',
              backdropFilter: 'blur(8px)',
            }}
            itemStyle={{ color: '#94A3B8' }}
          />
          <Area
            type="monotone"
            dataKey="documents"
            name="Documents Analyzed"
            stroke="#F97316"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDocs)"
          />
          <Area
            type="monotone"
            dataKey="studyHours"
            name="Study Hours"
            stroke="#06B6D4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorHours)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
