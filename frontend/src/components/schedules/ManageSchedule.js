import React from 'react';
import { Typography, Card, Button } from 'antd';
import { ArrowLeftOutlined, ScheduleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const ManageSchedule = () => {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />}
          onClick={() => window.history.back()}
          style={{ padding: 0, marginBottom: '8px' }}
        >
          Trở lại Lịch Khám
        </Button>
        <Title level={2}>Quản Lý Lịch Bác Sĩ</Title>
      </div>

      <Card>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <ScheduleOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={3}>Biểu mẫu Quản Lý Lịch</Title>
          <Paragraph type="secondary">
            Component này sẽ cung cấp biểu mẫu để thêm, chỉnh sửa và xóa lịch bác sĩ.
            Các tính năng bao gồm thiết lập khung giờ, lịch định kỳ, số lượng bệnh nhân tối đa mỗi khung giờ
            và xử lý xung đột lịch.
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default ManageSchedule;
