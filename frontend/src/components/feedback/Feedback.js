import React from 'react';
import { Typography, Card, Button } from 'antd';
import { StarOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Feedback = () => {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Đánh Giá Bệnh Nhân</Title>
      </div>

      <Card>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <StarOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={3}>Quản Lý Đánh Giá</Title>
          <Paragraph type="secondary">
            Component này sẽ hiển thị phản hồi và đánh giá của bệnh nhân với hệ thống xếp hạng.
            Các tính năng bao gồm xem đánh giá theo bác sĩ, lọc theo điểm số, quản lý hiển thị đánh giá
            và trả lời các bình luận của bệnh nhân.
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default Feedback;
