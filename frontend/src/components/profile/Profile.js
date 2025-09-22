import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Descriptions, Button, Avatar, Typography, Tag, Spin, Alert } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { getCurrentUser, selectUser, selectAuthLoading, selectAuthError } from '../../store/slices/authSlice';
import moment from 'moment';
import 'moment/locale/vi';

const { Title, Text } = Typography;

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  useEffect(() => {
    if (!user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  const getRoleColor = (role) => {
    switch (role) {
      case 'RECEPTIONIST':
        return 'blue';
      case 'ADMIN':
        return 'red';
      case 'DOCTOR':
        return 'green';
      case 'PATIENT':
        return 'orange';
      default:
        return 'default';
    }
  };

  const formatRole = (role) => {
    const roleMap = {
      'RECEPTIONIST': 'Lễ Tân',
      'ADMIN': 'Quản Trị Viên',
      'DOCTOR': 'Bác Sĩ',
      'PATIENT': 'Bệnh Nhân'
    };
    return roleMap[role] || role;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi Tải Hồ Sơ"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!user) {
    return (
      <Alert
        message="Không Tìm Thấy Hồ Sơ"
        description="Không thể tải thông tin hồ sơ người dùng."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Hồ Sơ Của Tôi</Title>
        <Text type="secondary">
          Xem và quản lý thông tin tài khoản của bạn
        </Text>
      </div>

      <Card className="info-card">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '24px' }}>
          <Avatar 
            size={80} 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ margin: 0, marginBottom: '8px' }}>
              {user.name}
            </Title>
            <div style={{ marginBottom: '12px' }}>
              <Tag color={getRoleColor(user.role)} icon={<IdcardOutlined />}>
                {formatRole(user.role)}
              </Tag>
              <Tag color={user.isActive ? 'green' : 'red'}>
                {user.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
              </Tag>
            </div>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => navigate('/profile/edit')}
            >
              Chỉnh Sửa Hồ Sơ
            </Button>
          </div>
        </div>

        <Descriptions 
          title="Thông Tin Cá Nhân" 
          bordered 
          column={{ xs: 1, sm: 1, md: 2 }}
          labelStyle={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}
        >
          <Descriptions.Item 
            label={
              <span>
                <UserOutlined style={{ marginRight: '8px' }} />
                Họ và Tên
              </span>
            }
          >
            {user.name}
          </Descriptions.Item>

          <Descriptions.Item 
            label={
              <span>
                <MailOutlined style={{ marginRight: '8px' }} />
                Địa Chỉ Email
              </span>
            }
          >
            {user.email}
          </Descriptions.Item>

          <Descriptions.Item 
            label={
              <span>
                <PhoneOutlined style={{ marginRight: '8px' }} />
                Số Điện Thoại
              </span>
            }
          >
            {user.phone || <Text type="secondary">Chưa cung cấp</Text>}
          </Descriptions.Item>

          <Descriptions.Item 
            label={
              <span>
                <IdcardOutlined style={{ marginRight: '8px' }} />
                Vai Trò
              </span>
            }
          >
            <Tag color={getRoleColor(user.role)}>
              {formatRole(user.role)}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item 
            label={
              <span>
                <CalendarOutlined style={{ marginRight: '8px' }} />
                Tài Khoản Được Tạo
              </span>
            }
          >
            {moment(user.createdAt).format('DD/MM/YYYY [lúc] HH:mm')}
          </Descriptions.Item>

          <Descriptions.Item 
            label="Trạng Thái Tài Khoản"
          >
            <Tag color={user.isActive ? 'green' : 'red'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Bảo Mật Tài Khoản" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text strong>Mật khẩu</Text>
            <br />
            <Text type="secondary">
              Cập nhật lần cuối: {moment(user.updatedAt).locale('vi').fromNow()}
            </Text>
          </div>
          <Button type="link" onClick={() => navigate('/forgot-password')}>
            Đổi Mật khẩu
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
