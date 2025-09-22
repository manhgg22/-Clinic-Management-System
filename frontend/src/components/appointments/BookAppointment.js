import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  Card,
  Typography,
  message,
  Steps,
  Row,
  Col,
  Tag,
  Empty,
} from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import {
  bookAppointment,
  selectAppointmentLoading,
} from '../../store/slices/appointmentSlice';
import {
  fetchDoctors,
  fetchPatients,
  selectDoctors,
  selectPatients,
} from '../../store/slices/userSlice';
import {
  fetchAvailableSlots,
  selectAvailableSlots,
  selectScheduleLoading,
} from '../../store/slices/scheduleSlice';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const BookAppointment = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const doctors = useSelector(selectDoctors);
  const patients = useSelector(selectPatients);
  const availableSlots = useSelector(selectAvailableSlots);
  const isBookingLoading = useSelector(selectAppointmentLoading);
  const isSlotsLoading = useSelector(selectScheduleLoading);

  useEffect(() => {
    dispatch(fetchDoctors());
    dispatch(fetchPatients());
  }, [dispatch]);

  const handleDoctorChange = (doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId);
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedSlot(null);
    form.setFieldsValue({ appointmentDate: null, appointmentTime: null });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    form.setFieldsValue({ appointmentTime: null });
    
    if (selectedDoctor && date) {
      dispatch(fetchAvailableSlots({
        doctorId: selectedDoctor._id,
        date: date.format('YYYY-MM-DD'),
      }));
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    form.setFieldsValue({ appointmentTime: slot.time });
  };

  const handleSubmit = async (values) => {
    try {
      const appointmentData = {
        patientId: values.patientId,
        doctorId: selectedDoctor._id,
        scheduleId: selectedSlot.scheduleId,
        appointmentDate: selectedDate.format('YYYY-MM-DD'),
        appointmentTime: values.appointmentTime,
        reason: values.reason,
        priority: values.priority || 'NORMAL',
        appointmentType: values.appointmentType || 'CONSULTATION',
        notes: values.notes,
      };

      const result = await dispatch(bookAppointment(appointmentData));
      
      if (result.type === 'appointment/bookAppointment/fulfilled') {
        message.success('Đặt lịch hẹn thành công!');
        navigate('/appointments');
      }
    } catch (error) {
      message.error('Đặt lịch hẹn thất bại');
    }
  };

  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: 'Chọn Bệnh nhân & Bác sĩ',
      content: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="patientId"
              label="Bệnh nhân"
              rules={[{ required: true, message: 'Vui lòng chọn bệnh nhân' }]}
            >
              <Select
                placeholder="Chọn bệnh nhân"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {patients.map((patient) => (
                  <Option key={patient._id} value={patient._id}>
                    {patient.user?.name} - {patient.user?.email}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="doctorId"
              label="Bác sĩ"
              rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}
            >
              <Select
                placeholder="Chọn bác sĩ"
                onChange={handleDoctorChange}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {doctors.map((doctor) => (
                  <Option key={doctor._id} value={doctor._id}>
                    BS. {doctor.user?.name} - {doctor.specialty?.replace(/_/g, ' ')}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Chọn Ngày & Giờ',
      content: (
        <div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="appointmentDate"
                label="Ngày hẹn"
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < moment().startOf('day')}
                  onChange={handleDateChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="appointmentTime"
                label="Giờ hẹn"
                rules={[{ required: true, message: 'Vui lòng chọn khung giờ' }]}
              >
                <Input placeholder="Chọn từ các khung giờ có sẵn" disabled />
              </Form.Item>
            </Col>
          </Row>
          
          {selectedDate && selectedDoctor && (
            <div style={{ marginTop: '16px' }}>
              <Text strong>Khung giờ có sẵn:</Text>
              <div style={{ marginTop: '8px' }}>
                {isSlotsLoading ? (
                  <div>Đang tải khung giờ...</div>
                ) : availableSlots.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {availableSlots.map((slot) => (
                      <Tag
                        key={slot.time}
                        color={selectedSlot?.time === slot.time ? 'blue' : 'default'}
                        style={{ 
                          cursor: 'pointer',
                          padding: '4px 8px',
                          fontSize: '14px'
                        }}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        {slot.time} (Còn {slot.availableSpots} chỗ)
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <Empty description="Không có khung giờ nào cho ngày này" />
                )}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Chi tiết Lịch hẹn',
      content: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="reason"
              label="Lý do khám"
              rules={[{ required: true, message: 'Vui lòng nhập lý do khám' }]}
            >
              <TextArea
                rows={3}
                placeholder="Nhập lý do đặt lịch hẹn"
                maxLength={200}
              />
            </Form.Item>
            
            <Form.Item
              name="priority"
              label="Mức độ ưu tiên"
              initialValue="NORMAL"
            >
              <Select>
                <Option value="LOW">Thấp</Option>
                <Option value="NORMAL">Bình thường</Option>
                <Option value="HIGH">Cao</Option>
                <Option value="URGENT">Khẩn cấp</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="appointmentType"
              label="Loại cuộc hẹn"
              initialValue="CONSULTATION"
            >
              <Select>
                <Option value="CONSULTATION">Tư vấn</Option>
                <Option value="FOLLOW_UP">Tái khám</Option>
                <Option value="ROUTINE_CHECKUP">Khám định kỳ</Option>
                <Option value="EMERGENCY">Cấp cứu</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="notes"
              label="Ghi chú thêm"
            >
              <TextArea
                rows={3}
                placeholder="Các ghi chú thêm"
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/appointments')}
          style={{ padding: 0, marginBottom: '8px' }}
        >
          Trở lại Quản lý Lịch hẹn
        </Button>
        <Title level={2}>Đặt Lịch Hẹn Mới</Title>
        <Text type="secondary">
          Đặt lịch hẹn mới cho bệnh nhân
        </Text>
      </div>

      <Card>
        <Steps current={currentStep} style={{ marginBottom: '32px' }}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <div style={{ minHeight: '300px' }}>
            {steps[currentStep].content}
          </div>

          <div style={{ marginTop: '32px', textAlign: 'right' }}>
            {currentStep > 0 && (
              <Button style={{ marginRight: 8 }} onClick={prevStep}>
                Trước
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={nextStep}>
                Tiếp
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button
                type="primary"
                htmlType="submit"
                loading={isBookingLoading}
                icon={<CalendarOutlined />}
              >
                Đặt Lịch Hẹn
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default BookAppointment;
