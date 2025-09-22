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
        
        message.success('Profile updated successfully!');
        navigate('/profile');
      } else {
        message.error(error || 'Failed to update profile');
      }
    } catch (err) {
      message.error('An unexpected error occurred');
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
          Back to Profile
        </Button>
        <Title level={2}>Update Profile</Title>
        <Text type="secondary">
          Update your personal information
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
              <div className="form-section-title">Personal Information</div>
              
              <Form.Item
                name="name"
                label="Full Name"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your full name',
                  },
                  {
                    min: 2,
                    message: 'Name must be at least 2 characters long',
                  },
                  {
                    max: 50,
                    message: 'Name cannot exceed 50 characters',
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter your full name"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  {
                    pattern: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Please enter a valid phone number',
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Enter your phone number"
                />
              </Form.Item>
            </div>

            <div className="form-section">
              <div className="form-section-title">Account Information</div>
              
              <Form.Item label="Email Address">
                <Input
                  value={authUser.email}
                  disabled
                  prefix={<UserOutlined />}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Email address cannot be changed. Contact administrator if needed.
                </Text>
              </Form.Item>

              <Form.Item label="Role">
                <Input
                  value={authUser.role?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  disabled
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Your role is assigned by the administrator and cannot be changed.
                </Text>
              </Form.Item>
            </div>

            <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button size="large" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isSubmitting || isLoading}
                  style={{ minWidth: '120px' }}
                >
                  Update Profile
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
