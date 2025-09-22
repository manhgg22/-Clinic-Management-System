import React from 'react';
import { Typography, Card, Button } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Reports = () => {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Báo Cáo Hoạt Động</Title>
      </div>

      <Card>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <FileTextOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={3}>Tạo Báo Cáo</Title>
          <Paragraph type="secondary">
            Component này sẽ cung cấp các tính năng báo cáo toàn diện bao gồm thống kê bệnh nhân,
            phân tích lịch hẹn, chỉ số hiệu suất bác sĩ, báo cáo doanh thu và lọc khoảng ngày tùy chỉnh.
            Báo cáo có thể được xuất ra định dạng PDF và Excel.
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
