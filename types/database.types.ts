// ============================================================================
// DATABASE TYPES - StageOne Platform
// ============================================================================

export type UserRole = 'ADMIN' | 'PALESTRANTE' | 'PARTICIPANTE';
export type EventMode = 'PRESENCIAL' | 'ONLINE' | 'HIBRIDO';
export type EventLayout = 'AUDITORIO' | 'U' | 'ILHAS' | 'TEATRO' | 'CIRCULAR';
export type TicketStatus = 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED' | 'USED';

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
