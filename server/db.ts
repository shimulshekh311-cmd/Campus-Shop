import fs from 'fs';
import path from 'path';
import {
  Campus,
  User,
  Store,
  Product,
  Order,
  Review,
  RoleApplication,
  AuditLog,
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'campusshop_db.json');

export const CAMPUSES: Campus[] = [
  {
    id: 'dhaka-college',
    nameBn: 'ঢাকা কলেজ',
    nameEn: 'Dhaka College',
    shortCode: 'DC',
    locationBn: 'মিরপুর রোড, ধানমন্ডি, ঢাকা',
    locationEn: 'Mirpur Road, Dhanmondi, Dhaka',
    color: '#0D5C3A',
    pickupPoints: [
      {
        id: 'dc-main-gate',
        campusId: 'dhaka-college',
        nameBn: 'কলেজের প্রধান ফটক বুথ (Main Gate Booth)',
        nameEn: 'Main Entrance Gate Booth',
        landmark: 'মিরপুর রোডের মূল প্রবেশদ্বার নিরাপত্তা বুথ',
        timeAdvice: 'সকাল ১০টা - বিকাল ৫টা',
      },
      {
        id: 'dc-library',
        campusId: 'dhaka-college',
        nameBn: 'কেন্দ্রীয় লাইব্রেরি চত্বর বুথ',
        nameEn: 'Central Library Lawn Booth',
        landmark: 'লাইব্রেরি ভবনের সামনের মুক্তমঞ্চ',
        timeAdvice: 'ক্লাস বিরতির সময় (দুপুর ১২টা - ২টা)',
      },
    ],
  },
  {
    id: 'eden-college',
    nameBn: 'ইডেন মহিলা কলেজ',
    nameEn: 'Eden Mohila College',
    shortCode: 'EMC',
    locationBn: 'আজিমপুর, লালবাগ, ঢাকা',
    locationEn: 'Azimpur, Lalbagh, Dhaka',
    color: '#047857',
    pickupPoints: [
      {
        id: 'eden-gate-2',
        campusId: 'eden-college',
        nameBn: '২ নম্বর গেট স্টুডেন্ট ডেলিভারি বুথ',
        nameEn: 'Gate No. 2 Student Booth',
        landmark: 'আজিমপুর রোডের প্রবেশ ফটক',
        timeAdvice: 'সকাল ৯টা - বিকাল ৪টা',
      },
      {
        id: 'eden-canteen',
        campusId: 'eden-college',
        nameBn: 'কেন্দ্রীয় ছাত্রী ক্যান্টিন পিকআপ পয়েন্ট',
        nameEn: 'Student Canteen Front',
        landmark: 'ক্যান্টিনের প্রবেশমুখ',
        timeAdvice: 'সকাল ১১টা - বিকাল ৪টা',
      },
    ],
  },
  {
    id: 'titumir-college',
    nameBn: 'সরকারি তিতুমীর কলেজ',
    nameEn: 'Govt. Titumir College',
    shortCode: 'GTC',
    locationBn: 'মহাখালী, ঢাকা',
    locationEn: 'Mohakhali, Dhaka',
    color: '#0F766E',
    pickupPoints: [
      {
        id: 'titumir-shaheed-minar',
        campusId: 'titumir-college',
        nameBn: 'কলেজ শহীদ মিনার পিকআপ বুথ',
        nameEn: 'Shaheed Minar Pickup Point',
        landmark: 'মূল ক্যাম্পাসের শহীদ মিনার প্রাঙ্গণ',
        timeAdvice: 'সকাল ১০টা - বিকাল ৫টা',
      },
    ],
  },
  {
    id: 'kabi-nazrul-college',
    nameBn: 'কবি নজরুল সরকারি কলেজ',
    nameEn: 'Kabi Nazrul Govt. College',
    shortCode: 'KNGC',
    locationBn: 'লক্ষ্মীবাজার, পুরান ঢাকা',
    locationEn: 'Laxmibazar, Old Dhaka',
    color: '#065F46',
    pickupPoints: [
      {
        id: 'kabi-nazrul-main-gate',
        campusId: 'kabi-nazrul-college',
        nameBn: 'কলেজ মূল ফটক বুথ',
        nameEn: 'Main Entrance Gate Booth',
        landmark: 'লক্ষ্মীবাজার রোডের প্রধান তোরণ',
        timeAdvice: 'সকাল ৯টা - বিকাল ৫টা',
      },
    ],
  },
  {
    id: 'suhrawardy-college',
    nameBn: 'সরকারি শহীদ সোহরাওয়ার্দী কলেজ',
    nameEn: 'Govt. Shaheed Suhrawardy College',
    shortCode: 'GSSC',
    locationBn: 'লক্ষ্মীবাজার, পুরান ঢাকা',
    locationEn: 'Laxmibazar, Old Dhaka',
    color: '#047857',
    pickupPoints: [
      {
        id: 'suhrawardy-main-gate',
        campusId: 'suhrawardy-college',
        nameBn: 'কলেজ প্রধান গেট পিকআপ বুথ',
        nameEn: 'Main Gate Booth',
        landmark: 'ভিক্টোরিয়া পার্ক সংলগ্ন প্রবেশদ্বার',
        timeAdvice: 'সকাল ১০টা - বিকাল ৪টা',
      },
    ],
  },
  {
    id: 'badrunnesa-college',
    nameBn: 'বেগম বদরুন্নেসা সরকারি মহিলা কলেজ',
    nameEn: 'Begum Badrunnesa Govt. Girls College',
    shortCode: 'BBGGC',
    locationBn: 'বকশীবাজার, ঢাকা',
    locationEn: 'Bakshibazar, Dhaka',
    color: '#0F766E',
    pickupPoints: [
      {
        id: 'badrunnesa-gate',
        campusId: 'badrunnesa-college',
        nameBn: 'মূল ফটক বুথ (বকশীবাজার মোড়)',
        nameEn: 'Main Gate Booth (Bakshibazar)',
        landmark: 'প্রধান প্রবেশ গেটের নিরাপত্তা বুথ',
        timeAdvice: 'সকাল ৯টা - বিকাল ৪টা',
      },
    ],
  },
  {
    id: 'bangla-college',
    nameBn: 'সরকারি বাঙলা কলেজ',
    nameEn: 'Govt. Bangla College, Mirpur',
    shortCode: 'GBC',
    locationBn: 'মিরপুর-১, ঢাকা',
    locationEn: 'Mirpur-1, Dhaka',
    color: '#15803D',
    pickupPoints: [
      {
        id: 'bangla-main-gate',
        campusId: 'bangla-college',
        nameBn: 'মিরপুর রোড প্রধান ফটক বুথ',
        nameEn: 'Mirpur Road Main Entrance Booth',
        landmark: 'মিরপুর রোডের সাথে সংযুক্ত মূল তোরণ',
        timeAdvice: 'সকাল ৯টা - বিকাল ৫টা',
      },
    ],
  },
];

