import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Table,
  Rate,
  Typography,
  Tag,
  Space,
  Button,
  Select,
  Input,
  Modal,
  Avatar,
  Row,
  Col,
  Statistic,
  Progress,
  Spin,
  Alert,
  Tooltip,
  message,
} from 'antd';
import {
  StarOutlined,
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Feedback = () => {
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    rating: null,
    doctor: null,
    status: null,
  });
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Mock data
  const mockFeedbacks = [
    {
      key: '1',
      id: 'FB001',
      patientName: 'Nguyễn Văn An',
      doctorName: 'BS. Nguyễn Văn Đức',
      specialty: 'Tim mạch',
      rating: 5,
      comment: 'Bác sĩ rất tận tâm và chuyên nghiệp. Khám bệnh rất kỹ lưỡng và giải thích rõ ràng về tình trạng bệnh.',
      date: '2024-01-15',
      status: 'approved',
      categories: {
        doctorProfessionalism: 5,
        waitTime: 4,
        facilityCleaniness: 5,
        staffFriendliness: 5,
        overallExperience: 5,
      },
      wouldRecommend: true,
      anonymous: false,
      helpfulVotes: 12,
    },
    {
      key: '2',
      id: 'FB002',
      patientName: 'Trần Thị Bình',
      doctorName: 'BS. Trần Thị Lan',
      specialty: 'Da liễu',
      rating: 4,
      comment: 'Dịch vụ tốt, nhân viên thân thiện. Thời gian chờ hơi lâu nhưng bác sĩ khám rất cẩn thận.',
      date: '2024-01-14',
      status: 'approved',
      categories: {
        doctorProfessionalism: 4,
        waitTime: 3,
        facilityCleaniness: 4,
        staffFriendliness: 5,
        overallExperience: 4,
      },
      wouldRecommend: true,
      anonymous: false,
      helpfulVotes: 8,
    },
    {
      key: '3',
      id: 'FB003',
      patientName: 'Lê Văn Cường',
      doctorName: 'BS. Lê Minh Hoàng',
      specialty: 'Thần kinh',
      rating: 5,
      comment: 'Phòng khám sạch sẽ, trang thiết bị hiện đại. Bác sĩ giải thích rất rõ ràng về phương pháp điều trị.',
      date: '2024-01-13',
      status: 'approved',
      categories: {
        doctorProfessionalism: 5,
        waitTime: 4,
        facilityCleaniness: 5,
        staffFriendliness: 4,
        overallExperience: 5,
      },
      wouldRecommend: true,
      anonymous: false,
      helpfulVotes: 15,
    },
    {
      key: '4',
      id: 'FB004',
      patientName: 'Phạm Thị Dung',
      doctorName: 'BS. Phạm Thị Hoa',
      specialty: 'Nhi khoa',
      rating: 3,
      comment: 'Cần cải thiện thời gian chờ đợi. Bác sĩ khám tốt nhưng thái độ nhân viên lễ tân chưa thật sự nhiệt tình.',
      date: '2024-01-12',
      status: 'pending',
      categories: {
        doctorProfessionalism: 4,
        waitTime: 2,
        facilityCleaniness: 4,
        staffFriendliness: 2,
        overallExperience: 3,
      },
      wouldRecommend: false,
      anonymous: false,
      helpfulVotes: 3,
    },
    {
      key: '5',
      id: 'FB005',
      patientName: 'Người dùng ẩn danh',
      doctorName: 'BS. Võ Văn Thành',
      specialty: 'Chỉnh hình',
      rating: 5,
      comment: 'Rất hài lòng với dịch vụ. Sẽ giới thiệu cho bạn bè và người thân.',
      date: '2024-01-11',
      status: 'approved',
      categories: {
        doctorProfessionalism: 5,
        waitTime: 5,
        facilityCleaniness: 4,
        staffFriendliness: 5,
        overallExperience: 5,
      },
      wouldRecommend: true,
      anonymous: true,
      helpfulVotes: 20,
    },
  ];

  const mockStats = {
    totalFeedbacks: 156,
    avgRating: 4.3,
    approvedFeedbacks: 142,
    pendingFeedbacks: 14,
    recommendationRate: 87.2,
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFeedbacks(mockFeedbacks);
      setFilteredFeedbacks(mockFeedbacks);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = mockFeedbacks;

    if (filters.search) {
      filtered = filtered.filter(
        (feedback) =>
          feedback.patientName.toLowerCase().includes(filters.search.toLowerCase()) ||
          feedback.doctorName.toLowerCase().includes(filters.search.toLowerCase()) ||
          feedback.comment.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.rating) {
      filtered = filtered.filter((feedback) => feedback.rating === filters.rating);
    }

    if (filters.doctor) {
      filtered = filtered.filter((feedback) => feedback.doctorName === filters.doctor);
    }

    if (filters.status) {
      filtered = filtered.filter((feedback) => feedback.status === filters.status);
    }

    setFilteredFeedbacks(filtered);
  }, [filters]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'orange';
      case 'rejected':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const handleViewDetail = (feedback) => {
    setSelectedFeedback(feedback);
    setDetailModalVisible(true);
  };

  const handleApprove = (feedbackId) => {
    message.success(`Đã duyệt đánh giá ${feedbackId}`);
    // Update feedback status in real app
  };

  const handleReject = (feedbackId) => {
    message.warning(`Đã từ chối đánh giá ${feedbackId}`);
    // Update feedback status in real app
  };

  const columns = [
    {
      title: 'Bệnh nhân',
      dataIndex: 'patientName',
      key: 'patientName',
      render: (name, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <Text strong>{name}</Text>
            {record.anonymous && <Tag size="small" color="blue">Ẩn danh</Tag>}
          </div>
        </Space>
      ),
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'doctorName',
      key: 'doctorName',
      render: (name, record) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.specialty}
          </Text>
        </div>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <div>
          <Rate disabled defaultValue={rating} style={{ fontSize: '16px' }} />
          <Text strong style={{ marginLeft: '8px' }}>
            {rating}/5
          </Text>
        </div>
      ),
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: 'Nhận xét',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (comment) => (
        <Tooltip title={comment}>
          <Text>{comment.length > 50 ? `${comment.substring(0, 50)}...` : comment}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Hữu ích',
      dataIndex: 'helpfulVotes',
      key: 'helpfulVotes',
      render: (votes) => (
        <Space>
          <Text>{votes}</Text>
          <Text type="secondary">👍</Text>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              size="small"
            />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record.id)}
                  size="small"
                  style={{ color: '#52c41a' }}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => handleReject(record.id)}
                  size="small"
                  danger
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const uniqueDoctors = [...new Set(mockFeedbacks.map(f => f.doctorName))];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Đánh Giá Bệnh Nhân</Title>
        <Text type="secondary">
          Quản lý và theo dõi phản hồi từ bệnh nhân
        </Text>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đánh giá"
              value={mockStats.totalFeedbacks}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Điểm trung bình"
              value={mockStats.avgRating}
              suffix="/ 5"
              prefix={<StarOutlined />}
              valueStyle={{ color: '#fadb14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={mockStats.approvedFeedbacks}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tỷ lệ khuyến nghị"
              value={mockStats.recommendationRate}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Điểm đánh giá"
              value={filters.rating}
              onChange={(value) => setFilters({ ...filters, rating: value })}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value={5}>5 sao</Option>
              <Option value={4}>4 sao</Option>
              <Option value={3}>3 sao</Option>
              <Option value={2}>2 sao</Option>
              <Option value={1}>1 sao</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Chọn bác sĩ"
              value={filters.doctor}
              onChange={(value) => setFilters({ ...filters, doctor: value })}
              allowClear
              style={{ width: '100%' }}
            >
              {uniqueDoctors.map(doctor => (
                <Option key={doctor} value={doctor}>{doctor}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Trạng thái"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="approved">Đã duyệt</Option>
              <Option value="pending">Chờ duyệt</Option>
              <Option value="rejected">Từ chối</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Feedback Table */}
      <Card title={`Danh sách đánh giá (${filteredFeedbacks.length})`}>
        <Table
          columns={columns}
          dataSource={filteredFeedbacks}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đánh giá`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đánh giá"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedFeedback && (
          <div>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Text strong>Bệnh nhân: </Text>
                <Text>{selectedFeedback.patientName}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Bác sĩ: </Text>
                <Text>{selectedFeedback.doctorName}</Text>
              </Col>
            </Row>
            
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Text strong>Chuyên khoa: </Text>
                <Text>{selectedFeedback.specialty}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Ngày: </Text>
                <Text>{moment(selectedFeedback.date).format('DD/MM/YYYY')}</Text>
              </Col>
            </Row>

            <div style={{ marginBottom: '16px' }}>
              <Text strong>Đánh giá tổng thể: </Text>
              <Rate disabled defaultValue={selectedFeedback.rating} />
              <Text strong style={{ marginLeft: '8px' }}>
                {selectedFeedback.rating}/5
              </Text>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Text strong>Đánh giá chi tiết:</Text>
              <div style={{ marginTop: '8px', paddingLeft: '16px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <Text>Chuyên môn bác sĩ: </Text>
                  <Rate disabled defaultValue={selectedFeedback.categories.doctorProfessionalism} size="small" />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <Text>Thời gian chờ: </Text>
                  <Rate disabled defaultValue={selectedFeedback.categories.waitTime} size="small" />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <Text>Vệ sinh cơ sở: </Text>
                  <Rate disabled defaultValue={selectedFeedback.categories.facilityCleaniness} size="small" />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <Text>Thái độ nhân viên: </Text>
                  <Rate disabled defaultValue={selectedFeedback.categories.staffFriendliness} size="small" />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Text strong>Nhận xét:</Text>
              <Paragraph style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                {selectedFeedback.comment}
              </Paragraph>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Khuyến nghị: </Text>
                <Tag color={selectedFeedback.wouldRecommend ? 'green' : 'red'}>
                  {selectedFeedback.wouldRecommend ? 'Có' : 'Không'}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Hữu ích: </Text>
                <Text>{selectedFeedback.helpfulVotes} 👍</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Feedback;