export interface SettingsProfile {
  name: string;
  industry: string;
  website: string;
  about: string;
  billingEmail: string;
  phone: string;
  address: string;
  taxId: string;
  manager: string;
  memberSince: string;
}

export interface NotificationPref {
  id: string;
  /** English i18n key */
  label: string;
  /** English i18n key */
  desc: string;
  enabled: boolean;
}

export interface SecuritySettings {
  email: string;
  twoFactor: boolean;
  lastLogin: string;
  sessions: number;
}
