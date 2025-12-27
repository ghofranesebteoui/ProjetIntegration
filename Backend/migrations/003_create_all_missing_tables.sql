-- Migration: Create all missing tables for the quiz system

-- Table: assignments (quizzes and assignments)
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('quiz', 'assignment', 'exam') DEFAULT 'quiz',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  due_date DATETIME DEFAULT NULL,
  time_limit INT DEFAULT NULL COMMENT 'Time limit in minutes',
  max_attempts INT DEFAULT 1,
  passing_score DECIMAL(5,2) DEFAULT 0.00,
  total_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_course_id (course_id),
  INDEX idx_type (type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: quiz_questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('multiple_choice', 'true_false', 'short_answer', 'essay') DEFAULT 'multiple_choice',
  options JSON DEFAULT NULL COMMENT 'Array of answer options for multiple choice',
  correct_answer TEXT DEFAULT NULL,
  points INT DEFAULT 1,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  INDEX idx_assignment_id (assignment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: assignment_submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('pending', 'submitted', 'graded') DEFAULT 'pending',
  score DECIMAL(5,2) DEFAULT 0.00,
  submitted_at TIMESTAMP NULL DEFAULT NULL,
  graded_at TIMESTAMP NULL DEFAULT NULL,
  feedback TEXT DEFAULT NULL,
  attempt_number INT DEFAULT 1,
  time_spent INT DEFAULT 0 COMMENT 'Time spent in minutes',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_assignment_id (assignment_id),
  INDEX idx_student_id (student_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: quiz_answers
CREATE TABLE IF NOT EXISTS quiz_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  question_id INT NOT NULL,
  answer_text TEXT DEFAULT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  points_earned DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
  INDEX idx_submission_id (submission_id),
  INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: badges
CREATE TABLE IF NOT EXISTS badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(255) DEFAULT NULL,
  criteria_type ENUM('quiz_count', 'score_average', 'streak', 'perfect_score') DEFAULT 'quiz_count',
  criteria_value INT DEFAULT 0,
  color VARCHAR(50) DEFAULT '#FFD700',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_badge_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: student_badges
CREATE TABLE IF NOT EXISTS student_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  badge_id INT NOT NULL,
  quiz_id INT DEFAULT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES assignments(id) ON DELETE SET NULL,
  UNIQUE KEY unique_student_badge (student_id, badge_id),
  INDEX idx_student_id (student_id),
  INDEX idx_badge_id (badge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: course_schedule
CREATE TABLE IF NOT EXISTS course_schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_date DATETIME NOT NULL,
  duration_minutes INT DEFAULT 60,
  location VARCHAR(255) DEFAULT NULL,
  type ENUM('lecture', 'lab', 'exam', 'office_hours') DEFAULT 'lecture',
  status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_course_id (course_id),
  INDEX idx_teacher_id (teacher_id),
  INDEX idx_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: student_questions
CREATE TABLE IF NOT EXISTS student_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  student_id INT NOT NULL,
  teacher_id INT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT DEFAULT NULL,
  status ENUM('pending', 'answered', 'closed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answered_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_course_id (course_id),
  INDEX idx_student_id (student_id),
  INDEX idx_teacher_id (teacher_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default badges
INSERT IGNORE INTO badges (name, description, criteria_type, criteria_value, color) VALUES
('First Steps', 'Complete your first quiz', 'quiz_count', 1, '#4CAF50'),
('Quiz Master', 'Complete 5 quizzes', 'quiz_count', 5, '#2196F3'),
('Quiz Legend', 'Complete 10 quizzes', 'quiz_count', 10, '#9C27B0'),
('Perfect Score', 'Get 100% on any quiz', 'perfect_score', 100, '#FFD700'),
('High Achiever', 'Maintain 90% average', 'score_average', 90, '#FF9800');
