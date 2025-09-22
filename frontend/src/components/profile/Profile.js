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
    return role?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
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
        message="Error Loading Profile"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!user) {
    return (
      <Alert
        message="Profile Not Found"
        description="Unable to load user profile information."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>My Profile</Title>
        <Text type="secondary">
          View and manage your account information
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
                {user.isActive ? 'Active' : 'Inactive'}
              </Tag>
            </div>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        <Descriptions 
          title="Personal Information" 
          bordered 
          column={{ xs: 1, sm: 1, md: 2 }}
          labelStyle={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}
        >
          <Descriptions.Item 
            label={
              <span>
                <UserOutlined style={{ marginRight: '8px' }} />
                Full Name
              </span>
            }
          >
            {user.name}
          </Descriptions.Item>

          <Descriptions.Item 
            label={
              <span>
                <MailOutlined style={{ marginRight: '8px' }} />
                Email Address
              </span>
            }
          >
            {user.email}
          </Descriptions.Item>

          <Descriptions.Item 
            label={
              <span>
                <PhoneOutlined style={{ marginRight: '8px' }} />
                Phone Number
              </span>
            }
          >
            {user.phone || <Text type="secondary">Not provided</Text>}
          </Descriptions.Item>

          <Descriptions.Item 
            label={
              <span>
                <IdcardOutlined style={{ marginRight: '8px' }} />
                Role
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
                Account Created
              </span>
            }
          >
            {moment(user.createdAt).format('MMMM DD, YYYY [at] h:mm A')}
          </Descriptions.Item>

          <Descriptions.Item 
            label="Account Status"
          >
            <Tag color={user.isActive ? 'green' : 'red'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Account Security" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text strong>Password</Text>
            <br />
            <Text type="secondary">
              Last updated: {moment(user.updatedAt).fromNow()}
            </Text>
          </div>
          <Button type="link" onClick={() => navigate('/forgot-password')}>
            Change Password
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
