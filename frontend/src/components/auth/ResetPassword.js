import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, Card, Alert, Typography, Result } from 'antd';
import { LockOutlined, CheckCircleOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { resetPassword, selectAuthLoading, selectAuthError, clearError } from '../../store/slices/authSlice';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [resetSuccess, setResetSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const handleSubmit = async (values) => {
    try {
      const result = await dispatch(resetPassword({ 
        token, 
        password: values.password 
      }));
      if (result.type === 'auth/resetPassword/fulfilled') {
        setResetSuccess(true);
      }
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  const handleFormChange = () => {
    if (error) {
      dispatch(clearError());
    }
  };

  if (resetSuccess) {
    return (
      <div className="login-container">
        <Card className="login-card">
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Đặt lại Mật khẩu Thành công"
            subTitle="Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới."
            extra={[
              <Button key="login" type="primary" onClick={() => navigate('/login')}>
                Đi tới Đăng nhập
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <MedicineBoxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <Title level={2} className="login-title">
            Đặt lại Mật khẩu
          </Title>
          <Text className="login-subtitle">
            Vui lòng nhập mật khẩu mới của bạn
          </Text>
        </div>

        {error && (
          <Alert
            message="Đặt lại Thất bại"
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
          name="resetPassword"
          onFinish={handleSubmit}
          onChange={handleFormChange}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="password"
            label="Mật khẩu Mới"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập mật khẩu mới!',
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
              placeholder="Nhập mật khẩu mới của bạn"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận Mật khẩu Mới"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: 'Vui lòng xác nhận mật khẩu mới!',
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
              placeholder="Xác nhận mật khẩu mới của bạn"
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
              Đặt lại Mật khẩu
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login">
              Trở lại Đăng nhập
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;
