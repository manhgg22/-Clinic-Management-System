# 🏥 Clinic Management System - Setup Guide

## 📋 Yêu cầu hệ thống
- Node.js (v16 trở lên)
- MongoDB (v4.4 trở lên)
- npm hoặc yarn

## 🚀 Cài đặt nhanh

### 1. Clone repository
```bash
git clone <repository-url>
cd clinic-management-receptionist
```

### 2. Cài đặt dependencies
```bash
npm run install:all
```

### 3. Cấu hình Backend
```bash
cd backend
cp env.example .env
```

Chỉnh sửa file `backend/.env`:
```env
# Database
MONGO_URI=mongodb://localhost:27017/clinic_management

# JWT
JWT_SECRET=clinic_management_super_secret_jwt_key_2024_very_secure
JWT_REFRESH_SECRET=clinic_management_refresh_secret_key_2024_very_secure
JWT_EXPIRE=1d
JWT_REFRESH_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Cấu hình Frontend
Tạo file `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Tạo dữ liệu mẫu (tùy chọn)
```bash
cd backend
node scripts/seedData.js
```

### 6. Khởi động ứng dụng
```bash
# Từ thư mục root
npm run dev
```

## 🔐 Tài khoản mẫu

Sau khi chạy `seedData.js`:

- **Receptionist:** `receptionist@clinic.com` / `password123`
- **Admin:** `admin@clinic.com` / `admin123`  
- **Doctor:** `john.smith@clinic.com` / `doctor123`
- **Patient:** `john.doe@email.com` / `patient123`

## 🌐 Truy cập ứng dụng

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## 📚 Tài liệu API

Xem file `API_DOCUMENTATION.md` để biết chi tiết về các endpoint API.

## 🛠️ Scripts có sẵn

```bash
# Cài đặt tất cả dependencies
npm run install:all

# Chạy cả frontend và backend
npm run dev

# Chỉ chạy backend
npm run server:dev

# Chỉ chạy frontend  
npm run client:dev

# Build production
npm run build

# Chạy production
npm start
```

## ⚠️ Lưu ý quan trọng

1. **Đảm bảo MongoDB đang chạy** trước khi khởi động backend
2. **Cấu hình JWT_SECRET** trong file `.env` 
3. **Không commit file `.env`** lên Git (đã có trong .gitignore)
4. **Chạy seedData.js** để có dữ liệu test

## 🐛 Khắc phục sự cố

### Lỗi "Server error during login"
1. Kiểm tra MongoDB đang chạy
2. Kiểm tra JWT_SECRET trong `.env`
3. Khởi động lại server

### Lỗi CORS
- Đảm bảo `FRONTEND_URL` đúng trong backend `.env`

### Lỗi "concurrently not found"
```bash
npm install concurrently --save-dev
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub repository.
