# MediSync SaaS EHR Platform - Backend Requirements

## 🏗️ SaaS Architecture Overview

**Vision:** Multi-tenant SaaS-based Electronic Health Record (EHR) system that centralizes and secures patient medical history, making it instantly accessible to authorized healthcare providers, labs, and patients themselves.

**Frontend Tech Stack:**
- React 19.1.1 with Vite 7.1.0
- React Router DOM 7.8.0
- Chart.js for data visualization
- Custom CSS architecture (no external UI frameworks)

**SaaS Backend Architecture:**
- Node.js with Express.js (API Gateway)
- MongoDB/PostgreSQL (Multi-tenant database)
- Redis (Caching & Session Management)
- JWT for authentication
- Stripe for subscription management
- AWS S3/Azure Blob (File storage)
- Email service integration (SendGrid/AWS SES)
- Real-time notifications (Socket.io)
- Docker containerization
- Kubernetes orchestration (production)

## 🏢 SaaS Multi-Tenancy Strategy

### Tenant Isolation Models
```javascript
// Hybrid Multi-Tenancy Approach
const TENANCY_MODEL = {
  // Shared Database, Separate Schemas per tenant
  DATABASE_ISOLATION: "schema_per_tenant",
  
  // Tenant identification
  TENANT_RESOLUTION: "subdomain", // hospital1.medisync.com
  
  // Data encryption per tenant
  ENCRYPTION: "tenant_specific_keys"
};
```

### Tenant Onboarding Workflow
```javascript
const ONBOARDING_STEPS = [
  "hospital_registration",
  "plan_selection", 
  "payment_setup",
  "admin_account_creation",
  "subdomain_configuration",
  "initial_setup_wizard",
  "staff_invitation",
  "data_migration_support"
];
```

---

## 🏢 SaaS Subscription Management

### Subscription Plans
```javascript
const SUBSCRIPTION_PLANS = {
  STARTER: {
    name: "Starter Plan",
    price: 99, // per month
    maxUsers: 10,
    maxPatients: 500,
    storage: "5GB",
    features: ["basic_ehr", "patient_management", "appointments"],
    support: "email"
  },
  PROFESSIONAL: {
    name: "Professional Plan", 
    price: 299,
    maxUsers: 50,
    maxPatients: 2000,
    storage: "25GB",
    features: ["all_starter", "prescriptions", "lab_integration", "reports"],
    support: "priority_email"
  },
  ENTERPRISE: {
    name: "Enterprise Plan",
    price: 799,
    maxUsers: "unlimited",
    maxPatients: "unlimited", 
    storage: "100GB",
    features: ["all_professional", "api_access", "custom_integrations", "advanced_analytics"],
    support: "phone_support"
  },
  CUSTOM: {
    name: "Custom Enterprise",
    price: "negotiated",
    features: ["white_label", "dedicated_server", "custom_development"],
    support: "dedicated_manager"
  }
};
```

### Billing & Payment System
```javascript
const BILLING_SYSTEM = {
  PAYMENT_PROCESSOR: "Stripe",
  BILLING_CYCLES: ["monthly", "annual"],
  TRIAL_PERIOD: 14, // days
  PAYMENT_METHODS: ["credit_card", "ach", "wire_transfer"],
  INVOICING: "automatic",
  PRORATION: true,
  DUNNING_MANAGEMENT: true
};
```

## 🛡️ SaaS Authentication & Authorization System

### User Roles & Permissions
```javascript
// Multi-tenant user roles
const USER_ROLES = {
  // Super Admin (Platform Level)
  SUPER_ADMIN: "super_admin",
  
  // Tenant Level Roles
  HOSPITAL_OWNER: "hospital_owner", // Tenant admin
  ADMIN: "admin",                   // Hospital admin
  DOCTOR: "doctor", 
  NURSE: "nurse",
  STAFF: "staff",
  LAB_TECHNICIAN: "lab_technician",
  PHARMACIST: "pharmacist",
  
  // Patient Role (Can belong to multiple tenants)
  PATIENT: "patient"
};

// Feature-based permissions
const PERMISSIONS = {
  // Patient Management
  "patients.create": ["hospital_owner", "admin", "doctor", "nurse"],
  "patients.read": ["hospital_owner", "admin", "doctor", "nurse", "staff"],
  "patients.update": ["hospital_owner", "admin", "doctor", "nurse"],
  "patients.delete": ["hospital_owner", "admin"],
  
  // Prescription Management
  "prescriptions.create": ["doctor"],
  "prescriptions.read": ["doctor", "nurse", "pharmacist", "patient"],
  "prescriptions.update": ["doctor"],
  "prescriptions.dispense": ["pharmacist"],
  
  // Billing & Subscription (Platform Level)
  "billing.manage": ["super_admin"],
  "tenants.manage": ["super_admin"],
  
  // Tenant Settings
  "hospital.settings": ["hospital_owner", "admin"],
  "hospital.users": ["hospital_owner", "admin"],
  "hospital.billing": ["hospital_owner"]
};
```

### Multi-tenant Authentication Flow
```javascript
const AUTH_FLOW = {
  // 1. User visits: hospital1.medisync.com
  // 2. Extract tenant from subdomain
  // 3. Authenticate against tenant-specific user base
  // 4. Generate JWT with tenant context
  // 5. All API calls include tenant context
};
```

