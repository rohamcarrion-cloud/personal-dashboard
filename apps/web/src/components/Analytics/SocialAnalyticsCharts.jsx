import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const dummyData = [
  { name: 'Mon', linkedin: 400, twitter: 240, amt: 2400 },
  { name: 'Tue', linkedin: 300, twitter: 139, amt: 2210 },
  { name: 'Wed', linkedin: 200, twitter: 980, amt: 2290 },
  { name: 'Thu', linkedin: 278, twitter: 390, amt: 2000 },
  { name: 'Fri', linkedin: 189, twitter: 480, amt: 2181 },
  { name: 'Sat', linkedin: 239, twitter: 380, amt: 2500 },
  { name: 'Sun', linkedin: 349, twitter: 430, amt: 2100 },
];

export function PublishingFrequency() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Publishing Frequency</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dummyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
            <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="linkedin" stackId="a" fill="hsl(221 83% 53%)" radius={[0, 0, 4, 4]} name="LinkedIn" />
            <Bar dataKey="twitter" stackId="a" fill="hsl(203 89% 53%)" radius={[4, 4, 0, 0]} name="X / Twitter" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function EngagementTrends() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Engagement Trends</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dummyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="linkedin" stroke="hsl(221 83% 53%)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="LinkedIn" />
            <Line type="monotone" dataKey="twitter" stroke="hsl(203 89% 53%)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="X / Twitter" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function FailureRate() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Failure Rate</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="60" cy="60" r="56" fill="transparent" stroke="hsl(0 84% 60%)" strokeWidth="8" strokeDasharray="351.8" strokeDashoffset="340" />
            </svg>
            <span className="text-2xl font-bold text-foreground">3.4%</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">Failed publishing attempts across all connected platforms in the last 30 days.</p>
        </div>
      </CardContent>
    </Card>
  );
}