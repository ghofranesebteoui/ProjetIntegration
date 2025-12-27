-- Migration: Create course_contents table
-- This table stores course materials (PDFs, videos, links, etc.)

CREATE TABLE IF NOT EXISTS course_contents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  content_type ENUM('pdf', 'video', 'link', 'document') NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) DEFAULT NULL,
  file_name VARCHAR(255) DEFAULT NULL,
  mime_type VARCHAR(100) DEFAULT NULL,
  url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_course_id (course_id),
  INDEX idx_content_type (content_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
