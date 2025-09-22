import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, Card, Alert, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { login, selectAuthLoading, selectAuthError, clearError } from '../../store/slices/authSlice';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const handleSubmit = async (values) => {
    try {
      const result = await dispatch(login(values));
      if (result.type === 'auth/login/fulfilled') {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleFormChange = () => {
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <MedicineBoxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <Title level={2} className="login-title">
            Hệ Thống Quản Lý Phòng Khám
          </Title>
          <Text className="login-subtitle">
            Cổng Lễ Tân - Đăng nhập vào tài khoản của bạn
          </Text>
        </div>

        {error && (
          <Alert
            message="Đăng nhập thất bại"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => dispatch(clearError())}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          onChange={handleFormChange}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập email!',
              },
              {
                type: 'email',
                message: 'Vui lòng nhập địa chỉ email hợp lệ!',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập email của bạn"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập mật khẩu!',
              },
              {
                min: 6,
                message: 'Mật khẩu phải có ít nhất 6 ký tự!',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu của bạn"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              style={{ height: '48px', fontSize: '16px' }}
            >
              Đăng Nhập
            </Button>
          </Form.Item>

          <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
            <Link to="/forgot-password">
              <Text type="secondary">Quên mật khẩu?</Text>
            </Link>
            <Text type="secondary">
              Chưa có tài khoản?{' '}
              <Link to="/register" style={{ fontWeight: 'bold' }}>
                Đăng ký tại đây
              </Link>
            </Text>
          </Space>
        </Form>

        <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <strong>Tài khoản Demo:</strong><br />
            Email: receptionist@clinic.com<br />
            Mật khẩu: password123
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
