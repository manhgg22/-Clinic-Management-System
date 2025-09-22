import React from 'react';
import { Typography, Card, Button } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const CreateUser = () => {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Tạo Tài Khoản Người Dùng</Title>
      </div>

      <Card>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <UserAddOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={3}>Tạo Tài Khoản Người Dùng</Title>
          <Paragraph type="secondary">
            Component này sẽ cung cấp biểu mẫu để tạo tài khoản bác sĩ và bệnh nhân mới.
            Các tính năng bao gồm chọn vai trò, nhập thông tin hồ sơ, phân công chuyên khoa cho bác sĩ
            và thông tin y tế cho bệnh nhân.
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default CreateUser;