### Authentication Endpoints Required
```
# Public Routes (No tenant context)
POST /api/auth/register-hospital    // Hospital registration
POST /api/auth/verify-email        // Email verification
POST /api/auth/check-subdomain     // Check subdomain availability

# Tenant-specific Routes
POST /api/auth/login               // Tenant user login
POST /api/auth/register           // Register user in tenant
POST /api/auth/logout
POST /api/auth/refresh-token
GET  /api/auth/me
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/invite-user        // Invite staff to hospital
GET  /api/auth/accept-invite      // Accept invitation

# Super Admin Routes  
POST /api/admin/login             // Platform admin login
GET  /api/admin/tenants           // Manage all hospitals
POST /api/admin/tenant/suspend    // Suspend hospital account
```

### JWT Token Structure (Multi-tenant)
```javascript
{
  userId: "user_id",
  name: "User Name",
  email: "user@email.com", 
  role: "doctor|nurse|hospital_owner|patient",
  permissions: ["patients.read", "prescriptions.create"],
  
  // Tenant Context
  tenantId: "hospital_id",
  tenantName: "Hospital Name",
  tenantSubdomain: "hospital1",
  tenantPlan: "professional",
  tenantStatus: "active",
  
  // Token meta
  iat: timestamp,
  exp: timestamp,
  type: "access_token"
}
```

---

## 📊 SaaS Multi-Tenant Database Schema

### 1. Tenants (Hospitals) Collection - Platform Level
```javascript
{
  _id: ObjectId,
  // Basic Info
  name: String,
  subdomain: String (unique), // hospital1.medisync.com
  domain: String, // custom domain (optional)
  
  // Contact Information
  address: String,
  phone: String,
  email: String,
  website: String,
  logo: String,
  
  // Registration Details
  registrationNumber: String,
  licenseNumber: String,
  taxId: String,
  
  // Subscription Management
  subscription: {
    planId: ObjectId,
    planName: String,
    status: Enum["trial", "active", "suspended", "cancelled"],
    billingCycle: Enum["monthly", "annual"],
    amount: Number,
    currency: String,
    trialEndsAt: Date,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    nextBillingDate: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  
  // Usage Limits & Tracking
  limits: {
    maxUsers: Number,
    maxPatients: Number,
    maxStorage: Number, // in bytes
    maxApiCalls: Number // per month
  },
  
  currentUsage: {
    totalUsers: Number,
    totalPatients: Number,
    storageUsed: Number,
    apiCallsThisMonth: Number,
    lastCalculated: Date
  },
  
  // Settings
  settings: {
    timeZone: String,
    currency: String,
    language: String,
    dateFormat: String,
    features: [String], // enabled features for this tenant
    integrations: {
      labIntegration: Boolean,
      pharmacyIntegration: Boolean,
      insuranceIntegration: Boolean
    }
  },
  
  // Admin Information
  ownerId: ObjectId, // Primary hospital owner
  adminUsers: [ObjectId], // Additional admins
  
  // Status & Compliance
  status: Enum["active", "suspended", "pending_verification", "cancelled"],
  isVerified: Boolean,
  compliance: {
    hipaaCompliant: Boolean,
    gdprCompliant: Boolean,
    lastAudit: Date
  },
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  
  // Database sharding key (for large scale)
  shardKey: String
}
```

### 2. Users Collection - Tenant Scoped
```javascript
{
  _id: ObjectId,
  tenantId: ObjectId, // Reference to Tenants collection
  
  // Basic Information
  name: String,
  email: String, // unique within tenant
  password: String (hashed),
  phone: String,
  avatar: String,
  
  // Role & Permissions
  role: Enum["hospital_owner", "admin", "doctor", "nurse", "staff", "lab_technician", "pharmacist", "patient"],
  permissions: [String], // Feature-based permissions
  departments: [String], // Which departments user has access to
  
  // Professional Information (for staff)
  professional: {
    licenseNumber: String,
    specialization: String,
    experience: Number,
    qualifications: [String],
    department: String
  },
  
  // Account Status
  status: Enum["active", "inactive", "suspended", "pending_verification"],
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  
  // Login & Security
  lastLogin: Date,
  loginAttempts: Number,
  lockedUntil: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Two-Factor Authentication
  twoFactorSecret: String,
  twoFactorEnabled: Boolean,
  
  // Invitation System
  invitedBy: ObjectId,
  invitationToken: String,
  invitationExpires: Date,
  invitationAccepted: Boolean,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  
  // Multi-tenant patient support (patients can access multiple hospitals)
  patientAccess: [{
    tenantId: ObjectId,
    patientId: ObjectId,
    accessLevel: String,
    grantedBy: ObjectId,
    grantedAt: Date
  }]
}
```

### 3. Subscription Plans Collection - Platform Level
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  currency: String,
  billingInterval: Enum["month", "year"],
  
  // Feature Limits
  limits: {
    maxUsers: Number,
    maxPatients: Number,
    maxStorage: Number, // in GB
    maxApiCalls: Number,
    maxLocations: Number // multi-location hospitals
  },
  
  // Feature Access
  features: [String], // Array of feature flags
  
  // Integrations Included
  integrations: {
    basicIntegrations: [String],
    premiumIntegrations: [String],
    apiAccess: Boolean,
    webhooks: Boolean
  },
  
  // Support Level
  support: {
    level: Enum["email", "priority_email", "phone", "dedicated_manager"],
    responseTime: String,
    supportHours: String
  },
  
  // Plan Status
  isActive: Boolean,
  isPublic: Boolean, // Show on pricing page
  stripePriceId: String,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Patients Collection - Tenant Scoped
