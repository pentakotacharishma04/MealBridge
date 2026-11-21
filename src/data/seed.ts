import { CATEGORIES, type AppState, type Donation, type Donor, type Notification, type PickupLocation, type Receiver, type Rescue, type Volunteer } from '../lib/types';
import { todayAt } from '../lib/time';

/* All names, places and people below are FICTIONAL. Coordinates are approximate
 * points in the Hyderabad pilot area for demo distance maths only. */

export const DONORS: Donor[] = [
  { id: 'd-saffron', name: 'Saffron Spread Caterers', kind: 'Caterer' },
  { id: 'd-lakeview', name: 'Lakeview Hostel Mess', kind: 'Hostel' },
  { id: 'd-techpark', name: 'Tech Park Canteen Co.', kind: 'Canteen' },
  { id: 'd-golden', name: 'Golden Thali Restaurant', kind: 'Restaurant' },
  { id: 'd-starlight', name: 'Starlight Banquet Hall', kind: 'Caterer' },
  { id: 'd-campus', name: 'Campus Hostel Block C Mess', kind: 'Hostel' },
];

export const RECEIVERS: Receiver[] = [
  {
    id: 'rcv-hope',
    name: 'Hope Kitchen Trust',
    kind: 'Community kitchen',
    capacity: 40,
    need: 5,
    hasVehicle: true,
    coldStorage: true,
    accepts: CATEGORIES.filter((c) => c !== 'Other'),
    openRequests: ['Cooked meals', 'Rice and grains'],
    lat: 17.4065,
    lng: 78.4772,
  },
  {
    id: 'rcv-madhapur',
    name: 'Community Kitchen Madhapur',
    kind: 'Community kitchen',
    capacity: 60,
    need: 4,
    hasVehicle: true,
    coldStorage: true,
    accepts: [...CATEGORIES],
    openRequests: ['Packaged food'],
    lat: 17.4486,
    lng: 78.3908,
  },
  {
    id: 'rcv-sunrise',
    name: 'Sunrise Shelter NGO',
    kind: 'Shelter NGO',
    capacity: 25,
    need: 3,
    hasVehicle: false,
    coldStorage: false,
    accepts: ['Cooked meals', 'Bread and bakery'],
    openRequests: ['Bread and bakery'],
    lat: 17.4239,
    lng: 78.4738,
  },
  {
    id: 'rcv-anna',
    name: 'Anna Seva Collective',
    kind: 'Volunteer NGO',
    capacity: 30,
    need: 4,
    hasVehicle: false,
    coldStorage: false,
    accepts: ['Cooked meals', 'Rice and grains', 'Packaged food'],
    openRequests: ['Rice and grains'],
    lat: 17.4375,
    lng: 78.4482,
  },
  {
    id: 'rcv-ward12',
    name: 'Ward 12 Night Shelter',
    kind: 'Night shelter',
    capacity: 20,
    need: 5,
    hasVehicle: false,
    coldStorage: false,
    accepts: ['Cooked meals', 'Bread and bakery'],
    openRequests: ['Cooked meals'],
    lat: 17.412,
    lng: 78.409,
  },
];

export const VOLUNTEERS: Volunteer[] = [
  { id: 'vol-ravi', name: 'Ravi Teja', vehicle: 'bike', completed: 0 },
  { id: 'vol-sneha', name: 'Sneha Reddy', vehicle: 'car', completed: 0 },
  { id: 'vol-arjun', name: 'Arjun Mehta', vehicle: 'cycle', completed: 0 },
  { id: 'vol-kavya', name: 'Kavya Nair', vehicle: 'bike', completed: 0 },
  { id: 'vol-imran', name: 'Imran Ali', vehicle: 'none', completed: 0 },
  { id: 'vol-divya', name: 'Divya Rao', vehicle: 'car', completed: 0 },
];

export const LOCATIONS: PickupLocation[] = [
  { area: 'Banjara Hills', label: 'Banjara Hills Community Hall', lat: 17.4156, lng: 78.4347 },
  { area: 'Gachibowli', label: 'Gachibowli Tech Park Canteen Block', lat: 17.4401, lng: 78.3489 },
  { area: 'Madhapur', label: 'Madhapur Event Lawn', lat: 17.4483, lng: 78.3915 },
  { area: 'Hitech City', label: 'Hitech City Convention Yard', lat: 17.4435, lng: 78.3772 },
  { area: 'Jubilee Hills', label: 'Jubilee Hills Hostel Gate', lat: 17.4326, lng: 78.4071 },
  { area: 'Kondapur', label: 'Kondapur Community Pavilion', lat: 17.4619, lng: 78.3649 },
];

