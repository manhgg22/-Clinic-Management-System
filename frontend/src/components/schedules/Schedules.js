import React from 'react';
import { Typography, Card, Button } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Schedules = () => {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Lịch Bác Sĩ</Title>
      </div>

      <Card>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <CalendarOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={3}>Quản Lý Lịch Khám</Title>
          <Paragraph type="secondary">
            Component này sẽ hiển thị lịch khám của bác sĩ với bộ lọc theo chuyên khoa, khoảng ngày và tình trạng.
            Các tính năng bao gồm xem lịch hàng tuần/tháng, quản lý khung giờ và xử lý lịch hẹn định kỳ.
          </Paragraph>
          <Button type="primary" onClick={() => window.location.href = '/schedules/manage'}>
            Quản Lý Lịch
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Schedules;
