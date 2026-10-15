export interface User {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'coordinator' | 'viewer';
  active: boolean;
}

export interface Person {
  id: number;
  name: string;
  birth_date?: string;
  cpf?: string;
  rg?: string;
  gender?: string;
  person_type: 'adult' | 'child';
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  school?: string;
  notes?: string;
  photo_url?: string;
  status: 'active' | 'inactive' | 'waitlist';
  created_at: string;
}

export interface FamilyMember {
  id: number;
  person: Person;
  relationship_type: string;
  relationship_id: number;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  category?: string;
  status: 'active' | 'inactive' | 'finished';
  coordinator_id?: number;
  schedule?: string;
  location?: string;
  max_capacity?: number;
  created_at: string;
  enrollment_count?: number;
}

export interface Enrollment {
  id: number;
  person_id: number;
  project_id: number;
  enrolled_at: string;
  status: 'active' | 'completed' | 'dropout';
  class_group?: string;
  notes?: string;
  person?: Person;
  project?: Project;
}

export interface Document {
  id: number;
  title: string;
  category?: string;
  file_url: string;
  file_name: string;
  is_public: boolean;
  uploaded_by?: number;
  created_at: string;
}

export interface DonationConfig {
  id?: number;
  pix_key?: string;
  pix_key_type?: string;
  bank_name?: string;
  agency?: string;
  account?: string;
  account_holder?: string;
  message?: string;
  show_donation_section: boolean;
}
