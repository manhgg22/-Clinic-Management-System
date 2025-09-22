import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Empty } from 'antd';

const RevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <Empty description="No revenue data available" />;
  }

  // Format data for the chart
  const chartData = data.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { 
      month: 'short', 
      year: '2-digit' 
    }),
    revenue: item.revenue,
    appointments: item.appointments,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="month" 
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
          formatter={(value, name) => [
            name === 'revenue' ? `$${value.toLocaleString()}` : value,
            name === 'revenue' ? 'Revenue' : 'Appointments'
          ]}
        />
        <Bar 
          dataKey="revenue" 
          fill="#1890ff" 
          name="Revenue"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
