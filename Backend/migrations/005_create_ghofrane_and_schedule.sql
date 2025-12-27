-- Migration: Créer l'enseignante Ghofrane Sebteoui avec ses cours et planning

-- 1. Créer l'enseignante (mot de passe: Ghofrane2024!)
-- Hash bcrypt pour "Ghofrane2024!" avec salt 10
INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
VALUES (
  'ghofrane.sebteoui@edunova.tn',
  '$2a$10$YourHashHere', -- À remplacer par le vrai hash
  'Ghofrane',
  'Sebteoui',
  'teacher',
  1
)
ON DUPLICATE KEY UPDATE role = 'teacher';

-- Récupérer l'ID de l'enseignante
SET @teacher_id = (SELECT id FROM users WHERE email = 'ghofrane.sebteoui@edunova.tn');

-- 2. Créer des cours pour l'enseignante
INSERT INTO courses (teacherId, title, description, createdAt, updatedAt)
VALUES 
  (@teacher_id, 'Développement Web Avancé', 'Maîtrisez React, Node.js et les architectures modernes du web', NOW(), NOW()),
  (@teacher_id, 'Base de Données et SQL', 'Conception, optimisation et administration de bases de données relationnelles', NOW(), NOW()),
  (@teacher_id, 'JavaScript ES6+', 'Les fonctionnalités modernes de JavaScript et les bonnes pratiques', NOW(), NOW());

-- Récupérer les IDs des cours
SET @course1_id = (SELECT id FROM courses WHERE teacherId = @teacher_id AND title = 'Développement Web Avancé' LIMIT 1);
SET @course2_id = (SELECT id FROM courses WHERE teacherId = @teacher_id AND title = 'Base de Données et SQL' LIMIT 1);
SET @course3_id = (SELECT id FROM courses WHERE teacherId = @teacher_id AND title = 'JavaScript ES6+' LIMIT 1);

-- 3. Créer des sessions de planning pour chaque cours

-- Sessions pour Développement Web Avancé
INSERT INTO course_schedule (course_id, teacher_id, title, description, scheduled_date, duration_minutes, location, type, status)
VALUES 
  (@course1_id, @teacher_id, 'Introduction à React', 'Découverte des composants, props et state', DATE_ADD(NOW(), INTERVAL 2 DAY), 90, 'Amphithéâtre A', 'lecture', 'scheduled'),
  (@course1_id, @teacher_id, 'TP: Création d\'une application React', 'Mise en pratique avec un projet guidé', DATE_ADD(NOW(), INTERVAL 5 DAY), 120, 'Salle informatique B101', 'lab', 'scheduled'),
  (@course1_id, @teacher_id, 'Permanence React', 'Questions-réponses sur les concepts React', DATE_ADD(NOW(), INTERVAL 7 DAY), 60, 'Bureau C205', 'office_hours', 'scheduled'),
  (@course1_id, @teacher_id, 'Les Hooks React', 'useState, useEffect, useContext et hooks personnalisés', DATE_ADD(NOW(), INTERVAL 9 DAY), 90, 'Amphithéâtre A', 'lecture', 'scheduled'),
  (@course1_id, @teacher_id, 'Examen Pratique React', 'Évaluation des compétences acquises', DATE_ADD(NOW(), INTERVAL 14 DAY), 180, 'Salle d\'examen E301', 'exam', 'scheduled');

-- Sessions pour Base de Données et SQL
INSERT INTO course_schedule (course_id, teacher_id, title, description, scheduled_date, duration_minutes, location, type, status)
VALUES 
  (@course2_id, @teacher_id, 'Introduction aux bases de données', 'Concepts fondamentaux et modèle relationnel', DATE_ADD(NOW(), INTERVAL 3 DAY), 90, 'Amphithéâtre B', 'lecture', 'scheduled'),
  (@course2_id, @teacher_id, 'TP: Requêtes SQL de base', 'SELECT, INSERT, UPDATE, DELETE', DATE_ADD(NOW(), INTERVAL 6 DAY), 120, 'Salle informatique B102', 'lab', 'scheduled'),
  (@course2_id, @teacher_id, 'Permanence SQL', 'Aide sur les requêtes complexes', DATE_ADD(NOW(), INTERVAL 8 DAY), 60, 'Bureau C205', 'office_hours', 'scheduled'),
  (@course2_id, @teacher_id, 'Jointures et sous-requêtes', 'Maîtriser les requêtes avancées', DATE_ADD(NOW(), INTERVAL 10 DAY), 90, 'Amphithéâtre B', 'lecture', 'scheduled'),
  (@course2_id, @teacher_id, 'Examen SQL', 'Test de compétences en SQL', DATE_ADD(NOW(), INTERVAL 15 DAY), 120, 'Salle d\'examen E302', 'exam', 'scheduled');

-- Sessions pour JavaScript ES6+
INSERT INTO course_schedule (course_id, teacher_id, title, description, scheduled_date, duration_minutes, location, type, status)
VALUES 
  (@course3_id, @teacher_id, 'Les nouveautés ES6', 'let, const, arrow functions, destructuring', DATE_ADD(NOW(), INTERVAL 4 DAY), 90, 'Amphithéâtre C', 'lecture', 'scheduled'),
  (@course3_id, @teacher_id, 'TP: Programmation fonctionnelle', 'map, filter, reduce et composition', DATE_ADD(NOW(), INTERVAL 7 DAY), 120, 'Salle informatique B103', 'lab', 'scheduled'),
  (@course3_id, @teacher_id, 'Permanence JavaScript', 'Clarification des concepts avancés', DATE_ADD(NOW(), INTERVAL 9 DAY), 60, 'Bureau C205', 'office_hours', 'scheduled'),
  (@course3_id, @teacher_id, 'Async/Await et Promises', 'Programmation asynchrone moderne', DATE_ADD(NOW(), INTERVAL 11 DAY), 90, 'Amphithéâtre C', 'lecture', 'scheduled'),
  (@course3_id, @teacher_id, 'Examen JavaScript ES6+', 'Évaluation complète', DATE_ADD(NOW(), INTERVAL 16 DAY), 150, 'Salle d\'examen E303', 'exam', 'scheduled');

-- 4. Créer quelques inscriptions d'étudiants (si des étudiants existent)
-- Cette partie sera ignorée si aucun étudiant n'existe
INSERT IGNORE INTO course_enrollments (course_id, student_id, status, enrolled_at)
SELECT @course1_id, id, 'active', NOW()
FROM users 
WHERE role = 'student' 
LIMIT 5;

INSERT IGNORE INTO course_enrollments (course_id, student_id, status, enrolled_at)
SELECT @course2_id, id, 'active', NOW()
FROM users 
WHERE role = 'student' 
LIMIT 5;

INSERT IGNORE INTO course_enrollments (course_id, student_id, status, enrolled_at)
SELECT @course3_id, id, 'active', NOW()
FROM users 
WHERE role = 'student' 
LIMIT 5;
