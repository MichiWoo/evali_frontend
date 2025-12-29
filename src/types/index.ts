// Notification Types
export interface Notification {
  id: number
  user_id: number
  type:
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'exam_assigned'
    | 'exam_completed'
    | 'grade_available'
    | 'system'
  title: string
  message: string
  data: Record<string, any> | null
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
}

// User Types
export interface User {
  id: number
  name: string
  email: string
  avatar?: string | null
  bio?: string | null
  meta?: Record<string, any>
  email_verified_at: string | null
  last_login?: string | null
  created_at: string
  updated_at: string
  roles?: Role[]
  subscriptions?: Subscription[]
}

export interface Student {
  id: number
  name: string
  email: string
  password?: string
  status: 'active' | 'inactive'
  bio?: string | null
  last_login: string | null
  created_at: string
  updated_at: string
  groups?: Group[]
  user_groups?: Group[]
  group_ids?: number[]
  meta?: Record<string, any>
}

export interface Role {
  id: number
  name: string
  slug: string
  meta: {
    display_name: string
    description: string
  }
  permissions?: Permission[]
}

export interface Permission {
  id: number
  name: string
  slug: string
  meta: {
    description: string
  }
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  data: {
    user: User
    token?: string // Token solo presente en login, no en registro
    message?: string
  }
}

// Plan Types
export interface Plan {
  id: number
  name: string
  slug: string
  price_cents: number
  currency: string
  interval: 'monthly' | 'yearly'
  max_groups: number | null
  max_exams: number | null
  max_students: number | null
  features: {
    description: string
    ai_evaluation: boolean
    advanced_reports: boolean
    api_access: boolean
    priority_support?: boolean
    custom_branding?: boolean
  }
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: number
  user_id: number
  plan_id: number
  status: 'active' | 'expired' | 'canceled' | 'past_due'
  starts_at: string
  ends_at: string | null
  external_id: string | null
  meta: Record<string, any>
  created_at: string
  updated_at: string
  plan?: Plan
}

// Group Types
export interface Group {
  id: number
  user_id: number
  name: string
  description: string | null
  status: 'pending' | 'active' | 'inactive'
  created_at: string
  updated_at: string
  user?: User
  users?: User[]
  exams?: Exam[]
}

export interface CreateGroupRequest {
  name: string
  description?: string
  status?: 'pending' | 'active' | 'inactive'
}

export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {
  id: number
}

// Exam Types
export interface Exam {
  id: number
  user_id: number
  title: string
  description: string | null
  duration: number | null
  max_attempts: number
  shuffle_questions: boolean
  shuffle_options: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  user?: User
  groups?: Group[]
  questions?: Question[]
}

// Question Types
export interface Question {
  id: number
  exam_id: number
  text: string
  type: 'multiple_choice' | 'true_false' | 'open'
  points: number
  meta: {
    explanation?: string
    hint?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    options?: Array<{
      text: string
      is_correct: boolean
    }>
    answer?: boolean
  } | null
  created_at: string
  updated_at: string
  exam?: Exam
  options?: Option[]
  answers?: Answer[]
}

// Option Types
export interface Option {
  id: number
  question_id: number
  text: string
  is_correct: boolean
  position: number
  created_at: string
  updated_at: string
  question?: Question
  answers?: Answer[]
}

// Answer Types
export interface Answer {
  id: number
  question_id: number
  user_id: number
  selected_option_id: number | null
  exam_user_id: number
  response_text: string | null
  text_answer?: string | null // Alias para compatibilidad
  is_correct?: boolean | null
  points_earned?: number | null
  created_at: string
  updated_at: string
  question?: Question
  selected_option?: Option
  exam_user?: ExamUser
  user?: User
}

// Exam Attempt Types (for student exams)
export interface ExamAttempt {
  id: number
  exam_id: number
  user_id: number
  attempt: number
  started_at: string
  submitted_at: string | null
  completed_at: string | null
  score: number | null
  total_points: number
  correct_answers: number
  percentage: number | null
  status: 'in_progress' | 'completed' | 'abandoned'
  meta?: Record<string, any>
  answers?: Array<{
    question_id: number
    selected_option_id: number | null
    text_answer?: string | null
    is_correct?: boolean | null
    points_earned?: number | null
  }>
  created_at: string
  updated_at: string
  exam?: Exam
  user?: User
}

// Student Exam Types
export interface StudentExam {
  id: number
  exam_id: number
  group_id: number
  assigned_at: string
  due_date: string | null
  is_available: boolean
  exam?: Exam
  group?: Group
  latest_attempt?: ExamAttempt
}

