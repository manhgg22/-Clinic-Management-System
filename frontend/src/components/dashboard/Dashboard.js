import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Statistic, Typography, Spin, Alert } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { fetchReportsOverview, selectReportsOverview, selectReportLoading, selectReportError } from '../../store/slices/reportSlice';
import AppointmentChart from './AppointmentChart';
import RevenueChart from './RevenueChart';
import SpecialtyChart from './SpecialtyChart';
import RecentActivities from './RecentActivities';

const { Title, Text } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const overview = useSelector(selectReportsOverview);
  const isLoading = useSelector(selectReportLoading);
  const error = useSelector(selectReportError);

  useEffect(() => {
    dispatch(fetchReportsOverview());
  }, [dispatch]);

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
        message="Error Loading Dashboard"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  const stats = overview?.summary || {};

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Trang Chủ</Title>
        <Text type="secondary">
          Chào mừng đến với Hệ Thống Quản Lý Phòng Khám - Cổng Lễ Tân
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="dashboard-stats">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Bệnh Nhân"
              value={stats.totalPatients || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Bác Sĩ"
              value={stats.totalDoctors || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Lịch Hẹn"
              value={stats.totalAppointments || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Doanh Thu"
              value={stats.totalRevenue || 0}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#fa8c16' }}
              suffix="đ"
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Tỷ Lệ Hoàn Thành"
              value={stats.completionRate || 0}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: stats.completionRate >= 80 ? '#52c41a' : '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Tỷ Lệ Hủy"
              value={stats.cancellationRate || 0}
              suffix="%"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: stats.cancellationRate <= 10 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="dashboard-charts">
        <Col xs={24} lg={12}>
          <Card title="Xu Hướng Lịch Hẹn Hàng Ngày" className="dashboard-chart">
            <AppointmentChart data={overview?.charts?.dailyTrends || []} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Doanh Thu Hàng Tháng" className="dashboard-chart">
            <RevenueChart data={overview?.charts?.monthlyRevenue || []} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Lịch Hẹn Theo Chuyên Khoa" className="dashboard-chart">
            <SpecialtyChart data={overview?.charts?.specialtyStats || []} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Hoạt Động Gần Đây" className="dashboard-chart">
            <RecentActivities />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