export interface DatabaseState {
  users: User[];
  stores: Store[];
  products: Product[];
  orders: Order[];
  favorites: Record<string, string[]>;
  reviews: Review[];
  roleApplications: RoleApplication[];
  auditLogs: AuditLog[];
}

export function getInitialDatabaseState(): DatabaseState {
  return {
    users: [],
    stores: [],
    products: [],
    orders: [],
    favorites: {},
    reviews: [],
    roleApplications: [],
    auditLogs: [],
  };
}

let dbCache: DatabaseState | null = null;

const TMP_DIR = path.resolve('/tmp', 'campusshop-data');
const TMP_DB_FILE = path.join(TMP_DIR, 'campusshop_db.json');

export function getDb(): DatabaseState {
  if (dbCache) return dbCache;

  // 1. Try reading from primary DATA_DIR
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(content);
      if (loaded && Array.isArray(loaded.users) && Array.isArray(loaded.products)) {
        dbCache = loaded;
        return dbCache!;
      }
    }
  } catch {
    // Ignore read error
  }

  // 2. Try reading from serverless /tmp directory
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const content = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      const loaded = JSON.parse(content);
      if (loaded && Array.isArray(loaded.users) && Array.isArray(loaded.products)) {
        dbCache = loaded;
        return dbCache!;
      }
    }
  } catch {
    // Ignore read error
  }

  // 3. Fall back to clean initial production state
  dbCache = getInitialDatabaseState();
  saveDb(dbCache);
  return dbCache;
}

export function saveDb(state: DatabaseState): void {
  dbCache = state;

  // Attempt to save to DATA_DIR (works in standard Node.js server)
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    return;
  } catch {
    // File system may be read-only (e.g. Vercel Serverless environment)
  }

  // Fallback to /tmp which is writable in serverless environments
  try {
    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR, { recursive: true });
    }
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch {
    // Keep in-memory cache
  }
}
