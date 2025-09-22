import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, Card, Alert, Typography, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { forgotPassword, selectAuthLoading, selectAuthError, clearError } from '../../store/slices/authSlice';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const handleSubmit = async (values) => {
    try {
      const result = await dispatch(forgotPassword(values.email));
      if (result.type === 'auth/forgotPassword/fulfilled') {
        setEmailSent(true);
        setSentEmail(values.email);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
    }
  };

  const handleFormChange = () => {
    if (error) {
      dispatch(clearError());
    }
  };

  if (emailSent) {
    return (
      <div className="login-container">
        <Card className="login-card">
          <Result
            icon={<MailOutlined style={{ color: '#1890ff' }} />}
            title="Kiểm tra Email của bạn"
            subTitle={
              <div>
                <Text>
                  Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong>{sentEmail}</strong>
                </Text>
                <br />
                <Text type="secondary">
                  Vui lòng kiểm tra email và làm theo hướng dẫn để đặt lại mật khẩu.
                </Text>
              </div>
            }
            extra={[
              <Button key="back" type="primary">
                <Link to="/login">
                  <ArrowLeftOutlined /> Trở lại Đăng nhập
                </Link>
              </Button>,
              <Button key="resend" onClick={() => setEmailSent(false)}>
                Gửi lại Email
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
            Quên Mật khẩu
          </Title>
          <Text className="login-subtitle">
            Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết đặt lại mật khẩu
          </Text>
        </div>

        {error && (
          <Alert
            message="Lỗi"
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
          name="forgotPassword"
          onFinish={handleSubmit}
          onChange={handleFormChange}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Địa chỉ Email"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập địa chỉ email!',
              },
              {
                type: 'email',
                message: 'Vui lòng nhập địa chỉ email hợp lệ!',
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập địa chỉ email của bạn"
              autoComplete="email"
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
              Gửi Liên kết Đặt lại
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login">
              <ArrowLeftOutlined /> Trở lại Đăng nhập
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
