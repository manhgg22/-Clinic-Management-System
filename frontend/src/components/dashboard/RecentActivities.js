import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { List, Avatar, Typography, Tag, Empty, Spin } from 'antd';
import {
  CalendarOutlined,
  UserAddOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { fetchAppointments, selectAppointments, selectAppointmentLoading } from '../../store/slices/appointmentSlice';
import moment from 'moment';

const { Text } = Typography;

const RecentActivities = () => {
  const dispatch = useDispatch();
  const appointments = useSelector(selectAppointments);
  const isLoading = useSelector(selectAppointmentLoading);

  useEffect(() => {
    // Fetch recent appointments (last 10)
    dispatch(fetchAppointments({ 
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }));
  }, [dispatch]);

  const getActivityIcon = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <CalendarOutlined style={{ color: '#1890ff' }} />;
      case 'CONFIRMED':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'COMPLETED':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'CANCELLED':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'IN_PROGRESS':
        return <ClockCircleOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <UserAddOutlined style={{ color: '#722ed1' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'blue';
      case 'CONFIRMED':
        return 'green';
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      case 'IN_PROGRESS':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getActivityDescription = (appointment) => {
    const patientName = appointment.patient?.user?.name || 'Unknown Patient';
    const doctorName = appointment.doctor?.user?.name || 'Unknown Doctor';
    const appointmentDate = moment(appointment.appointmentDate).format('MMM DD, YYYY');
    
    switch (appointment.status) {
      case 'SCHEDULED':
        return `New appointment scheduled for ${patientName} with Dr. ${doctorName} on ${appointmentDate}`;
      case 'CONFIRMED':
        return `Appointment confirmed for ${patientName} with Dr. ${doctorName}`;
      case 'COMPLETED':
        return `Appointment completed for ${patientName} with Dr. ${doctorName}`;
      case 'CANCELLED':
        return `Appointment cancelled for ${patientName} with Dr. ${doctorName}`;
      case 'IN_PROGRESS':
        return `Appointment in progress for ${patientName} with Dr. ${doctorName}`;
      default:
        return `Appointment updated for ${patientName} with Dr. ${doctorName}`;
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin />
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return <Empty description="No recent activities" />;
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={appointments.slice(0, 8)}
      renderItem={(appointment) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Avatar 
                icon={getActivityIcon(appointment.status)}
                style={{ backgroundColor: '#f5f5f5' }}
              />
            }
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text style={{ fontSize: '14px' }}>
                  {getActivityDescription(appointment)}
                </Text>
                <Tag 
                  color={getStatusColor(appointment.status)}
                  style={{ fontSize: '11px' }}
                >
                  {appointment.status}
                </Tag>
              </div>
            }
            description={
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {moment(appointment.createdAt).fromNow()}
              </Text>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default RecentActivities;
