import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Spin,
  Alert,
  DatePicker,
  Select,
  Button,
  Space,
  Table,
  Tag,
  Progress,
} from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  TrophyOutlined,
  DownloadOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import {
  fetchReportsOverview,
  selectReportsOverview,
  selectReportLoading,
  selectReportError,
} from '../../store/slices/reportSlice';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const dispatch = useDispatch();
  const overview = useSelector(selectReportsOverview);
  const isLoading = useSelector(selectReportLoading);
  const error = useSelector(selectReportError);

  const [dateRange, setDateRange] = useState([
    moment().subtract(30, 'days'),
    moment(),
  ]);
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    dispatch(fetchReportsOverview());
  }, [dispatch]);

  // Mock data for demonstration
  const mockData = {
    summary: {
      totalPatients: 145,
      totalDoctors: 8,
      totalAppointments: 423,
      totalRevenue: 125000000,
      completionRate: 85.6,
      avgRating: 4.3,
    },
    appointmentsByStatus: [
      { status: 'Đã hoàn thành', count: 280, percentage: 66.2 },
      { status: 'Đã xác nhận', count: 85, percentage: 20.1 },
      { status: 'Đã đặt', count: 45, percentage: 10.6 },
      { status: 'Đã hủy', count: 13, percentage: 3.1 },
    ],
    topDoctors: [
      {
        key: '1',
        name: 'BS. Nguyễn Văn Đức',
        specialty: 'Tim mạch',
        appointments: 85,
        rating: 4.8,
        revenue: 25500000,
      },
      {
        key: '2',
        name: 'BS. Trần Thị Lan',
        specialty: 'Da liễu',
        appointments: 72,
        rating: 4.6,
        revenue: 21600000,
      },
      {
        key: '3',
        name: 'BS. Lê Minh Hoàng',
        specialty: 'Thần kinh',
        appointments: 68,
        rating: 4.5,
        revenue: 20400000,
      },
    ],
    monthlyTrends: [
      { month: 'T1', appointments: 120, revenue: 36000000 },
      { month: 'T2', appointments: 135, revenue: 40500000 },
      { month: 'T3', appointments: 142, revenue: 42600000 },
      { month: 'T4', appointments: 128, revenue: 38400000 },
      { month: 'T5', appointments: 156, revenue: 46800000 },
      { month: 'T6', apartments: 148, revenue: 44400000 },
    ],
  };

  const stats = overview?.summary || mockData.summary;

  const doctorColumns = [
    {
      title: 'Bác sĩ',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Chuyên khoa',
      dataIndex: 'specialty',
      key: 'specialty',
      render: (specialty) => <Tag color="blue">{specialty}</Tag>,
    },
    {
      title: 'Số lịch hẹn',
      dataIndex: 'appointments',
      key: 'appointments',
      sorter: (a, b) => a.appointments - b.appointments,
      render: (count) => (
        <Statistic
          value={count}
          valueStyle={{ fontSize: '14px' }}
          prefix={<CalendarOutlined />}
        />
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      sorter: (a, b) => a.rating - b.rating,
      render: (rating) => (
        <div>
          <Text strong>{rating}</Text>
          <Progress
            percent={(rating / 5) * 100}
            showInfo={false}
            size="small"
            strokeColor="#fadb14"
            style={{ marginTop: 4 }}
          />
        </div>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a, b) => a.revenue - b.revenue,
      render: (revenue) => (
        <Text strong style={{ color: '#52c41a' }}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(revenue)}
        </Text>
      ),
    },
  ];

  const handleExportReport = () => {
    // Mock export functionality
    console.log('Xuất báo cáo...', { dateRange, reportType });
    // In a real app, this would trigger a download
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
        message="Lỗi Tải Báo Cáo"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Báo Cáo Hoạt Động</Title>
        <Text type="secondary">
          Xem và phân tích dữ liệu hoạt động của phòng khám
        </Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>Khoảng thời gian:</Text>
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col>
            <Text strong>Loại báo cáo:</Text>
          </Col>
          <Col>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: 150 }}
            >
              <Option value="overview">Tổng quan</Option>
              <Option value="appointments">Lịch hẹn</Option>
              <Option value="revenue">Doanh thu</Option>
              <Option value="doctors">Bác sĩ</Option>
            </Select>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportReport}
            >
              Xuất báo cáo
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Overview Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng bệnh nhân"
              value={stats.totalPatients}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng bác sĩ"
              value={stats.totalDoctors}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng lịch hẹn"
              value={stats.totalAppointments}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) =>
                new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  notation: 'compact',
                }).format(value)
              }
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and Details */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Trạng thái lịch hẹn" extra={<BarChartOutlined />}>
            <div style={{ padding: '20px 0' }}>
              {mockData.appointmentsByStatus.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <Text>{item.status}</Text>
                  <div style={{ flex: 1, margin: '0 16px' }}>
                    <Progress
                      percent={item.percentage}
                      showInfo={false}
                      strokeColor={
                        index === 0
                          ? '#52c41a'
                          : index === 1
                          ? '#1890ff'
                          : index === 2
                          ? '#fa8c16'
                          : '#ff4d4f'
                      }
                    />
                  </div>
                  <Text strong>{item.count}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Hiệu suất tổng thể" extra={<TrophyOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Tỷ lệ hoàn thành"
                  value={stats.completionRate}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress
                  percent={stats.completionRate}
                  strokeColor="#52c41a"
                  style={{ marginTop: '8px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Đánh giá trung bình"
                  value={stats.avgRating}
                  suffix="/ 5"
                  valueStyle={{ color: '#fadb14' }}
                />
                <Progress
                  percent={(stats.avgRating / 5) * 100}
                  strokeColor="#fadb14"
                  style={{ marginTop: '8px' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Top Doctors Table */}
      <Card
        title="Bác sĩ hiệu suất cao"
        style={{ marginTop: '24px' }}
        extra={
          <Space>
            <Text type="secondary">Top 3 bác sĩ trong tháng</Text>
          </Space>
        }
      >
        <Table
          columns={doctorColumns}
          dataSource={mockData.topDoctors}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Reports;