-- Insert default roles
INSERT INTO roles (name, description, is_active, created_at, updated_at) VALUES
('ADMIN', 'Administrator role with full access', true, NOW(), NOW()),
('MANAGER', 'Manager role with management access', true, NOW(), NOW()),
('STAFF', 'Staff role with limited access', true, NOW(), NOW()),
('USER', 'Regular user role', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  description=VALUES(description),
  is_active=VALUES(is_active),
  updated_at=NOW();

-- Insert default companies
INSERT INTO companies (code, name, phone, email, address, active) VALUES
('COMP001', 'Công ty TNHH ABC', '0243123456', 'info@abc.com.vn', '123 Đường Lê Lợi, Hà Nội', true),
('COMP002', 'Công ty Cổ phần XYZ', '0283654321', 'contact@xyz.com.vn', '456 Đường Nguyễn Huệ, TP HCM', true),
('COMP003', 'Công ty TNHH Tech Việt', '0313579246', 'sales@techviet.com.vn', '789 Đường Trần Hưng Đạo, Đà Nẵng', true),
('COMP004', 'Công ty Tư vấn Kinh doanh', '0351234567', 'admin@consulting.com.vn', '321 Đường Hàm Nghi, Cần Thơ', true)
ON DUPLICATE KEY UPDATE 
  name=VALUES(name),
  phone=VALUES(phone),
  email=VALUES(email),
  address=VALUES(address),
  active=VALUES(active);

-- Insert default document types
INSERT INTO document_types (code, name, description, active) VALUES
('DOC_INV', 'Hóa đơn', 'Hóa đơn bán hàng/dịch vụ', true),
('DOC_RECEIPT', 'Hóa đơn thu tiền', 'Hóa đơn nhập khẩu', true),
('DOC_PO', 'Đơn hàng', 'Đơn hàng mua', true),
('DOC_QUOTE', 'Báo giá', 'Báo giá từ nhà cung cấp', true),
('DOC_EXPENSE', 'Phiếu chi', 'Phiếu chi tiêu', true),
('DOC_RECEIPT_EXPENSE', 'Phiếu thu', 'Phiếu thu tiền', true),
('DOC_CREDIT_NOTE', 'Ghi có', 'Ghi có điều chỉnh', true),
('DOC_DEBIT_NOTE', 'Ghi nợ', 'Ghi nợ điều chỉnh', true)
ON DUPLICATE KEY UPDATE 
  name=VALUES(name),
  description=VALUES(description),
  active=VALUES(active);

-- Insert sample users (if not exists)
INSERT INTO users (id, username, email, password, first_name, last_name, phone, role_id, company_id, is_active, created_at, updated_at) 
SELECT 1, 'admin', 'admin@system.com', 'hashed_password', 'Admin', 'User', '0901234567', r.id, NULL, true, NOW(), NOW()
FROM roles r WHERE r.name = 'ADMIN' AND NOT EXISTS(SELECT 1 FROM users WHERE id = 1)
ON DUPLICATE KEY UPDATE 
  username=VALUES(username),
  email=VALUES(email),
  is_active=VALUES(is_active);

-- Insert sample documents
INSERT INTO documents (company_id, document_type_id, user_id, file_name, file_url, storage_path, file_size, mime_type, file_type, status, uploaded_at, processed_at, active) 
SELECT 
  c.id, dt.id, 1, 
  'HoaDon_20260526_001.pdf', 
  '/documents/HoaDon_20260526_001.pdf',
  '/storage/documents/HoaDon_20260526_001.pdf',
  2048576,
  'application/pdf',
  'pdf',
  'completed',
  NOW(),
  NOW(),
  true
FROM companies c 
JOIN document_types dt ON dt.code = 'DOC_INV'
WHERE c.code = 'COMP001'
LIMIT 1
ON DUPLICATE KEY UPDATE 
  status=VALUES(status),
  processed_at=VALUES(processed_at);

INSERT INTO documents (company_id, document_type_id, user_id, file_name, file_url, storage_path, file_size, mime_type, file_type, status, uploaded_at, processed_at, active) 
SELECT 
  c.id, dt.id, 1,
  'DonHang_20260525_001.xlsx',
  '/documents/DonHang_20260525_001.xlsx',
  '/storage/documents/DonHang_20260525_001.xlsx',
  1024000,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xlsx',
  'completed',
  DATE_SUB(NOW(), INTERVAL 1 DAY),
  DATE_SUB(NOW(), INTERVAL 1 DAY),
  true
FROM companies c
JOIN document_types dt ON dt.code = 'DOC_PO'
WHERE c.code = 'COMP002'
LIMIT 1
ON DUPLICATE KEY UPDATE 
  status=VALUES(status),
  processed_at=VALUES(processed_at);

INSERT INTO documents (company_id, document_type_id, user_id, file_name, file_url, storage_path, file_size, mime_type, file_type, status, uploaded_at, active) 
SELECT 
  c.id, dt.id, 1,
  'BaoGia_20260524_001.pdf',
  '/documents/BaoGia_20260524_001.pdf',
  '/storage/documents/BaoGia_20260524_001.pdf',
  3145728,
  'application/pdf',
  'pdf',
  'pending',
  DATE_SUB(NOW(), INTERVAL 2 DAY),
  true
FROM companies c
JOIN document_types dt ON dt.code = 'DOC_QUOTE'
WHERE c.code = 'COMP003'
LIMIT 1
ON DUPLICATE KEY UPDATE 
  status=VALUES(status);

-- Promote current user to ADMIN for development
UPDATE users u 
SET u.role_id = (SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1)
WHERE u.email = 'thangcutehuhu2808@gmail.com';
