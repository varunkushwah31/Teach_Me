import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const sampleRadarData = [
  { subject: 'Quantum Mech', score: 88, fullMark: 100 },
  { subject: 'Org Chem', score: 74, fullMark: 100 },
  { subject: 'Algorithms', score: 92, fullMark: 100 },
  { subject: 'MicroEcon', score: 68, fullMark: 100 },
  { subject: 'Statistics', score: 85, fullMark: 100 },
];

interface RadarProps {
  data?: typeof sampleRadarData;
}

export const RadarChartComponent: React.FC<RadarProps> = ({ data = sampleRadarData }) => {
  return (
    <div className="w-full h-64 font-mono text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#27272A" />
          <PolarAngleAxis dataKey="subject" stroke="#A1A1AA" tick={{ fill: '#A1A1AA', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#27272A" tick={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1A1A',
              borderColor: '#27272A',
              borderRadius: '8px',
              color: '#FFFFFF',
            }}
          />
          <Radar
            name="Quiz Score %"
            dataKey="score"
            stroke="#F97316"
            fill="#F97316"
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
