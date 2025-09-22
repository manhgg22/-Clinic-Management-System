import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Empty } from 'antd';

const AppointmentChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <Empty description="No appointment data available" />;
  }

  // Format data for the chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    total: item.total,
    completed: item.completed,
    cancelled: item.cancelled,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          labelStyle={{ color: '#000' }}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #d9d9d9',
            borderRadius: '6px'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="total" 
          stroke="#1890ff" 
          strokeWidth={2}
          name="Total Appointments"
          dot={{ fill: '#1890ff', r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="completed" 
          stroke="#52c41a" 
          strokeWidth={2}
          name="Completed"
          dot={{ fill: '#52c41a', r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="cancelled" 
          stroke="#ff4d4f" 
          strokeWidth={2}
          name="Cancelled"
          dot={{ fill: '#ff4d4f', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AppointmentChart;
