-- Users and auth
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer', -- superadmin, admin, coordinator, viewer
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Which fields each user can see (overrides)
CREATE TABLE permission_overrides (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  can_view BOOLEAN DEFAULT true
);

-- Which projects a coordinator/viewer can access
CREATE TABLE user_project_access (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER, -- FK added after projects table
  PRIMARY KEY (user_id, project_id)
);

-- People (beneficiaries - adults and children)
CREATE TABLE people (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  birth_date DATE,
  cpf VARCHAR(14),
  rg VARCHAR(20),
  gender VARCHAR(20),
  person_type VARCHAR(10) DEFAULT 'adult', -- adult, child
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  neighborhood VARCHAR(100),
  city VARCHAR(100),
  school VARCHAR(255),
  notes TEXT,
  photo_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, waitlist
  created_at TIMESTAMP DEFAULT NOW()
);

-- Family relationships
CREATE TABLE family_relationships (
  id SERIAL PRIMARY KEY,
  person_a_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  person_b_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL -- parent, mother, father, guardian, sibling, grandparent, other
);

-- Projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, finished
  coordinator_id INTEGER REFERENCES users(id),
  schedule TEXT,
  location VARCHAR(255),
  max_capacity INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add FK for user_project_access
ALTER TABLE user_project_access ADD CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Project enrollments
CREATE TABLE project_enrollments (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  enrolled_at DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, dropout
  class_group VARCHAR(100),
  notes TEXT,
  UNIQUE(person_id, project_id)
);

-- Documents
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- ata, relatorio_financeiro, estatuto, edital, certificado, outro
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  is_public BOOLEAN DEFAULT true,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Donation config
CREATE TABLE donation_config (
  id SERIAL PRIMARY KEY,
  pix_key VARCHAR(255),
  pix_key_type VARCHAR(50), -- cpf, cnpj, email, phone, random
  bank_name VARCHAR(100),
  agency VARCHAR(20),
  account VARCHAR(50),
  account_holder VARCHAR(255),
  message TEXT,
  show_donation_section BOOLEAN DEFAULT true
);

-- Insert default superadmin
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Administrador', 'admin@institutocasajane.org.br', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin');
-- Default password is 'password' - MUST be changed on first login

-- Insert sample donation config
INSERT INTO donation_config (message) VALUES ('Sua doação transforma vidas!');