// Exam User Types
export interface ExamUser {
  id: number
  exam_id: number
  user_id: number
  status: 'not_started' | 'in_progress' | 'completed' | 'expired'
  started_at: string | null
  completed_at: string | null
  time_spent_minutes: number | null
  score: number | null
  created_at: string
  updated_at: string
  exam?: Exam
  user?: User
  answers?: Answer[]
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

// Form Types
export interface CreateExamRequest {
  title: string
  description?: string
  duration?: number
  max_attempts?: number
  shuffle_questions?: boolean
  shuffle_options?: boolean
  start_date?: Date
  end_date?: Date
  group_ids?: number[]
}

export interface UpdateExamRequest extends Partial<CreateExamRequest> {}

// Backend request types (with string dates)
export interface CreateExamBackendRequest {
  title: string
  description?: string
  duration?: number
  max_attempts?: number
  shuffle_questions?: boolean
  shuffle_options?: boolean
  start_date?: string
  end_date?: string
  group_ids?: number[]
}

export interface UpdateExamBackendRequest extends Partial<CreateExamBackendRequest> {}

export interface CreateQuestionRequest {
  exam_id: number
  text: string
  type: 'multiple_choice' | 'true_false' | 'open'
  points: number
  meta?: {
    explanation?: string
    hint?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    options?: Array<{
      text: string
      is_correct: boolean
    }>
    correct_answer?: boolean
  }
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {}

export interface CreateOptionRequest {
  question_id: number
  text: string
  is_correct: boolean
  position?: number
}

export interface UpdateOptionRequest extends Partial<CreateOptionRequest> {
  id: number
}

// UI Types
export interface MenuItem {
  label: string
  icon?: string
  to?: string
  items?: MenuItem[]
  badge?: string | number
  visible?: boolean
}

export interface BreadcrumbItem {
  label: string
  to?: string
}

// Store Types
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface ExamState {
  exams: Exam[]
  currentExam: Exam | null
  isLoading: boolean
  error: string | null
}

export interface QuestionState {
  questions: Question[]
  currentQuestion: Question | null
  isLoading: boolean
  error: string | null
}

// Payment Types
export interface Payment {
  id: number
  user_id: number
  subscription_id: number
  amount_cents: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'
  payment_method: string
  gateway: 'stripe' | 'paypal' | 'manual'
  external_id: string | null
  description: string | null
  metadata: Record<string, any>
  paid_at: string | null
  created_at: string
  updated_at: string
  subscription?: Subscription
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'paypal'
  card?: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
  bank_account?: {
    bank_name: string
    last4: string
    routing_number: string
  }
  is_default: boolean
  created_at: string
}

export interface Invoice {
  id: string
  number: string
  subscription_id: number
  amount_cents: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  due_date: string
  paid_at: string | null
  created_at: string
  items: InvoiceItem[]
  subscription?: Subscription
}

export interface InvoiceItem {
  id: string
  description: string
  amount_cents: number
  quantity: number
  unit_price_cents: number
}

export interface PaymentStats {
  total_payments: number
  total_amount_cents: number
  successful_payments: number
  failed_payments: number
  pending_payments: number
  this_month_amount_cents: number
  last_month_amount_cents: number
}

// AI Exam Generation Types
export interface DocumentUpload {
  id: number
  user_id: number
  exam_id: number | null
  original_filename: string
  stored_filename: string
  file_path: string
  file_size: number
  mime_type: string
  pages_count: number | null
  extracted_text: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface AIExamGeneration {
  id: number
  user_id: number
  document_upload_id: number
  exam_id: number | null
  ai_model: string
  prompt_template: string | null
  parameters: Record<string, any>
  generated_questions: {
    questions: any[]
    answer_key?: any
  }
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  tokens_used: number | null
  cost_cents: number | null
  processing_time_seconds: number | null
  created_at: string
  updated_at: string
  document_upload?: DocumentUpload
  exam?: Exam
}

export interface AIAnswerAnalysis {
  id: number
  user_id: number
  answer_id: number
  ai_model: string
  question_text: string
  student_answer: string
  reference_answer: string | null
  analysis_result: Record<string, any>
  suggested_score: number | null
  feedback: string | null
  strengths: string[] | null
  weaknesses: string[] | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  tokens_used: number | null
  cost_cents: number | null
  processing_time_seconds: number | null
  created_at: string
  updated_at: string
  answer?: Answer
}

export interface AIUsage {
  current_usage: {
    exam_generations: number
    answer_analyses: number
  }
  limits: {
    exam_generations: number | null
    answer_analyses: number | null
  }
  remaining: {
    exam_generations: number | null
    answer_analyses: number | null
  }
  reset_date: string
  plan: Plan
}

export interface GenerateExamParams {
  document_upload_id: number
  title: string
  description?: string
  parameters: {
    num_questions: number
    question_types: ('multiple_choice' | 'true_false' | 'open')[]
    difficulty?: 'easy' | 'medium' | 'hard'
    language?: string
    include_answer_key?: boolean
  }
  exam_settings: {
    time_limit_minutes?: number
    max_attempts?: number
    shuffle_questions?: boolean
    shuffle_options?: boolean
  }
}

export interface AnalyzeAnswerParams {
  reference_answer?: string
  analysis_type?: 'quick' | 'comprehensive'
  include_feedback?: boolean
  include_score_suggestion?: boolean
}
