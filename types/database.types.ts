// ============================================================================
// DATABASE TYPES - StageOne Platform
// ============================================================================

// Nova lógica simplificada: USER e ADMIN
// PALESTRANTE e PARTICIPANTE mantidos temporariamente para compatibilidade
export type UserRole = 'ADMIN' | 'USER' | 'PALESTRANTE' | 'PARTICIPANTE';
export type EventMode = 'PRESENCIAL' | 'ONLINE' | 'HIBRIDO';
export type EventLayout = 'AUDITORIO' | 'U' | 'ILHAS' | 'TEATRO' | 'CIRCULAR';
export type TicketStatus = 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED' | 'USED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

// ============================================================================
// USER
// ============================================================================
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// EVENT
// ============================================================================
export interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description: string;
  category: string;
  target_audience?: string | null;
  total_hours: number;
  included_items: string[];

  // Location
  location_name: string;
  address: string;
  google_maps_url?: string | null;
  layout?: EventLayout | null;
  capacity: number;

  // Dates
  start_datetime: string;
  end_datetime: string;

  // Mode
  mode: EventMode;

  // Media
  banner_url?: string | null;
  cover_image?: string | null;

  // Meta
  created_by: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventWithCreator extends Event {
  creator: User;
}

export interface EventWithModules extends Event {
  modules: EventModule[];
}

export interface EventWithTicketTypes extends Event {
  ticket_types: TicketType[];
}

export interface EventComplete extends Event {
  creator: User;
  modules: EventModule[];
  ticket_types: TicketType[];
}

// ============================================================================
// EVENT MODULE
// ============================================================================
export interface EventModule {
  id: string;
  event_id: string;
  title: string;
  description?: string | null;
  hours: number;
  order_index: number;
  created_at: string;
}

// ============================================================================
// TICKET TYPE (Lote)
// ============================================================================
export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description?: string | null;
  price: number;
  total_quantity: number;
  sold_quantity: number;
  sale_start?: string | null;
  sale_end?: string | null;
  is_active: boolean;
  created_at: string;

  // Sistema de Lotes Automáticos
  batch_number?: number;
  auto_advance_by_date?: boolean;
  auto_advance_by_quantity?: boolean;
  quantity_threshold?: number | null;
  next_batch_price?: number | null;
  next_batch_date?: string | null;
}

export interface TicketTypeWithAvailability extends TicketType {
  available_quantity: number;
  is_sale_active: boolean;
}

// ============================================================================
// TICKET (Ingresso)
// ============================================================================
export interface Ticket {
  id: string;
  event_id: string;
  ticket_type_id: string;
  user_id: string;

  // Buyer info
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string | null;

  // QR Code and Status
  qr_code_token: string;
  status: TicketStatus;

  // Pricing com cupom de desconto
  coupon_id?: string | null;
  original_price?: number | null;
  discount_amount?: number;
  final_price?: number | null;

  // Timestamps
  purchased_at: string;
  checked_in_at?: string | null;
  checkout_at?: string | null;
  created_at: string;
}

export interface TicketWithEvent extends Ticket {
  event: Event;
}

export interface TicketWithEventAndType extends Ticket {
  event: Event;
  ticket_type: TicketType;
}

export interface TicketWithDetails extends Ticket {
  event: Event;
  ticket_type: TicketType;
  user: User;
}

// ============================================================================
// EVENT MATERIAL
// ============================================================================
export interface EventMaterial {
  id: string;
  event_id: string;
  title: string;
  description?: string | null;
  file_url?: string | null;
  external_url?: string | null;
  visible_from?: string | null;
  created_at: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateEventFormData {
  // Basic info
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  target_audience?: string;
  included_items: string[];

  // Location
  location_name: string;
  address: string;
  google_maps_url?: string;
  layout?: EventLayout;
  capacity: number;

  // Dates
  start_datetime: string;
  end_datetime: string;

  // Mode
  mode: EventMode;

  // Media
  banner_url?: string;
  cover_image?: string;

  // Modules
  modules: {
    title: string;
    description?: string;
    hours: number;
  }[];

  // Ticket Types
  ticket_types: {
    name: string;
    description?: string;
    price: number;
    total_quantity: number;
    sale_start?: string;
    sale_end?: string;
  }[];
}

export interface CheckoutFormData {
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
}

export interface CheckInRequest {
  event_id: string;
  qr_code_token: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  ticket?: TicketWithDetails;
  already_checked_in?: boolean;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ============================================================================
// FILTERS AND QUERIES
// ============================================================================

export interface EventFilters {
  category?: string;
  mode?: EventMode;
  upcoming?: boolean;
  past?: boolean;
  search?: string;
}

export interface TicketFilters {
  event_id?: string;
  user_id?: string;
  status?: TicketStatus;
  checked_in?: boolean;
}

// ============================================================================
// SPACE BOOKING (Reserva de Espaço)
// ============================================================================
export interface SpaceBooking {
  id: string;
  user_id: string;
  event_id?: string | null;

