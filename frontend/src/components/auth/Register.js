import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, Card, Alert, Typography, Select, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { register, selectAuthLoading, selectAuthError, clearError } from '../../store/slices/authSlice';

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const handleSubmit = async (values) => {
    try {
      const result = await dispatch(register(values));
      if (result.type === 'auth/register/fulfilled') {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  const handleFormChange = () => {
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" style={{ maxWidth: '500px' }}>
        <div className="login-header">
          <MedicineBoxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <Title level={2} className="login-title">
            Hệ Thống Quản Lý Phòng Khám
          </Title>
          <Text className="login-subtitle">
            Tạo tài khoản - Tham gia hệ thống quản lý phòng khám
          </Text>
        </div>

        {error && (
          <Alert
            message="Đăng ký thất bại"
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
          name="register"
          onFinish={handleSubmit}
          onChange={handleFormChange}
          layout="vertical"
          size="large"
          initialValues={{
            role: 'PATIENT'
          }}
        >
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập họ và tên!',
              },
              {
                min: 2,
                message: 'Tên phải có ít nhất 2 ký tự!',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập họ và tên của bạn"
              autoComplete="name"
            />
          </Form.Item>

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
              prefix={<MailOutlined />}
              placeholder="Nhập email của bạn"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              {
                pattern: /^[\+]?[1-9][\d]{0,15}$/,
                message: 'Vui lòng nhập số điện thoại hợp lệ!',
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Nhập số điện thoại của bạn"
              autoComplete="tel"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Loại tài khoản"
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn loại tài khoản!',
              },
            ]}
          >
            <Select placeholder="Chọn loại tài khoản">
              <Option value="PATIENT">Bệnh nhân</Option>
              <Option value="DOCTOR">Bác sĩ</Option>
              <Option value="RECEPTIONIST">Lễ tân</Option>
            </Select>
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
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu của bạn"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: 'Vui lòng xác nhận mật khẩu!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Hai mật khẩu không khớp nhau!'));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu của bạn"
              autoComplete="new-password"
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
              Tạo Tài Khoản
            </Button>
          </Form.Item>

          <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
            <Text type="secondary">
              Đã có tài khoản?{' '}
              <Link to="/login" style={{ fontWeight: 'bold' }}>
                Đăng nhập tại đây
              </Link>
            </Text>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