```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  
  // Unique Identifiers
  mrn: String, // Medical Record Number (unique within tenant)
  patientId: String, // Human-readable ID
  externalIds: [{ // IDs from other systems
    system: String,
    value: String
  }],
  
  // Personal Information
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  dateOfBirth: Date,
  age: Number, // Calculated field
  gender: Enum["Male", "Female", "Other", "Prefer not to say"],
  
  // Address Information
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Emergency Contact
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    email: String,
    isPrimary: Boolean
  }],
  
  // Medical Information
  bloodType: String,
  allergies: [{
    allergen: String,
    severity: Enum["mild", "moderate", "severe"],
    reaction: String,
    notes: String
  }],
  
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    prescribedBy: String,
    startDate: Date,
    endDate: Date,
    isActive: Boolean
  }],
  
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    treatingPhysician: String,
    status: Enum["active", "resolved", "chronic"],
    notes: String
  }],
  
  // Vital Signs (Latest)
  vitals: {
    height: Number,
    weight: Number,
    bmi: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    lastUpdated: Date,
    updatedBy: ObjectId
  },
  
  // Insurance Information
  insurance: [{
    provider: String,
    policyNumber: String,
    groupNumber: String,
    subscriberName: String,
    relationship: String,
    effectiveDate: Date,
    expirationDate: Date,
    isPrimary: Boolean
  }],
  
  // Assigned Healthcare Team
  assignedProviders: [{
    providerId: ObjectId,
    role: String,
    isPrimary: Boolean,
    assignedDate: Date
  }],
  
  // Patient Portal Access
  portalAccess: {
    isEnabled: Boolean,
    lastLogin: Date,
    securityQuestions: [{
      question: String,
      answerHash: String
    }]
  },
  
  // Consent & Privacy
  consents: [{
    type: String, // "treatment", "billing", "marketing", etc.
    granted: Boolean,
    grantedDate: Date,
    revokedDate: Date,
    documentId: ObjectId
  }],
  
  // Status & Flags
  status: Enum["Active", "Inactive", "Deceased", "Transferred"],
  flags: [{
    type: String, // "VIP", "High Risk", "Do Not Resuscitate", etc.
    value: String,
    setBy: ObjectId,
    setDate: Date,
    notes: String
  }],
  
  // Metadata
  avatar: String,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  lastModifiedBy: ObjectId,
  
  // Data sharing permissions (for cross-hospital access)
  sharingPermissions: [{
    recipientTenantId: ObjectId,
    recipientTenantName: String,
    dataTypes: [String], // ["demographics", "medications", "allergies", etc.]
    grantedBy: ObjectId,
    grantedDate: Date,
    expiresDate: Date,
    isActive: Boolean
  }]
}
```