  // Booking details
  hours: number;
  booking_date: string;

  // Addons
  has_audiovisual: boolean;
  has_coverage: boolean;
  has_coffee_break: boolean;

  // Pricing
  base_price: number;
  addons_price: number;
  discount_percentage: number;
  total_price: number;

  // Payment
  payment_status: PaymentStatus;
  payment_method?: string | null;
  payment_date?: string | null;
  payment_id?: string | null;

  // Status
  status: BookingStatus;
  confirmation_date?: string | null;

  // Metadata
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpaceBookingWithUser extends SpaceBooking {
  user: User;
}

export interface SpaceBookingWithEvent extends SpaceBooking {
  event?: Event | null;
}

export interface CreateBookingFormData {
  hours: number;
  booking_date: string;
  has_audiovisual: boolean;
  has_coverage: boolean;
  has_coffee_break: boolean;
  base_price: number;
  addons_price: number;
  discount_percentage: number;
  total_price: number;
}

// ============================================================================
// CUPOM DE DESCONTO
// ============================================================================
export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_discount_amount?: number | null;

  // Validade
  valid_from: string;
  valid_until?: string | null;

  // Limites
  usage_limit?: number | null;
  usage_count: number;
  usage_limit_per_user?: number;

  // Aplicabilidade
  event_id?: string | null;
  ticket_type_id?: string | null;
  minimum_purchase_amount?: number | null;

  // Status e tracking
  is_active: boolean;
  tracking_source?: string | null;

  // Metadata
  description?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  ticket_id: string;
  user_id?: string | null;

  original_price: number;
  discount_amount: number;
  final_price: number;

  used_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface CouponValidationResult {
  is_valid: boolean;
  discount_amount: number;
  final_price: number;
  coupon_id?: string | null;
  error_message?: string | null;
}

export interface CreateCouponFormData {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_discount_amount?: number;
  valid_from: string;
  valid_until?: string;
  usage_limit?: number;
  usage_limit_per_user?: number;
  event_id?: string;
  ticket_type_id?: string;
  minimum_purchase_amount?: number;
  tracking_source?: string;
  description?: string;
}

// ============================================================================
// CERTIFICADOS
// ============================================================================
export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string | null;
  event_id?: string | null;

  template_config: {
    background_color: string;
    primary_color: string;
    accent_color?: string;
    font_family: string;
    logo_url?: string | null;
    background_image_url?: string | null;
    layout: string;
    show_qr_code: boolean;
    show_logo: boolean;
    show_border?: boolean;
    border_style?: string;
    text_sections: {
      title: string;
      participant_prefix: string;
      event_prefix: string;
      hours_text: string;
      completion_prefix: string;
      footer?: string;
    };
    signature_sections?: Array<{
      name: string;
      title: string;
    }>;
  };

  is_active: boolean;
  is_default: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  event_id: string;
  ticket_id: string;
  user_id: string;

  participant_name: string;
  event_title: string;
  event_hours: number;
  completion_date: string;

  validation_token: string;
  template_id?: string | null;
  pdf_url?: string | null;

  issued_at: string;
  downloaded_at?: string | null;
  validated_at?: string | null;
  created_at: string;
}

export interface CertificateWithTemplate extends Certificate {
  template?: CertificateTemplate | null;
}

export interface CertificateWithEvent extends Certificate {
  event: Event;
}

// ============================================================================
// ANALYTICS E RELATÓRIOS
// ============================================================================
export interface SalesAnalytics {
  total_revenue: number;
  total_tickets_sold: number;
  total_tickets_checked_in: number;
  checkin_rate: number;

  sales_by_day: Array<{
    date: string;
    tickets: number;
    revenue: number;
  }>;

  sales_by_ticket_type: Array<{
    ticket_type_name: string;
    tickets_sold: number;
    revenue: number;
    percentage: number;
  }>;

  sales_by_hour: Array<{
    hour: number;
    tickets: number;
  }>;

  coupon_usage: Array<{
    coupon_code: string;
    usage_count: number;
    total_discount: number;
  }>;
}

export interface EventReport {
  event: Event;
  analytics: SalesAnalytics;
  participants: Array<{
    name: string;
    email: string;
    phone?: string | null;
    ticket_type: string;
    purchase_date: string;
    checked_in: boolean;
    checkin_date?: string | null;
  }>;
}
