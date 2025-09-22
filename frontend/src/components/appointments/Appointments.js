import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Typography,
  Card,
  Modal,
  message,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  CalendarOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import {
  fetchAppointments,
  cancelAppointment,
  selectAppointments,
  selectAppointmentPagination,
  selectAppointmentLoading,
} from '../../store/slices/appointmentSlice';
import { fetchDoctors, selectDoctors } from '../../store/slices/userSlice';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Appointments = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appointments = useSelector(selectAppointments);
  const pagination = useSelector(selectAppointmentPagination);
  const isLoading = useSelector(selectAppointmentLoading);
  const doctors = useSelector(selectDoctors);

  const [filters, setFilters] = useState({
    search: '',
    doctorId: '',
    status: '',
    dateRange: null,
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  useEffect(() => {
    loadAppointments();
    dispatch(fetchDoctors());
  }, [dispatch]);

  const loadAppointments = (params = {}) => {
    const searchParams = {
      page: 1,
      limit: 10,
      ...params,
    };

    if (filters.search) {
      searchParams.search = filters.search;
    }
    if (filters.doctorId) {
      searchParams.doctorId = filters.doctorId;
    }
    if (filters.status) {
      searchParams.status = filters.status;
    }
    if (filters.dateRange && filters.dateRange.length === 2) {
      searchParams.startDate = filters.dateRange[0].format('YYYY-MM-DD');
      searchParams.endDate = filters.dateRange[1].format('YYYY-MM-DD');
    }

    dispatch(fetchAppointments(searchParams));
  };

  const handleSearch = () => {
    loadAppointments({ page: 1 });
  };

  const handleReset = () => {
    setFilters({
      search: '',
      doctorId: '',
      status: '',
      dateRange: null,
    });
    dispatch(fetchAppointments({ page: 1, limit: 10 }));
  };

  const handleTableChange = (pagination) => {
    loadAppointments({
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };

  const handleCancelAppointment = async (appointmentId, reason = '') => {
    try {
      await dispatch(cancelAppointment({ id: appointmentId, reason }));
      message.success('Appointment cancelled successfully');
      loadAppointments({ page: pagination.page });
    } catch (error) {
      message.error('Failed to cancel appointment');
    }
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setViewModalVisible(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: 'blue',
      CONFIRMED: 'green',
      IN_PROGRESS: 'orange',
      COMPLETED: 'green',
      CANCELLED: 'red',
      NO_SHOW: 'red',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'green',
      NORMAL: 'blue',
      HIGH: 'orange',
      URGENT: 'red',
    };
    return colors[priority] || 'default';
  };

  const columns = [
    {
      title: 'Bệnh nhân',
      dataIndex: ['patient', 'user', 'name'],
      key: 'patient',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.patient?.user?.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Bác sĩ',
      dataIndex: ['doctor', 'user', 'name'],
      key: 'doctor',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>BS. {text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.doctor?.specialty?.replace(/_/g, ' ')}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày & Giờ',
      key: 'datetime',
      render: (_, record) => (
        <div>
          <div>{moment(record.appointmentDate).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.appointmentTime}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'SCHEDULED' ? 'Đã đặt' :
           status === 'CONFIRMED' ? 'Đã xác nhận' :
           status === 'IN_PROGRESS' ? 'Đang khám' :
           status === 'COMPLETED' ? 'Hoàn thành' :
           status === 'CANCELLED' ? 'Đã hủy' : status}
        </Tag>
      ),
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)} size="small">
          {priority === 'LOW' ? 'Thấp' :
           priority === 'NORMAL' ? 'Bình thường' :
           priority === 'HIGH' ? 'Cao' :
           priority === 'URGENT' ? 'Khẩn cấp' : priority}
        </Tag>
      ),
    },
    {
      title: 'Lý do khám',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          {text?.length > 30 ? `${text.substring(0, 30)}...` : text}
        </Tooltip>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewAppointment(record)}
            size="small"
          />
          {record.status === 'SCHEDULED' && (
            <Popconfirm
              title="Hủy lịch hẹn"
              description="Bạn có chắc chắn muốn hủy lịch hẹn này?"
              onConfirm={() => handleCancelAppointment(record._id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Quản Lý Lịch Hẹn</Title>
      </div>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: '16px' }}>
          <Space wrap>
            <Input
              placeholder="Tìm tên bệnh nhân..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Chọn bác sĩ"
              value={filters.doctorId}
              onChange={(value) => setFilters({ ...filters, doctorId: value })}
              style={{ width: 200 }}
              allowClear
            >
              {doctors.map((doctor) => (
                <Option key={doctor._id} value={doctor._id}>
                  BS. {doctor.user?.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Trạng thái"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="SCHEDULED">Đã đặt</Option>
              <Option value="CONFIRMED">Đã xác nhận</Option>
              <Option value="IN_PROGRESS">Đang khám</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              style={{ width: 250 }}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              Tìm kiếm
            </Button>
            <Button onClick={handleReset}>Đặt lại</Button>
          </Space>
        </div>

        {/* Table Header */}
        <div className="table-header">
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Tất cả lịch hẹn ({pagination.total})
            </Title>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/appointments/book')}
          >
            Đặt lịch hẹn
          </Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} appointments`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* View Appointment Modal */}
      <Modal
        title="Chi tiết lịch hẹn"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedAppointment && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Bệnh nhân:</strong> {selectedAppointment.patient?.user?.name}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Bác sĩ:</strong> BS. {selectedAppointment.doctor?.user?.name}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Ngày:</strong> {moment(selectedAppointment.appointmentDate).format('DD/MM/YYYY')}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Giờ:</strong> {selectedAppointment.appointmentTime}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Trạng thái:</strong>{' '}
              <Tag color={getStatusColor(selectedAppointment.status)}>
                {selectedAppointment.status === 'SCHEDULED' ? 'Đã đặt' :
                 selectedAppointment.status === 'CONFIRMED' ? 'Đã xác nhận' :
                 selectedAppointment.status === 'IN_PROGRESS' ? 'Đang khám' :
                 selectedAppointment.status === 'COMPLETED' ? 'Hoàn thành' :
                 selectedAppointment.status === 'CANCELLED' ? 'Đã hủy' : selectedAppointment.status}
              </Tag>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Lý do khám:</strong> {selectedAppointment.reason}
            </div>
            {selectedAppointment.notes && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Ghi chú:</strong> {selectedAppointment.notes}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Appointments;