### 3. Doctors Collection/Table
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  hospitalId: ObjectId,
  licenseNumber: String,
  specialization: String,
  department: String,
  experience: Number,
  qualifications: [String],
  consultationFee: Number,
  availableHours: {
    monday: {start: String, end: String},
    tuesday: {start: String, end: String},
    // ... other days
  },
  status: Enum["Available", "Busy", "Off Duty"],
  rating: Number,
  totalPatients: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Staff Collection/Table
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  hospitalId: ObjectId,
  employeeId: String,
  role: String, // Nurse, Lab Technician, etc.
  department: String,
  shift: String,
  experience: String,
  certifications: [String],
  performance: Number,
  joinDate: Date,
  status: Enum["Active", "On Leave", "Inactive"],
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Appointments Collection/Table
```javascript
{
  _id: ObjectId,
  hospitalId: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  appointmentDate: Date,
  appointmentTime: String,
  duration: Number, // in minutes
  department: String,
  reason: String,
  type: Enum["In-Person", "Virtual"],
  status: Enum["Scheduled", "Confirmed", "Completed", "Cancelled", "No-Show"],
  location: String,
  notes: String,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Prescriptions Collection/Table
```javascript
{
  _id: ObjectId,
  hospitalId: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  appointmentId: ObjectId,
  medication: String,
  dosage: String,
  frequency: String,
  duration: String,
  instructions: String,
  reason: String,
  status: Enum["Active", "Completed", "Discontinued"],
  refillsLeft: Number,
  nextRefill: Date,
  dateStarted: Date,
  dateEnded: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Medical Reports Collection/Table
```javascript
{
  _id: ObjectId,
  hospitalId: ObjectId,
  patientId: ObjectId,
  uploadedBy: ObjectId,
  reportType: String,
  fileName: String,
  filePath: String,
  fileSize: Number,
  mimeType: String,
  uploadDate: Date,
  reportDate: Date,
  department: String,
  notes: String,
  status: Enum["Pending", "Reviewed", "Approved"],
  reviewedBy: ObjectId,
  reviewDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 8. Reminders Collection/Table
```javascript
{
  _id: ObjectId,
  hospitalId: ObjectId,
  title: String,
  description: String,
  type: String,
  priority: Enum["low", "medium", "high"],
  dueDate: Date,
  dueTime: String,
  patientId: ObjectId, // optional
  assignedTo: ObjectId,
  createdBy: ObjectId,
  status: Enum["pending", "in-progress", "completed"],
  recurring: Boolean,
  recurringInterval: String,
  completedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 9. Hospitals Collection/Table (Multi-tenant)
```javascript
{
  _id: ObjectId,
  name: String,
  address: String,
  phone: String,
  email: String,
  website: String,
  logo: String,
  registrationNumber: String,
  adminId: ObjectId, // Hospital Owner
  subscription: {
    plan: String,
    startDate: Date,
    endDate: Date,
    isActive: Boolean
  },
  settings: {
    timeZone: String,
    currency: String,
    language: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 SaaS API Endpoints Structure

### Platform Management Routes (Super Admin)
```
# Tenant Management
GET    /api/admin/tenants              // List all hospitals
GET    /api/admin/tenants/:id          // Get specific hospital
POST   /api/admin/tenants              // Create hospital (onboarding)
PUT    /api/admin/tenants/:id          // Update hospital
DELETE /api/admin/tenants/:id          // Delete hospital
POST   /api/admin/tenants/:id/suspend  // Suspend hospital
POST   /api/admin/tenants/:id/activate // Activate hospital

# Subscription Management
GET    /api/admin/subscriptions        // All subscriptions
PUT    /api/admin/subscriptions/:id    // Update subscription
GET    /api/admin/billing/revenue      // Revenue analytics
GET    /api/admin/usage/stats          // Platform usage stats

# Plan Management
GET    /api/admin/plans                // Subscription plans
POST   /api/admin/plans                // Create plan
PUT    /api/admin/plans/:id            // Update plan
DELETE /api/admin/plans/:id            // Delete plan
```

### Tenant Registration & Onboarding
```
# Hospital Registration Flow
POST   /api/register/hospital          // Initial hospital signup
POST   /api/register/verify-email      // Email verification
POST   /api/register/complete-profile  // Complete hospital profile
POST   /api/register/setup-billing     // Payment setup
POST   /api/register/setup-subdomain   // Subdomain configuration

# Onboarding Wizard
GET    /api/onboarding/steps          // Get onboarding checklist
POST   /api/onboarding/step/:step     // Complete onboarding step
GET    /api/onboarding/status         // Onboarding progress
```

### Billing & Subscription Routes (Tenant Level)
```
# Subscription Management
GET    /api/billing/subscription       // Current subscription
POST   /api/billing/upgrade           // Upgrade plan
POST   /api/billing/downgrade         // Downgrade plan
POST   /api/billing/cancel            // Cancel subscription
GET    /api/billing/invoices          // Invoice history
GET    /api/billing/usage             // Current usage stats

# Payment Methods
GET    /api/billing/payment-methods   // Saved payment methods
POST   /api/billing/payment-methods   // Add payment method
DELETE /api/billing/payment-methods/:id // Remove payment method
PUT    /api/billing/payment-methods/:id/default // Set default

# Webhooks (Stripe Integration)
POST   /api/webhooks/stripe           // Stripe webhook handler
```

### Multi-Tenant Core Routes

### Authentication Routes (Tenant Scoped)
```
POST /api/auth/login                   // Tenant user login
POST /api/auth/register               // Register user in tenant
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
POST /api/auth/invite-user            // Invite staff to hospital
GET  /api/auth/invitations            // List pending invitations
POST /api/auth/accept-invitation      // Accept staff invitation
```

### Tenant Settings & Management
```
GET    /api/tenant/profile            // Hospital profile
PUT    /api/tenant/profile            // Update hospital profile
GET    /api/tenant/settings           // Hospital settings
PUT    /api/tenant/settings           // Update settings
GET    /api/tenant/users              // Hospital users
POST   /api/tenant/users              // Add user to hospital
PUT    /api/tenant/users/:id          // Update user
DELETE /api/tenant/users/:id          // Remove user from hospital
GET    /api/tenant/usage              // Current usage statistics
GET    /api/tenant/audit-logs         // Audit trail
```

### Patient Management Routes
```
GET    /api/patients              // Get all patients (with pagination)
GET    /api/patients/:id          // Get specific patient
POST   /api/patients              // Create new patient
PUT    /api/patients/:id          // Update patient
DELETE /api/patients/:id          // Soft delete patient
GET    /api/patients/search       // Search patients
GET    /api/patients/recent       // Recent patients
GET    /api/patients/critical     // Critical patients
```

### Doctor Management Routes
```
GET    /api/doctors               // Get all doctors
GET    /api/doctors/:id           // Get specific doctor
POST   /api/doctors               // Create doctor profile
PUT    /api/doctors/:id           // Update doctor
DELETE /api/doctors/:id           // Remove doctor
GET    /api/doctors/available     // Available doctors
GET    /api/doctors/by-department // Doctors by department
```

### Staff Management Routes
```
GET    /api/staff                 // Get all staff
GET    /api/staff/:id             // Get specific staff
POST   /api/staff                 // Add new staff
PUT    /api/staff/:id             // Update staff
DELETE /api/staff/:id             // Remove staff
GET    /api/staff/by-department   // Staff by department
GET    /api/staff/performance     // Staff performance data
```

### Appointment Routes
```
GET    /api/appointments          // Get appointments (filtered)
GET    /api/appointments/:id      // Get specific appointment
POST   /api/appointments          // Book new appointment
PUT    /api/appointments/:id      // Update appointment
DELETE /api/appointments/:id      // Cancel appointment
GET    /api/appointments/calendar // Calendar view data
GET    /api/appointments/upcoming // Upcoming appointments
GET    /api/appointments/past     // Past appointments
```

### Prescription Routes
```
GET    /api/prescriptions         // Get prescriptions
GET    /api/prescriptions/:id     // Get specific prescription
POST   /api/prescriptions         // Create prescription
PUT    /api/prescriptions/:id     // Update prescription
DELETE /api/prescriptions/:id     // Discontinue prescription
GET    /api/prescriptions/current // Active prescriptions
GET    /api/prescriptions/past    // Past prescriptions
POST   /api/prescriptions/refill  // Request refill
```

### Medical Reports Routes
```
GET    /api/reports               // Get all reports
GET    /api/reports/:id           // Get specific report
POST   /api/reports/upload        // Upload new report
PUT    /api/reports/:id           // Update report
DELETE /api/reports/:id           // Delete report
GET    /api/reports/patient/:id   // Patient's reports
GET    /api/reports/download/:id  // Download report file
```

### Reminders Routes
```
GET    /api/reminders             // Get reminders (filtered)
GET    /api/reminders/:id         // Get specific reminder
POST   /api/reminders             // Create reminder
PUT    /api/reminders/:id         // Update reminder
DELETE /api/reminders/:id         // Delete reminder
PUT    /api/reminders/:id/status  // Update reminder status
GET    /api/reminders/today       // Today's reminders
GET    /api/reminders/overdue     // Overdue reminders
```

### Dashboard & Analytics Routes
```
GET    /api/dashboard/stats       // Dashboard statistics
GET    /api/dashboard/charts      // Chart data
GET    /api/analytics/patients    // Patient analytics
GET    /api/analytics/appointments// Appointment analytics
GET    /api/analytics/revenue     // Revenue analytics
```

---

## 📁 File Upload Requirements

### Upload Configuration
```javascript
// Supported file types for medical reports
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png', 
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// File size limits
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Upload destinations
const UPLOAD_PATHS = {
  MEDICAL_REPORTS: '/uploads/reports/',
  PATIENT_AVATARS: '/uploads/avatars/patients/',
  DOCTOR_AVATARS: '/uploads/avatars/doctors/',
  HOSPITAL_LOGOS: '/uploads/logos/'
};
```

### File Upload Endpoints
```
POST /api/upload/report           // Upload medical report
POST /api/upload/avatar           // Upload user avatar
POST /api/upload/logo             // Upload hospital logo
GET  /api/files/:filename         // Serve uploaded files
DELETE /api/files/:id             // Delete uploaded file
```

---

## 🔐 Security Requirements

### Authentication Security
- JWT tokens with expiration
- Refresh token mechanism
- Password hashing (bcrypt)
- Rate limiting on auth endpoints
- Account lockout after failed attempts

### Data Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Helmet.js for security headers

---

## 🔐 SaaS Security & Compliance

### HIPAA Compliance Requirements
```javascript
const HIPAA_REQUIREMENTS = {
  // Data Encryption
  ENCRYPTION_AT_REST: "AES-256",
  ENCRYPTION_IN_TRANSIT: "TLS 1.3",
  DATABASE_ENCRYPTION: "Transparent Data Encryption",
  
  // Access Controls
  AUTHENTICATION: "Multi-factor authentication required",
  AUTHORIZATION: "Role-based access control",
  SESSION_MANAGEMENT: "15-minute timeout for sensitive data",
  
  // Audit Requirements
  AUDIT_LOGGING: "All PHI access must be logged",
  LOG_RETENTION: "6 years minimum",
  LOG_INTEGRITY: "Tamper-proof audit trails",
  
  // Data Backup & Recovery
  BACKUP_FREQUENCY: "Daily automated backups",
  BACKUP_ENCRYPTION: "Encrypted backups",
  DISASTER_RECOVERY: "RTO: 4 hours, RPO: 1 hour",
  
  // Business Associate Agreements
  BAA_REQUIRED: true,
  THIRD_PARTY_COMPLIANCE: "All vendors must be HIPAA compliant"
};
```

### Multi-Tenant Security Architecture
```javascript
const SECURITY_LAYERS = {
  // Network Security
  NETWORK: {
    WAF: "Web Application Firewall",
    DDoS_PROTECTION: "CloudFlare / AWS Shield",
    VPC: "Private network isolation",
    FIREWALL: "Stateful firewall rules"
  },
  
  // Application Security
  APPLICATION: {
    RATE_LIMITING: "Per-tenant rate limits",
    INPUT_VALIDATION: "Strict input sanitization",
    SQL_INJECTION_PREVENTION: "Parameterized queries",
    XSS_PROTECTION: "Content Security Policy",
    CSRF_PROTECTION: "CSRF tokens"
  },
  
  // Data Security
  DATA: {
    TENANT_ISOLATION: "Database-level isolation",
    FIELD_LEVEL_ENCRYPTION: "Sensitive fields encrypted",
    DATA_MASKING: "PII masking in logs",
    BACKUP_ENCRYPTION: "Encrypted backups"
  },
  
  // Access Control
  ACCESS: {
    RBAC: "Role-based access control",
    MFA: "Multi-factor authentication",
    SSO: "Single sign-on support",
    API_AUTHENTICATION: "JWT + API keys"
  }
};
```

### Compliance Monitoring
```javascript
const COMPLIANCE_MONITORING = {
  // Automated Compliance Checks
  AUTOMATED_CHECKS: [
    "password_policy_compliance",
    "access_review_automation",
    "data_retention_enforcement",
    "encryption_verification",
    "backup_validation"
  ],
  
  // Audit Trail Requirements
  AUDIT_EVENTS: [
    "user_login_logout",
    "patient_record_access",
    "data_modification",
    "system_configuration_changes",
    "failed_access_attempts"
  ],
  
  // Reporting
  COMPLIANCE_REPORTS: [
    "monthly_access_report",
    "quarterly_security_review",
    "annual_risk_assessment",
    "breach_notification_procedures"
  ]
};
```

### Data Privacy & GDPR
```javascript
const PRIVACY_REQUIREMENTS = {
  // Data Subject Rights
  RIGHT_TO_ACCESS: "Patient portal with data export",
  RIGHT_TO_RECTIFICATION: "Data correction workflows",
  RIGHT_TO_ERASURE: "Data deletion procedures",
  RIGHT_TO_PORTABILITY: "Standardized data export",
  
  // Consent Management
  CONSENT_TRACKING: "Granular consent management",
  CONSENT_WITHDRAWAL: "Easy consent withdrawal",
  PURPOSE_LIMITATION: "Data use limited to stated purposes",
  
  // Cross-Border Data Transfer
  DATA_LOCALIZATION: "EU data stays in EU",
  TRANSFER_MECHANISMS: "Standard Contractual Clauses",
  ADEQUACY_DECISIONS: "Approved country transfers only"
};
```

---

## 📧 Email Service Integration

### Email Templates Needed
```
- Welcome email for new users
- Appointment confirmation
- Appointment reminders
- Password reset
- Prescription refill reminders
- Lab results notifications
```

### Email Endpoints
```
POST /api/email/send              // Send custom email
POST /api/email/appointment-reminder
POST /api/email/prescription-reminder
POST /api/email/password-reset
```

---

## 🔔 Real-time Notifications

### WebSocket Events
```javascript
// Events to implement
const SOCKET_EVENTS = {
  NEW_APPOINTMENT: 'new_appointment',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  PRESCRIPTION_READY: 'prescription_ready',
  LAB_RESULTS_READY: 'lab_results_ready',
  REMINDER_DUE: 'reminder_due',
  EMERGENCY_ALERT: 'emergency_alert'
};
```

---

## 📊 Data Validation Requirements

### Frontend Form Validations to Replicate
```javascript
// Patient form validation
const patientValidation = {
  firstName: { required: true, minLength: 2 },
  lastName: { required: true, minLength: 2 },
  email: { required: true, format: 'email' },
  phone: { required: true, format: 'phone' },
  dateOfBirth: { required: true, type: 'date' },
  gender: { required: true, enum: ['Male', 'Female', 'Other'] },
  bloodType: { required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }
};

// Appointment validation
const appointmentValidation = {
  doctorId: { required: true },
  appointmentDate: { required: true, future: true },
  appointmentTime: { required: true },
  reason: { required: true, minLength: 10 }
};
```

---

## 🏗️ SaaS Infrastructure & Deployment

### Cloud Architecture (AWS/Azure)
```javascript
const SAAS_INFRASTRUCTURE = {
  // Load Balancer & CDN
  LOAD_BALANCER: "AWS ALB / Azure Load Balancer",
  CDN: "CloudFront / Azure CDN",
  
  // Application Servers
  COMPUTE: "AWS ECS / Azure Container Instances",
  CONTAINER_ORCHESTRATION: "Kubernetes",
  
  // Database
  PRIMARY_DB: "AWS RDS / Azure Database for PostgreSQL",
  CACHE: "AWS ElastiCache Redis / Azure Cache for Redis",
  
  // File Storage
  FILE_STORAGE: "AWS S3 / Azure Blob Storage",
  
  // Message Queue
  QUEUE: "AWS SQS / Azure Service Bus",
  
  // Monitoring & Logging
  MONITORING: "AWS CloudWatch / Azure Monitor",
  LOGGING: "ELK Stack / Azure Log Analytics",
  
  // Security
  WAF: "AWS WAF / Azure WAF",
  SECRETS: "AWS Secrets Manager / Azure Key Vault"
};
```

### Environment Configuration
```bash
# Multi-Environment Setup
ENVIRONMENTS = [
  "development",
  "staging", 
  "production"
]

# Environment Variables (Production)
NODE_ENV=production
PORT=3000

# Database (Multi-tenant)
DATABASE_URL=postgresql://user:pass@host:5432/medisync_platform
REDIS_URL=redis://redis-cluster:6379
DATABASE_POOL_SIZE=20

# JWT & Security
JWT_SECRET=ultra-secure-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d
ENCRYPTION_KEY=tenant-data-encryption-key

# Payment Processing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email Service
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@medisync.com
SUPPORT_EMAIL=support@medisync.com

# File Storage
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=medisync-files
AWS_REGION=us-east-1

# Monitoring & Analytics
SENTRY_DSN=https://xxx@sentry.io/xxx
ANALYTICS_KEY=ga_measurement_id

# Rate Limiting
RATE_LIMIT_WINDOW=15 # minutes
RATE_LIMIT_MAX_REQUESTS=1000

# Feature Flags
FEATURE_FLAGS_API_KEY=xxx
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Kubernetes Deployment
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: medisync-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: medisync-api
  template:
    metadata:
      labels:
        app: medisync-api
    spec:
      containers:
      - name: api
        image: medisync/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: medisync-secrets
              key: database-url
```

### Environment Variables Needed
```bash
# Database
DATABASE_URL=mongodb://localhost:27017/medisync
DB_NAME=medisync

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Email Service (SendGrid/Nodemailer)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@medisync.com

# File Upload
UPLOAD_PATH=/uploads
MAX_FILE_SIZE=10485760

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Socket.io
SOCKET_PORT=5001
```

### SaaS-Specific npm Dependencies
```json
{
  "dependencies": {
    // Core Framework
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    
    // Database & Caching
    "mongoose": "^7.5.0",
    "redis": "^4.6.0",
    "mongoose-paginate-v2": "^1.7.4",
    
    // Authentication & Security
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1",
    "speakeasy": "^2.0.0", // 2FA
    
    // Payment Processing
    "stripe": "^13.0.0",
    
    // File Handling
    "multer": "^1.4.5",
    "aws-sdk": "^2.1467.0",
    "multer-s3": "^3.0.1",
    
    // Email & Notifications
    "nodemailer": "^6.9.4",
    "@sendgrid/mail": "^7.7.0",
    "socket.io": "^4.7.2",
    
    // Utilities
    "dotenv": "^16.3.1",
    "morgan": "^1.10.0",
    "moment": "^2.29.4",
    "uuid": "^9.0.0",
    "lodash": "^4.17.21",
    
    // Monitoring & Error Tracking
    "@sentry/node": "^7.70.0",
    "pino": "^8.15.0",
    "pino-pretty": "^10.2.0",
    
    // Background Jobs
    "bull": "^4.11.3",
    "node-cron": "^3.0.2",
    
    // API Documentation
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.51.0",
    "prettier": "^3.0.3"
  }
}
```

### Multi-Tenant Middleware Stack
```javascript
// Tenant resolution middleware
const tenantMiddleware = (req, res, next) => {
  // Extract tenant from subdomain or header
  const subdomain = req.hostname.split('.')[0];
  req.tenant = await getTenantBySubdomain(subdomain);
  
  if (!req.tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }
  
  // Set database connection for tenant
  req.db = getTenantDatabase(req.tenant.id);
  next();
};

// Usage tracking middleware
const usageMiddleware = (req, res, next) => {
  // Track API calls for billing
  incrementUsage(req.tenant.id, 'api_calls');
  next();
};

// Feature flag middleware
const featureMiddleware = (feature) => (req, res, next) => {
  if (!req.tenant.features.includes(feature)) {
    return res.status(403).json({ error: 'Feature not available in your plan' });
  }
  next();
};
```

---

## 📈 Performance Requirements

### Database Indexing
```javascript
// Required indexes for optimal performance
const REQUIRED_INDEXES = [
  { collection: 'users', fields: { email: 1 } },
  { collection: 'patients', fields: { mrn: 1, hospitalId: 1 } },
  { collection: 'appointments', fields: { doctorId: 1, appointmentDate: 1 } },
  { collection: 'prescriptions', fields: { patientId: 1, status: 1 } },
  { collection: 'reports', fields: { patientId: 1, uploadDate: -1 } },
  { collection: 'reminders', fields: { dueDate: 1, status: 1 } }
];
```

### Pagination & Filtering
```javascript
// Standard pagination format expected by frontend
const PAGINATION_FORMAT = {
  page: 1,
  limit: 10,
  totalPages: 5,
  totalItems: 50,
  hasNext: true,
  hasPrev: false,
  data: []
};
```

---

---

## 🎯 SaaS Development Roadmap

### Phase 1: SaaS Foundation (Weeks 1-4)
```javascript
const PHASE_1_DELIVERABLES = {
  // Core Infrastructure
  INFRASTRUCTURE: [
    "multi_tenant_database_architecture",
    "tenant_resolution_middleware", 
    "basic_subscription_management",
    "stripe_integration"
  ],
  
  // Authentication System
  AUTHENTICATION: [
    "multi_tenant_auth_system",
    "jwt_with_tenant_context",
    "invitation_system",
    "password_policies"
  ],
  
  // Basic SaaS Features
  SAAS_FEATURES: [
    "hospital_registration_flow",
    "plan_selection_system",
    "basic_billing_integration",
    "usage_tracking_foundation"
  ]
};
```

### Phase 2: Core EHR Features (Weeks 5-8)
```javascript
const PHASE_2_DELIVERABLES = {
  // Patient Management
  PATIENT_SYSTEM: [
    "multi_tenant_patient_records",
    "patient_portal_access",
    "cross_hospital_data_sharing",
    "patient_consent_management"
  ],
  
  // Provider Management
  PROVIDER_SYSTEM: [
    "doctor_staff_management",
    "role_based_permissions",
    "department_organization",
    "provider_scheduling"
  ],
  
  // Clinical Features
  CLINICAL: [
    "appointment_system",
    "prescription_management",
    "medical_records_system",
    "lab_integration_framework"
  ]
};
```

### Phase 3: Advanced Features (Weeks 9-12)
```javascript
const PHASE_3_DELIVERABLES = {
  // Advanced Clinical
  ADVANCED_CLINICAL: [
    "clinical_decision_support",
    "drug_interaction_checking",
    "allergy_alerts",
    "clinical_workflows"
  ],
  
  // Analytics & Reporting
  ANALYTICS: [
    "tenant_analytics_dashboard",
    "clinical_quality_metrics",
    "population_health_insights",
    "custom_reporting_engine"
  ],
  
  // Integrations
  INTEGRATIONS: [
    "hl7_fhir_api",
    "lab_system_integration",
    "pharmacy_integration",
    "insurance_verification"
  ]
};
```

### Phase 4: Enterprise & Scale (Weeks 13-16)
```javascript
const PHASE_4_DELIVERABLES = {
  // Enterprise Features
  ENTERPRISE: [
    "white_label_solution",
    "custom_branding",
    "advanced_user_management",
    "enterprise_sso"
  ],
  
  // Scalability
  SCALABILITY: [
    "horizontal_scaling",
    "database_sharding",
    "cdn_integration",
    "performance_optimization"
  ],
  
  // Compliance
  COMPLIANCE: [
    "hipaa_compliance_certification",
    "gdpr_compliance_tools",
    "audit_trail_system",
    "security_monitoring"
  ]
};
```

---

## � SaaS Business Model & Pricing

### Revenue Streams
```javascript
const REVENUE_STREAMS = {
  // Subscription Revenue
  SUBSCRIPTION: {
    STARTER: "$99/month",
    PROFESSIONAL: "$299/month", 
    ENTERPRISE: "$799/month",
    CUSTOM: "Negotiated pricing"
  },
  
  // Usage-Based Revenue
  USAGE_BASED: {
    ADDITIONAL_USERS: "$10/user/month",
    EXTRA_STORAGE: "$0.50/GB/month",
    API_CALLS: "$0.001/call (above limit)",
    SMS_NOTIFICATIONS: "$0.05/SMS"
  },
  
  // Professional Services
  SERVICES: {
    IMPLEMENTATION: "$5,000-50,000",
    TRAINING: "$2,000/session",
    CUSTOM_INTEGRATION: "$10,000-100,000",
    CONSULTING: "$200/hour"
  },
  
  // Marketplace Revenue
  MARKETPLACE: {
    THIRD_PARTY_INTEGRATIONS: "30% revenue share",
    CUSTOM_MODULES: "20% revenue share",
    CERTIFIED_PARTNERS: "Partner fees"
  }
};
```

### Target Market Segmentation
```javascript
const TARGET_MARKETS = {
  // Primary Markets
  PRIMARY: {
    SMALL_PRACTICES: "1-10 providers",
    MEDIUM_CLINICS: "11-50 providers", 
    HOSPITALS: "50+ providers",
    SPECIALTY_PRACTICES: "Focused specialties"
  },
  
  // Geographic Markets
  GEOGRAPHIC: {
    TIER_1: ["US", "Canada", "UK", "Australia"],
    TIER_2: ["EU", "Japan", "Singapore"],
    TIER_3: ["India", "Mexico", "Brazil"]
  },
  
  // Market Size Estimation
  MARKET_SIZE: {
    TAM: "$50B (Global EHR Market)",
    SAM: "$15B (Cloud-based EHR)",
    SOM: "$150M (Achievable market share)"
  }
};
```

---

## 🚀 Go-to-Market Strategy

### Customer Acquisition Channels
```javascript
const ACQUISITION_CHANNELS = {
  // Digital Marketing
  DIGITAL: [
    "content_marketing_seo",
    "google_ads_healthcare_keywords",
    "linkedin_targeted_campaigns",
    "healthcare_webinars"
  ],
  
  // Partnership Channels
  PARTNERSHIPS: [
    "healthcare_consultants",
    "system_integrators",
    "medical_device_companies",
    "healthcare_associations"
  ],
  
  // Direct Sales
  DIRECT_SALES: [
    "inside_sales_team",
    "field_sales_reps",
    "healthcare_trade_shows",
    "referral_programs"
  ]
};
```

### Implementation Timeline
```javascript
const IMPLEMENTATION_TIMELINE = {
  // MVP Launch (Month 4)
  MVP: {
    FEATURES: ["basic_ehr", "patient_management", "appointments"],
    TARGET: "50 pilot customers",
    REVENUE_TARGET: "$25K MRR"
  },
  
  // Market Expansion (Month 8)
  EXPANSION: {
    FEATURES: ["full_ehr_suite", "integrations", "mobile_app"],
    TARGET: "200 customers",
    REVENUE_TARGET: "$150K MRR"
  },
  
  // Scale Phase (Month 12)
  SCALE: {
    FEATURES: ["enterprise_features", "ai_insights", "marketplace"],
    TARGET: "500 customers", 
    REVENUE_TARGET: "$500K MRR"
  }
};
```

This comprehensive SaaS transformation of your EHR system provides:

### 🎯 **Key SaaS Advantages:**
1. **Recurring Revenue**: Predictable monthly/annual subscriptions
2. **Scalability**: Serve unlimited hospitals without linear cost increases
3. **Market Reach**: Global accessibility through cloud deployment
4. **Faster Updates**: Centralized updates benefit all customers instantly
5. **Lower Customer Costs**: No upfront infrastructure investment for hospitals

### 🏗️ **Technical Foundation:**
- Multi-tenant architecture with complete data isolation
- Subscription management with Stripe integration
- Usage tracking and billing automation
- Enterprise-grade security and compliance
- Horizontal scaling capabilities

### 💼 **Business Model:**
- Tiered pricing from $99-$799/month
- Usage-based additional revenue streams
- Professional services for implementation
- Partner ecosystem for integrations

### 🚀 **Growth Strategy:**
- 16-week development timeline
- Phased rollout from MVP to enterprise features
- Multiple customer acquisition channels
- Clear path to $500K+ MRR within 12 months

Your frontend is already perfectly structured for this SaaS model - now you have a complete blueprint to build a world-class, multi-tenant EHR platform! 🎉