const MIN = 60000;
const DAY = 24 * 60 * MIN;

/**
 * Builds the demo dataset relative to `now`: active donations with varied deadlines,
 * the "Event buffet" scenario, 3 active pickups and ~14 delivered rescues over 8 weeks.
 */
export function buildSeedState(now: number = Date.now()): AppState {
  const at = (offsetMin: number) => new Date(now + offsetMin * MIN).toISOString();
  const eventDeadline = todayAt(21, 30, now);
  const iso = (ms: number) => new Date(ms).toISOString();

  const donations: Donation[] = [];
  const rescues: Rescue[] = [];
  const mk = (
    id: string,
    foodName: string,
    category: Donation['category'],
    total: number,
    remaining: number,
    deadline: number,
    readyMin: number,
    prepMin: number,
    storage: Donation['storage'],
    allergens: Donation['allergens'],
    loc: number,
    donorId: string,
    description: string,
  ): Donation => ({
    id,
    foodName,
    category,
    portionsTotal: total,
    portionsRemaining: remaining,
    description,
    preparedAt: iso(deadline - prepMin * MIN),
    readyAt: iso(deadline - readyMin * MIN),
    deadlineAt: iso(deadline),
    storage,
    allergens,
    location: LOCATIONS[loc],
    donorId,
    notes: '',
    cancelled: false,
    createdAt: at(prepMin * -1),
    createdBy: 'seed',
  });

  // Scenario donation: 40 boxes, ready 45 min before the 9:30 PM deadline, POSTED.
  donations.push(
    mk('don-event-buffet', 'Event buffet — 40 meal boxes', 'Cooked meals', 40, 40, eventDeadline, 45, 165, 'Hot-held', ['Dairy', 'Gluten'], 2, 'd-saffron', 'Mixed vegetarian and chicken meal boxes left over from a wedding lunch. Sealed and kept hot.'),
  );
  donations.push(mk('don-biryani', 'Veg biryani trays', 'Cooked meals', 30, 30, now + 45 * MIN, -30, 120, 'Hot-held', ['Dairy'], 0, 'd-golden', 'Two trays of vegetable biryani with raita.'));
  donations.push(mk('don-idli', 'Surplus idli and sambar', 'Cooked meals', 50, 20, now + 75 * MIN, -60, 150, 'Hot-held', ['Gluten'], 4, 'd-lakeview', 'Breakfast surplus from hostel mess.'));
  donations.push(mk('don-bread', 'Day-old bread loaves', 'Bread and bakery', 25, 25, now + 90 * MIN, -200, 300, 'Ambient', ['Gluten', 'Eggs'], 1, 'd-techpark', 'Unsliced loaves, sealed in bags.'));
  donations.push(mk('don-rice', 'Steamed rice and dal packs', 'Rice and grains', 60, 40, now + 180 * MIN, -90, 200, 'Ambient', ['None known'], 5, 'd-campus', 'Individually packed rice and dal packs.'));
  donations.push(mk('don-fruit', 'Fresh fruit crates', 'Fruits and vegetables', 20, 20, now + 240 * MIN, -60, 120, 'Refrigerated', ['None known'], 3, 'd-starlight', 'Bananas and apples, washed.'));
  donations.push(mk('don-snacks', 'Packaged snack boxes', 'Packaged food', 35, 25, now + 300 * MIN, -300, 400, 'Ambient', ['Nuts', 'Gluten'], 2, 'd-starlight', 'Sealed packaged snacks from a banquet.'));
  donations.push(mk('don-paneer', 'Paneer curry and roti', 'Cooked meals', 18, 18, now + 120 * MIN, -40, 90, 'Refrigerated', ['Dairy'], 0, 'd-golden', 'Refrigerated curry, reheat before serving.'));
  donations.push(mk('don-sandwich', 'Lunch sandwiches', 'Other', 12, 12, now - 30 * MIN, -200, 240, 'Refrigerated', ['Eggs', 'Gluten'], 1, 'd-techpark', 'Unsold lunch sandwiches. Past pickup window.'));
  donations.push(mk('don-laddoo', 'Sesame laddoo box', 'Other', 15, 15, now + 200 * MIN, -30, 60, 'Ambient', ['Sesame', 'Nuts'], 5, 'd-saffron', 'Sweets box from a puja event.'));

  // Active pickups (3).
  rescues.push({
    id: 'res-active-1', donationId: 'don-rice', receiverId: 'rcv-anna', portions: 20, status: 'CLAIMED', collectedBy: 'volunteer', createdAt: at(-25),
    timeline: [{ status: 'CLAIMED', at: at(-25), text: 'Claimed 20 portions by Anna Seva Collective' }],
  });
  rescues.push({
    id: 'res-active-2', donationId: 'don-idli', receiverId: 'rcv-hope', portions: 30, status: 'COLLECTED', volunteerId: 'vol-ravi', collectedBy: 'volunteer', createdAt: at(-90),
    timeline: [
      { status: 'CLAIMED', at: at(-90), text: 'Claimed 30 portions by Hope Kitchen Trust' },
      { status: 'CLAIMED', at: at(-80), text: 'Pickup accepted by Ravi Teja' },
      { status: 'COLLECTED', at: at(-30), text: 'Food collected from hostel mess' },
    ],
  });
  rescues.push({
    id: 'res-active-3', donationId: 'don-snacks', receiverId: 'rcv-madhapur', portions: 10, status: 'CLAIMED', volunteerId: 'vol-sneha', collectedBy: 'volunteer', createdAt: at(-60),
    timeline: [
      { status: 'CLAIMED', at: at(-60), text: 'Claimed 10 portions by Community Kitchen Madhapur' },
      { status: 'CLAIMED', at: at(-45), text: 'Pickup accepted by Sneha Reddy' },
    ],
  });

  // ~14 delivered rescues across the past 8 weeks, each with its own closed donation.
  const volunteerCounts: Record<string, number> = {};
  for (let i = 0; i < 14; i++) {
    const created = now - (1 + i * 4) * DAY - (i % 3) * 3 * 60 * MIN;
    const portions = 12 + ((i * 13) % 30);
    const cat = CATEGORIES[i % 6];
    const donorId = DONORS[i % 6].id;
    const receiver = RECEIVERS[i % 5];
    const volunteer = VOLUNTEERS[i % 6];
    const loc = LOCATIONS[i % 6];
    volunteerCounts[volunteer.id] = (volunteerCounts[volunteer.id] ?? 0) + 1;
    donations.push({
      id: `don-past-${i}`,
      foodName: `Surplus ${cat.toLowerCase()} batch`,
      category: cat,
      portionsTotal: portions,
      portionsRemaining: 0,
      description: 'Past rescue (seeded history).',
      preparedAt: iso(created - 60 * MIN),
      readyAt: iso(created - 30 * MIN),
      deadlineAt: iso(created + 3 * 60 * MIN),
      storage: 'Ambient',
      allergens: ['None known'],
      location: loc,
      donorId,
      notes: '',
      cancelled: false,
      createdAt: iso(created - 60 * MIN),
      createdBy: 'seed',
    });
    rescues.push({
      id: `res-past-${i}`,
      donationId: `don-past-${i}`,
      receiverId: receiver.id,
      portions,
      status: 'DELIVERED',
      volunteerId: volunteer.id,
      collectedBy: 'volunteer',
      createdAt: iso(created),
      timeline: [
        { status: 'CLAIMED', at: iso(created), text: `Claimed ${portions} portions by ${receiver.name}` },
        { status: 'COLLECTED', at: iso(created + 60 * MIN), text: `Collected by ${volunteer.name}` },
        { status: 'DELIVERED', at: iso(created + 120 * MIN), text: `Delivered to ${receiver.name}` },
      ],
    });
  }
  VOLUNTEERS.forEach((v) => {
    v.completed = volunteerCounts[v.id] ?? 0;
  });

  const notifications: Notification[] = [
    { id: 'n-1', kind: 'donation', text: 'Saffron Spread Caterers posted "Event buffet — 40 meal boxes"', at: at(-20), read: false },
    { id: 'n-2', kind: 'status', text: 'Ravi Teja accepted a pickup of idli and sambar', at: at(-80), read: false },
    { id: 'n-3', kind: 'claim', text: 'Anna Seva Collective claimed 20 portions of steamed rice and dal', at: at(-25), read: true },
  ];

  return {
    donations,
    rescues,
    notifications,
    profile: { name: 'Meera Iyer', role: 'Donor', area: 'Banjara Hills' },
    settings: { notifyClaims: true, notifyStatus: true, notifyDonations: true },
  };
}
