import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { updateProfile, selectUser, selectUserLoading, selectUserError } from '../../store/slices/userSlice';
import { updateUser, selectUser as selectAuthUser } from '../../store/slices/authSlice';

const { Title, Text } = Typography;

const UpdateProfile = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authUser = useSelector(selectAuthUser);
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authUser) {
      form.setFieldsValue({
        name: authUser.name,
        phone: authUser.phone || '',
      });
    }
  }, [authUser, form]);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      
      const result = await dispatch(updateProfile(values));
      
      if (result.type === 'user/updateProfile/fulfilled') {
        // Update the auth user data as well
        dispatch(updateUser(result.payload));
        
        message.success('Cập nhật hồ sơ thành công!');
        navigate('/profile');
      } else {
        message.error(error || 'Cập nhật hồ sơ thất bại');
      }
    } catch (err) {
      message.error('Đã xảy ra lỗi không mong muốn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (!authUser) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />}
          onClick={handleCancel}
          style={{ padding: 0, marginBottom: '8px' }}
        >
          Trở lại Hồ Sơ
        </Button>
        <Title level={2}>Cập Nhật Hồ Sơ</Title>
        <Text type="secondary">
          Cập nhật thông tin cá nhân của bạn
        </Text>
      </div>

      <Card className="info-card">
        <div className="form-container">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            requiredMark={false}
          >
            <div className="form-section">
              <div className="form-section-title">Thông Tin Cá Nhân</div>
              
              <Form.Item
                name="name"
                label="Họ và Tên"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập họ và tên của bạn',
                  },
                  {
                    min: 2,
                    message: 'Tên phải có ít nhất 2 ký tự',
                  },
                  {
                    max: 50,
                    message: 'Tên không thể vượt quá 50 ký tự',
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập họ và tên của bạn"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số Điện Thoại"
                rules={[
                  {
                    pattern: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Vui lòng nhập số điện thoại hợp lệ',
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại của bạn"
                />
              </Form.Item>
            </div>

            <div className="form-section">
              <div className="form-section-title">Thông Tin Tài Khoản</div>
              
              <Form.Item label="Địa Chỉ Email">
                <Input
                  value={authUser.email}
                  disabled
                  prefix={<UserOutlined />}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Địa chỉ email không thể thay đổi. Liên hệ quản trị viên nếu cần thiết.
                </Text>
              </Form.Item>

              <Form.Item label="Vai Trò">
                <Input
                  value={(() => {
                    const roleMap = {
                      'RECEPTIONIST': 'Lễ Tân',
                      'ADMIN': 'Quản Trị Viên',
                      'DOCTOR': 'Bác Sĩ',
                      'PATIENT': 'Bệnh Nhân'
                    };
                    return roleMap[authUser.role] || authUser.role;
                  })()}
                  disabled
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Vai trò của bạn được phân công bởi quản trị viên và không thể thay đổi.
                </Text>
              </Form.Item>
            </div>

            <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button size="large" onClick={handleCancel}>
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isSubmitting || isLoading}
                  style={{ minWidth: '120px' }}
                >
                  Cập Nhật Hồ Sơ
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default UpdateProfile;
