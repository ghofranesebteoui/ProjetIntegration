-- Migration: Add teacher_id column to assignments table

ALTER TABLE assignments 
ADD COLUMN teacher_id INT NOT NULL AFTER course_id,
ADD FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
ADD INDEX idx_teacher_id (teacher_id);
