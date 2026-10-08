export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'https://doctor-tracker-server-self.vercel.app';

export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'token';

export const NAV_LINKS = [
  { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Doctors', href: '/doctors', icon: 'Stethoscope' },
  { name: 'Patients', href: '/patients', icon: 'Users' },
];

export const COMMON_SPECIALIZATIONS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Oncology',
  'Internal Medicine',
  'Emergency Medicine',
  'General Surgery',
  'Psychiatry',
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const GENDERS = ['Male', 'Female', 'Other'];

export const PATIENT_CONDITIONS = [
  'Critical',
  'Serious',
  'Stable',
  'Recovering',
  'Under Observation',
];

export const USER_ROLES = ['admin', 'doctor', 'staff'];
