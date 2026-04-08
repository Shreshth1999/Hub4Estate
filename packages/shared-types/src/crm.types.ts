// ============================================
// CRM Types (Company, Contact, Outreach, Meeting, Pipeline)
// ============================================

export enum CompanyType {
  MANUFACTURER = 'MANUFACTURER',
  DISTRIBUTOR = 'DISTRIBUTOR',
  DEALER = 'DEALER',
  BRAND = 'BRAND',
  OTHER = 'OTHER',
}

export enum CompanySegment {
  PREMIUM = 'PREMIUM',
  MID_RANGE = 'MID_RANGE',
  BUDGET = 'BUDGET',
  ALL_SEGMENTS = 'ALL_SEGMENTS',
}

export enum OutreachType {
  EMAIL = 'EMAIL',
  LINKEDIN = 'LINKEDIN',
  PHONE_CALL = 'PHONE_CALL',
  MEETING = 'MEETING',
  WHATSAPP = 'WHATSAPP',
  OTHER = 'OTHER',
}

export enum OutreachStatus {
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  REPLIED = 'REPLIED',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  BOUNCED = 'BOUNCED',
  FAILED = 'FAILED',
}

export interface CRMCompany {
  id: string;
  name: string;
  slug: string;
  type: CompanyType;
  segment: CompanySegment;

  // Contact Info
  website: string | null;
  /** General company email */
  email: string | null;
  phone: string | null;
  linkedIn: string | null;

  // Address
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;

  // Business Info
  description: string | null;
  /** e.g. ["Wires", "MCBs", "Lighting"] */
  productCategories: string[];
  yearEstablished: number | null;
  /** "1-50", "50-200", "200-500", "500+" */
  employeeCount: string | null;
  /** Revenue range */
  annualRevenue: string | null;

  // Digital Presence
  hasApi: boolean;
  /** low, medium, high */
  digitalMaturity: string | null;
  /** small, medium, large */
  dealerNetworkSize: string | null;

  // Status
  /** prospect, contacted, interested, partner, inactive */
  status: string;
  /** low, medium, high */
  priority: string;
  tags: string[];

  notes: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CRMContact {
  id: string;
  companyId: string;

  name: string;
  email: string | null;
  phone: string | null;
  linkedIn: string | null;

  /** CEO, CTO, Head of Sales, etc. */
  designation: string | null;
  /** Sales, Technology, Marketing, Operations */
  department: string | null;
  decisionMaker: boolean;
  /** Primary contact for this company */
  isPrimary: boolean;

  /** active, left_company, do_not_contact */
  status: string;

  notes: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CRMOutreach {
  id: string;
  companyId: string;
  contactId: string | null;

  type: OutreachType;
  subject: string | null;
  content: string;
  /** Email template name if used */
  templateUsed: string | null;

  scheduledAt: string | null;
  sentAt: string | null;

  status: OutreachStatus;
  openedAt: string | null;
  repliedAt: string | null;

  responseContent: string | null;
  /** positive, neutral, negative */
  responseSentiment: string | null;

  followUpDate: string | null;
  /** 1st, 2nd, 3rd follow-up */
  followUpNumber: number;

  notes: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CRMMeeting {
  id: string;
  companyId: string;
  title: string;
  description: string | null;

  scheduledAt: string;
  /** Duration in minutes */
  duration: number;
  /** Zoom/Google Meet link */
  meetingLink: string | null;
  location: string | null;

  /** JSON string: array of {name, email, role} */
  attendees: string | null;

  /** scheduled, completed, cancelled, rescheduled */
  status: string;

  agenda: string | null;
  /** Meeting notes */
  notes: string | null;
  /** positive, follow_up_needed, not_interested */
  outcome: string | null;
  nextSteps: string | null;

  /** JSON string of reminder times */
  reminders: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CRMPipelineStage {
  id: string;
  /** prospect, contacted, interested, negotiating, partner, churned */
  name: string;
  displayName: string;
  /** Hex color for UI */
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
