import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  DashboardOutlined,
  CalendarOutlined,
  UserOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  StarOutlined,
  TeamOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { logout, selectUser } from '../../store/slices/authSlice';

const { Header, Sider } = Layout;
const { Text } = Typography;

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Trang Chủ',
    },
    {
      key: '/appointments',
      icon: <CalendarOutlined />,
      label: 'Quản Lý Lịch Hẹn',
      children: [
        {
          key: '/appointments',
          label: 'Xem Lịch Hẹn',
        },
        {
          key: '/appointments/book',
          label: 'Đặt Lịch Hẹn',
        },
      ],
    },
    {
      key: '/schedules',
      icon: <ScheduleOutlined />,
      label: 'Lịch Bác Sĩ',
      children: [
        {
          key: '/schedules',
          label: 'Xem Lịch Khám',
        },
        {
          key: '/schedules/manage',
          label: 'Quản Lý Lịch',
        },
      ],
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: 'Quản Lý Người Dùng',
      children: [
        {
          key: '/users/create',
          label: 'Tạo Tài Khoản',
        },
      ],
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: 'Báo Cáo',
    },
    {
      key: '/feedback',
      icon: <StarOutlined />,
      label: 'Đánh Giá',
    },
  ];

  const userMenu = (
    <Menu
      items={[
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'Xem Hồ Sơ',
          onClick: () => navigate('/profile'),
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Cập Nhật Hồ Sơ',
          onClick: () => navigate('/profile/edit'),
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Đăng Xuất',
          onClick: handleLogout,
        },
      ]}
    />
  );

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/appointments')) {
      return ['/appointments'];
    }
    if (path.startsWith('/schedules')) {
      return ['/schedules'];
    }
    if (path.startsWith('/users')) {
      return ['/users'];
    }
    return [path];
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/appointments')) {
      return ['/appointments'];
    }
    if (path.startsWith('/schedules')) {
      return ['/schedules'];
    }
    if (path.startsWith('/users')) {
      return ['/users'];
    }
    return [];
  };

  return (
    <Layout className="app-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="app-logo" style={{ 
          padding: '16px', 
          color: '#fff', 
          textAlign: 'center',
          borderBottom: '1px solid #303030'
        }}>
          <MedicineBoxOutlined style={{ fontSize: '24px', marginRight: collapsed ? 0 : '8px' }} />
          {!collapsed && <Text strong style={{ color: '#fff' }}>Quản Lý Phòng Khám</Text>}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        <Header className="app-header" style={{ 
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 40,
              height: 40,
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Text>Chào mừng, <strong>{user?.name}</strong></Text>
            <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
              }}>
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#1890ff' }}
                />
                <Text style={{ marginLeft: '8px', fontWeight: 500 }}>
                  {user?.name}
                </Text>
              </div>
            </Dropdown>
          </div>
        </Header>

        {children}
      </Layout>
    </Layout>
  );
};

export default AppLayout;
