export const CATEGORIES = [
  'Cooked meals',
  'Rice and grains',
  'Bread and bakery',
  'Fruits and vegetables',
  'Packaged food',
  'Other',
] as const;
export type DonationCategory = (typeof CATEGORIES)[number];

export const STORAGES = ['Ambient', 'Refrigerated', 'Hot-held', 'Frozen'] as const;
export type Storage = (typeof STORAGES)[number];

export const ALLERGENS = [
  'Dairy',
  'Eggs',
  'Nuts',
  'Gluten',
  'Soy',
  'Shellfish',
  'Sesame',
  'None known',
] as const;
export type Allergen = (typeof ALLERGENS)[number];

/** Rescue-level statuses (also the four donation pipeline steps). */
export type RescueStatus = 'POSTED' | 'CLAIMED' | 'COLLECTED' | 'DELIVERED';
/** Donation-level derived status (adds EXPIRED and CANCELLED). */
export type DerivedStatus = RescueStatus | 'EXPIRED' | 'CANCELLED';

export interface PickupLocation {
  area: string;
  label: string;
  lat: number;
  lng: number;
}

export interface Donor {
  id: string;
  name: string;
  kind: 'Caterer' | 'Restaurant' | 'Hostel' | 'Canteen';
}

export interface Receiver {
  id: string;
  name: string;
  kind: string;
  capacity: number;
  /** Stated need level 1-5. */
  need: number;
  hasVehicle: boolean;
  coldStorage: boolean;
  accepts: DonationCategory[];
  /** Categories this receiver has open requests for. */
  openRequests: DonationCategory[];
  lat: number;
  lng: number;
}

export interface Volunteer {
  id: string;
  name: string;
  vehicle: 'bike' | 'car' | 'cycle' | 'none';
  completed: number;
}

export interface Donation {
  id: string;
  foodName: string;
  category: DonationCategory;
  portionsTotal: number;
  portionsRemaining: number;
  description: string;
  preparedAt: string;
  readyAt: string;
  deadlineAt: string;
  storage: Storage;
  allergens: Allergen[];
  location: PickupLocation;
  donorId: string;
  notes: string;
  cancelled: boolean;
  createdAt: string;
  createdBy: 'seed' | 'me';
}

export interface TimelineEntry {
  status: RescueStatus;
  at: string;
  text: string;
}

export interface Rescue {
  id: string;
  donationId: string;
  receiverId: string;
  portions: number;
  status: RescueStatus;
  volunteerId?: string;
  collectedBy: 'ngo' | 'volunteer';
  timeline: TimelineEntry[];
  createdAt: string;
}

export interface Notification {
  id: string;
  kind: 'claim' | 'status' | 'donation';
  text: string;
  at: string;
  read: boolean;
}

export interface Profile {
  name: string;
  role: 'Donor' | 'Receiving NGO' | 'Volunteer';
  area: string;
}

export interface Settings {
  notifyClaims: boolean;
  notifyStatus: boolean;
  notifyDonations: boolean;
}

export interface AppState {
  donations: Donation[];
  rescues: Rescue[];
  notifications: Notification[];
  profile: Profile;
  settings: Settings;
}
