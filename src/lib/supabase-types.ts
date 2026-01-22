// Type definitions for database enums and tables
export type AppRole = 'admin' | 'student';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'beast';
export type CompetitionStatus = 'upcoming' | 'live' | 'ended';
export type SubmissionStatus = 'pass' | 'fail';
export type ManualStatus = 'pending' | 'overridden';
export type ParticipantStatus = 'active' | 'banned' | 'kicked';
export type ProgrammingLanguage = 'python' | 'java' | 'cpp';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  department: string | null;
  xp: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Competition {
  id: string;
  title: string;
  host_id: string;
  start_time: string;
  duration_minutes: number;
  status: CompetitionStatus;
  access_code: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  competition_id: string | null;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  default_code_python: string;
  default_code_java: string;
  default_code_cpp: string;
  hidden_input: string;
  expected_output: string;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  competition_id: string;
  user_id: string;
  status: ParticipantStatus;
  joined_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  competition_id: string | null;
  question_id: string;
  language: ProgrammingLanguage;
  code: string;
  auto_status: SubmissionStatus | null;
  manual_status: ManualStatus;
  execution_time_ms: number | null;
  submitted_at: string;
}

// Extended types with relations
export interface ParticipantWithProfile extends Participant {
  profiles: Profile;
}

export interface SubmissionWithDetails extends Submission {
  profiles: Profile;
  questions: Question;
}
