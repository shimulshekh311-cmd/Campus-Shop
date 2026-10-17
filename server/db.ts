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
        id: 'nazrul-main-gate',
        campusId: 'kabi-nazrul-college',
        nameBn: 'কলেজ প্রধান প্রবেশদ্বার বুথ',
        nameEn: 'Main Entrance Gate Booth',
        landmark: 'লক্ষ্মীবাজারের মূল রাস্তার গেট',
        timeAdvice: 'সকাল ১০টা - বিকাল ৪টা',
      },
    ],
  },
  {
    id: 'suhrawardy-college',
    nameBn: 'সরকারি শহীদ সোহরাওয়ার্দী কলেজ',
    nameEn: 'Govt. Shaheed Suhrawardy College',
    shortCode: 'GSSC',
    locationBn: 'লক্ষ্মীবাজার, পুরান ঢাকা',
    locationEn: 'Laxmibazar, Old Dhaka',
    color: '#166534',
    pickupPoints: [
      {
        id: 'suhrawardy-gate',
        campusId: 'suhrawardy-college',
        nameBn: 'প্রধান প্রশাসনিক গেট বুথ',
        nameEn: 'Main Administrative Gate Booth',
        landmark: 'প্রশাসনিক ভবনের গেট',
        timeAdvice: 'সকাল ১০টা - বিকাল ৫টা',
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
    color: '#115E59',
    pickupPoints: [
      {
        id: 'badrunnesa-main-gate',
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

function getInitialDatabaseState(): DatabaseState {
  return {
    users: [
      {
        id: 'user-buyer-1',
        name: 'রাফিকুল ইসলাম',
        email: 'rafiqul@student.dcu.edu.bd',
        phone: '01711223344',
        role: 'buyer',
        approvalStatus: 'approved',
        campusId: 'dhaka-college',
        studentId: 'DC-2023-ENG-402',
        department: 'ইংরেজি বিভাগ (৩য় বর্ষ)',
        linkedAccountIds: ['user-seller-rafiqul'],
        createdAt: '2026-02-10T10:00:00Z',
      },
      {
        id: 'user-seller-1',
        name: 'তানজিনা আক্তার',
        email: 'tanzina@student.dcu.edu.bd',
        phone: '01822334455',
        role: 'seller',
        approvalStatus: 'approved',
        campusId: 'eden-college',
        studentId: 'EMC-2022-ECO-109',
        department: 'অর্থনীতি বিভাগ (৪র্থ বর্ষ)',
        storeId: 'store-eden-books',
        linkedAccountIds: ['user-buyer-tanzina'],
        createdAt: '2026-01-15T09:30:00Z',
      },
      {
        id: 'user-buyer-tanzina',
        name: 'তানজিনা আক্তার (বায়ার প্রোফাইল)',
        email: 'tanzina@student.dcu.edu.bd',
        phone: '01822334455',
        role: 'buyer',
        approvalStatus: 'approved',
        campusId: 'eden-college',
        studentId: 'EMC-2022-ECO-109',
        department: 'অর্থনীতি বিভাগ (৪র্থ বর্ষ)',
        linkedAccountIds: ['user-seller-1'],
        createdAt: '2026-01-15T09:30:00Z',
      },
      {
        id: 'user-pickup-1',
        name: 'মেহেদী হাসান (পিকআপ পয়েন্ট কর্মী)',
        email: 'mehedi.pickup@dcu.edu.bd',
        phone: '01611223388',
        role: 'pickup_staff',
        approvalStatus: 'approved',
        campusId: 'dhaka-college',
        assignedPickupPointId: 'dc-main-gate',
        department: 'ঢাকা কলেজ প্রধান ফটক বুথ ইনচার্জ',
        createdAt: '2026-01-25T10:00:00Z',
      },
      {
        id: 'user-delivery-1',
        name: 'সাব্বির আহমেদ (দৈনিক পাবলিক পরিবহন রানার)',
        email: 'sabbir.runner@dcu.edu.bd',
        phone: '01799887766',
        role: 'delivery_man',
        approvalStatus: 'approved',
        campusId: 'dhaka-college',
        studentId: 'DC-2022-HIST-310',
        department: '৭ ক্যাম্পাস দৈনিক বাস/মেট্রো হাফ-পাস ডেলিভারি নেটওয়ার্ক',
        createdAt: '2026-02-01T08:00:00Z',
      },
      {
        id: 'user-factory-1',
        name: 'ফয়সাল কবীর (ডিরেক্ট ফ্যাক্টরি ইনচার্জ)',
        email: 'foysal.factory@dcu.edu.bd',
        phone: '01911447722',
        role: 'factory_staff',
        approvalStatus: 'approved',
        campusId: 'titumir-college',
        factoryName: 'মিরপুর নিটওয়্যার ও সেন্ট্রাল অ্যাপারেল ফ্যাক্টরি ইউনিট',
        department: 'পোশাক, ব্যাগ ও মার্চেন্ডাইজ উৎপাদন শাখা',
        createdAt: '2026-01-10T09:00:00Z',
      },
      {
        id: 'user-admin-1',
        name: 'ড. মোজাম্মেল হক (কেন্দ্রীয় অ্যাডমিন)',
        email: 'admin@campusshop.dcu.edu.bd',
        phone: '01511223300',
        role: 'admin',
        approvalStatus: 'approved',
        campusId: 'dhaka-college',
        studentId: 'ADMIN-DCU-01',
        department: 'কেন্দ্রীয় মনিটরিং ও প্রক্টরিয়াল টিম',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    stores: [
      {
        id: 'store-direct-apparel-factory',
        userId: 'user-factory-1',
        ownerName: 'ফয়সাল কবীর',
        storeName: 'সেন্ট্রাল ডিরেক্ট ফ্যাক্টরি হাব (Apparel & Bags)',
        bio: 'সরাসরি নিটওয়্যার ও গার্মেন্টস ফ্যাক্টরি থেকে সাশ্রয়ী মূল্যে শিক্ষার্থী পোশাক ও ওয়াটারপ্রুফ ক্যাম্পাস ব্যাকপ্যাক।',
        campusId: 'titumir-college',
        status: 'approved',
        rating: 4.9,
        totalSales: 142,
        createdAt: '2026-01-10T10:00:00Z',
      },
      {
        id: 'store-eden-books',
        userId: 'user-seller-1',
        ownerName: 'তানজিনা আক্তার',
        storeName: 'ইডেন বুক নেস্ট (Eden Book Nest)',
        bio: 'অনার্স মূল বই ও ডিজিটাল হ্যান্ডনোট সংগ্রহ।',
        campusId: 'eden-college',
        status: 'approved',
        rating: 4.9,
        totalSales: 47,
        createdAt: '2026-01-16T10:00:00Z',
      },
    ],
    products: [
      // 1. Factory Apparel - Direct from Factory
      {
        id: 'prod-hoodie-factory',
        storeId: 'store-direct-apparel-factory',
        sellerId: 'user-factory-1',
        sellerName: 'সেন্ট্রাল নিটওয়্যার ফ্যাক্টরি',
        sellerPhone: '01911447722',
        campusId: 'dhaka-college',
        title: 'ফ্যাক্টরি-ডিরেক্ট প্রিমিয়াম ক্যাম্পাস উইন্টার হুডি (৩টি এক্সক্লুসিভ ডিজাইন)',
        titleEn: 'Factory-Direct Premium Campus Winter Hoodie',
        description:
          'সরাসরি ফ্যাক্টরি থেকে প্রস্তুতকৃত ৩৫০ জিএসএম হেভি কটন ফ্লিচ ফেব্রিক। মধ্যস্বত্বভোগী ছাড়া শিক্ষার্থীদের জন্য সর্বনিম্ন মূল্যে সরবরাহ। ফ্যাক্টরি থেকে নন-রিমুভাল সিকিউরিটি সিল সহ সরাসরি ক্যাম্পাস পিকআপ বুথে পাঠানো হয়।',
        category: 'clothing',
        condition: 'new',
        price: 580,
        originalPrice: 950,
        stockQuantity: 45,
        images: ['/images/campus_varsity_hoodie_1792159209809.jpg'],
        isNegotiable: false,
        isAvailable: true,
        viewsCount: 420,
        pickupPointIds: ['dc-main-gate', 'eden-gate-2', 'titumir-shaheed-minar', 'bangla-main-gate'],
        department: 'সরাসরি ফ্যাক্টরি পোশাক',
        isFactoryManufactured: true,
        factoryName: 'মিরপুর নিটওয়্যার ও সেন্ট্রাল অ্যাপারেল ফ্যাক্টরি',
        factoryLocation: 'মিরপুর-২ গার্মেন্টস জোন',
        designOptions: ['এমারেল্ড গ্রিন এমব্রয়ডারি', 'রয়্যাল গোল্ডেন স্ট্রাইপ', 'ক্লাসিক ব্ল্যাক মিনিমালিস্ট'],
        rating: 5.0,
        reviewCount: 38,
        createdAt: '2026-02-10T10:00:00Z',
      },
      // 2. Factory Bags - Direct from Factory
      {
        id: 'prod-backpack-factory',
        storeId: 'store-direct-apparel-factory',
        sellerId: 'user-factory-1',
        sellerName: 'পুরান ঢাকা লেদার ও ব্যাগ ওয়ার্কশপ',
        sellerPhone: '01911447722',
        campusId: 'kabi-nazrul-college',
        title: 'হেভি-ডিউটি ওয়াটারপ্রুফ ক্যাম্পাস ব্যাকপ্যাক (১৫.৬" ল্যাপটপ স্লট সহ)',
        titleEn: 'Heavy-Duty Waterproof Campus Laptop Backpack',
        description:
          'সরাসরি ব্যাগ প্রস্তুতকারক ফ্যাক্টরি থেকে তৈরি। ১০০০ডি ওয়াটার-রেজিস্ট্যান্ট কর্ডুরা ফেব্রিক, একাধিক জিপার চেম্বার ও প্যাডেড কাঁধের স্ট্র্যাপ। লাইব্রেরি ও প্রতিদিনের ক্লাস যাতায়াতের জন্য আদর্শ।',
        category: 'bags',
        condition: 'new',
        price: 490,
        originalPrice: 850,
        stockQuantity: 30,
        images: ['/images/campus_varsity_hoodie_1792159209809.jpg'],
        isNegotiable: false,
        isAvailable: true,
        viewsCount: 280,
        pickupPointIds: ['dc-main-gate', 'nazrul-main-gate', 'suhrawardy-gate'],
        department: 'ফ্যাক্টরি ব্যাগ ও গিয়ার',
        isFactoryManufactured: true,
        factoryName: 'পুরান ঢাকা ব্যাগ ও লাগেজ ওয়ার্কশপ',
        factoryLocation: 'লালবাগ ইন্ডাস্ট্রিয়াল বেল্ট',
        designOptions: ['নেভি ব্লু আর্টিকা', 'ম্যাট ব্ল্যাক স্টেলথ', 'আর্মি অলিভ গ্রিন'],
        rating: 4.9,
        reviewCount: 21,
        createdAt: '2026-02-18T11:00:00Z',
      },
      // 3. Digital Product with Interactive Preview
      {
        id: 'prod-digital-bcs-note',
        storeId: 'store-eden-books',
        sellerId: 'user-seller-1',
        sellerName: 'তানজিনা আক্তার',
        sellerPhone: '01822334455',
        campusId: 'eden-college',
        title: '৪৭তম বিসিএস ও সরকারি চাকরি প্রস্তুতি - আন্তর্জাতিক বিষয়াবলী হ্যান্ডনোট (ডিজিটাল পিডিএফ)',
        titleEn: 'BCS 47th Preparation - International Affairs Master Handnote (PDF)',
        description:
          'বিসিএস ক্যাডার সিনিয়রদের তৈরি হ্যান্ডনোট। বিগত ১০ বছরের প্রশ্ন এনালাইসিস, সমসাময়িক ভূ-রাজনীতি এবং মানচিত্র নির্ভর সংক্ষিপ্ত নোট। কেনার পূর্বে নিচের ফ্রি প্রিভিউ পড়ে দেখতে পারেন। বিকাশ/নগদে পেমেন্ট করার সাথে সাথে তাৎক্ষণিক সম্পূর্ণ পিডিএফ আনলক ও ডাউনলোড হবে।',
        category: 'digital',
        condition: 'new',
        price: 120,
        originalPrice: 250,
        stockQuantity: 999,
        images: ['/images/academic_textbooks_1792159211354.jpg'],
        isNegotiable: false,
        isAvailable: true,
        viewsCount: 540,
        pickupPointIds: [],
        department: 'বিসিএস ও ডিজিটাল স্টাডি',
        isDigital: true,
        digitalInfo: {
          pageCount: 148,
          fileFormat: 'PDF High-Res',
          fileSizeMb: 14.5,
          downloadAccessUrl: 'https://campusshop.dcu.edu.bd/vault/bcs-international-notes.pdf',
          previewExcerptBn: `[ফ্রি স্যাম্পল প্রিভিউ - অধ্যায় ০১: সমসাময়িক আন্তর্জাতিক ভূ-রাজনীতি]
১. ইন্দো-প্যাসিফিক ইকোনমিক ফ্রেমওয়ার্ক (IPEF) এবং দক্ষিণ এশিয়ায় এর কৌশলগত প্রভাব:
  - ভৌগোলিক অবস্থান ও বঙ্গোপসাগরের কৌশলগত গুরুত্ব।
  - ব্লু ইকোনমি (Blue Economy) নীতিমালায় বাংলাদেশের অগ্রাধিকার খাতসমূহ: গভীর সমুদ্র মৎস্য আহরণ ও সামুদ্রিক বন্দর সংযোগ।
২. বৈশ্বিক বাণিজ্য জোট ও মুদ্রা বিনিময় ব্যবস্থা:
  - ডি-ডলারাইজেশন (De-dollarization) প্রক্রিয়া এবং ব্রিকস (BRICS) মুদ্রা বাস্কেটের বর্তমান বাস্তবায়ন।
  - এশিয়ান ক্লিয়ারিং ইউনিয়ন (ACU) পেমেন্ট মেকানিজম এবং কেন্দ্রীয় ব্যাংকের রিজার্ভ ব্যবস্থাপনা।
[সম্পূর্ণ ১৪৮ পৃষ্ঠার প্রিমিয়াম চার্ট, মানচিত্র ও অধ্যায়ভিত্তিক মডেল টেস্ট পেতে বিকাশ বা নগদ পেমেন্ট করুন]`,
        },
        rating: 5.0,
        reviewCount: 42,
        createdAt: '2026-02-25T14:30:00Z',
      },
      // 4. Physical Books - Secondhand
      {
        id: 'prod-books-combo',
        storeId: 'store-eden-books',
        sellerId: 'user-seller-1',
        sellerName: 'তানজিনা আক্তার',
        sellerPhone: '01822334455',
        campusId: 'eden-college',
        title: 'অনার্স ৩য় বর্ষের মাইক্রোইকোনমিক্স ও ম্যাক্রোইকোনমিক্স কম্বো সেট',
        titleEn: 'Economics 3rd Year Textbook & Guide Combo',
        description:
          'অনার্স ৩য় বর্ষের অর্থনীতি বিভাগের মূল দুটি টেক্সটবুক। নতুনের মতো ফ্রেশ কন্ডিশন। ক্যাম্পাসের বুথে হাতে হাতে ক্যাশ অন পিকআপে সংগ্রহ করুন।',
        category: 'books',
        condition: 'like_new',
        price: 380,
        originalPrice: 650,
        stockQuantity: 3,
        images: ['/images/academic_textbooks_1792159211354.jpg'],
        isNegotiable: true,
        isAvailable: true,
        viewsCount: 142,
        pickupPointIds: ['eden-gate-2', 'dc-main-gate'],
        department: 'অর্থনীতি বিভাগ',
        rating: 4.9,
        reviewCount: 12,
        createdAt: '2026-02-15T10:00:00Z',
      },
      // 5. Factory Jersey
      {
        id: 'prod-jersey-factory',
        storeId: 'store-direct-apparel-factory',
        sellerId: 'user-factory-1',
        sellerName: 'সেন্ট্রাল নিটওয়্যার ফ্যাক্টরি',
        sellerPhone: '01911447722',
        campusId: 'dhaka-college',
        title: 'ঢাকা কলেজ প্রিমিয়াম স্পোর্টস জার্সি - এমারেল্ড গ্রিন (ফ্যাক্টরি তৈরি)',
        titleEn: 'Dhaka College Sports Edition Jersey',
        description:
          'সরাসরি ফ্যাক্টরি আউটপুট। ব্রিদেবল ড্রাই-ফিট ফ্যাব্রিক, ডিপ গ্রিন ও গোল্ডেন স্ট্রাইপ। নন-রিমুভাল ফ্যাক্টরি সিল সহ ক্যাম্পাসের বুথে হস্তান্তর করা হবে।',
        category: 'clothing',
        condition: 'new',
        price: 320,
        originalPrice: 450,
        stockQuantity: 20,
        images: ['/images/campus_varsity_hoodie_1792159209809.jpg'],
        isNegotiable: false,
        isAvailable: true,
        viewsCount: 260,
        pickupPointIds: ['dc-main-gate', 'titumir-shaheed-minar'],
        department: 'স্পোর্টস মার্চেন্ডাইজ',
        isFactoryManufactured: true,
        factoryName: 'মিরপুর নিটওয়্যার ফ্যাক্টরি',
        designOptions: ['হোম জার্সি (গ্রিন)', 'অ্যাওয়ে জার্সি (হোয়াইট ও গোল্ড)'],
        rating: 4.9,
        reviewCount: 14,
        createdAt: '2026-03-08T11:20:00Z',
      },
    ],
    orders: [
      // Order 1: In Runner Custody via Public Transit
      {
        id: 'CS-2026-891',
        buyerId: 'user-buyer-1',
        buyerName: 'রাফিকুল ইসলাম',
        buyerPhone: '01711223344',
        buyerCampusId: 'dhaka-college',
        sellerId: 'user-factory-1',
        sellerName: 'সেন্ট্রাল নিটওয়্যার ফ্যাক্টরি',
        storeId: 'store-direct-apparel-factory',
        items: [
          {
            productId: 'prod-hoodie-factory',
            productTitle: 'ফ্যাক্টরি-ডিরেক্ট প্রিমিয়াম ক্যাম্পাস উইন্টার হুডি (এমারেল্ড গ্রিন এমব্রয়ডারি)',
            unitPrice: 580,
            quantity: 1,
            imageUrl: '/images/campus_varsity_hoodie_1792159209809.jpg',
            storeId: 'store-direct-apparel-factory',
            selectedDesign: 'এমারেল্ড গ্রিন এমব্রয়ডারি',
          },
        ],
        totalAmount: 580,
        paymentMethod: 'cash_on_pickup',
        paymentStatus: 'unpaid',
        campusId: 'dhaka-college',
        pickupPointId: 'dc-main-gate',
        pickupPointName: 'কলেজের প্রধান ফটক বুথ (Main Gate Booth)',
        preferredDateTime: 'আজ দুপুর ২:০০',
        notes: 'ক্লাস শেষে গেটের বুথ থেকে ক্যাশে বুঝে নেব।',
        status: 'in_runner_custody',
        currentCustody: 'delivery_runner',
        sealInfo: {
          sealNumber: 'SEAL-DCU-8921',
          sealedAt: '2026-03-14T08:30:00Z',
          factoryInspector: 'ফয়সাল কবীর (মিরপুর ফ্যাক্টরি)',
          itemDescription: 'ক্যাম্পাস হুডি (সাইজ: L, গ্রিন এমব্রয়ডারি)',
          priceToCollect: 580,
          destinationCampusBn: 'ঢাকা কলেজ',
          destinationBoothBn: 'প্রধান ফটক বুথ',
        },
        custodyHistory: [
          {
            fromHolder: 'factory',
            toHolder: 'delivery_runner',
            actorName: 'সাব্বির আহমেদ (রানার)',
            actorRole: 'delivery_man',
            timestamp: '2026-03-14T09:15:00Z',
            transferCode: 'XFER-FAC-01',
            notes: 'ফ্যাক্টরি থেকে সিলযুক্ত পার্সেল গ্রহণ করে দৈনিক বাসে ট্রানজিট শুরু।',
          },
        ],
        deliveryManId: 'user-delivery-1',
        deliveryManName: 'সাব্বির আহমেদ (রানার)',
        handoverOtp: '3942',
        createdAt: '2026-03-13T16:00:00Z',
      },
      // Order 2: Received at Campus Booth, Waiting for Student Cash Collection
      {
        id: 'CS-2026-874',
        buyerId: 'user-buyer-1',
        buyerName: 'রাফিকুল ইসলাম',
        buyerPhone: '01711223344',
        buyerCampusId: 'dhaka-college',
        sellerId: 'user-factory-1',
        sellerName: 'পুরান ঢাকা লেদার ও ব্যাগ ওয়ার্কশপ',
        storeId: 'store-direct-apparel-factory',
        items: [
          {
            productId: 'prod-backpack-factory',
            productTitle: 'হেভি-ডিউটি ওয়াটারপ্রুফ ক্যাম্পাস ব্যাকপ্যাক (ম্যাট ব্ল্যাক)',
            unitPrice: 490,
            quantity: 1,
            imageUrl: '/images/campus_varsity_hoodie_1792159209809.jpg',
            storeId: 'store-direct-apparel-factory',
            selectedDesign: 'ম্যাট ব্ল্যাক স্টেলথ',
          },
        ],
        totalAmount: 490,
        paymentMethod: 'cash_on_pickup',
        paymentStatus: 'unpaid',
        campusId: 'dhaka-college',
        pickupPointId: 'dc-main-gate',
        pickupPointName: 'কলেজের প্রধান ফটক বুথ (Main Gate Booth)',
        preferredDateTime: 'আজ দুপুর ১:৩০',
        status: 'ready_for_pickup',
        currentCustody: 'pickup_staff',
        sealInfo: {
          sealNumber: 'SEAL-DCU-8740',
          sealedAt: '2026-03-13T11:00:00Z',
          factoryInspector: 'ফয়সাল কবীর',
          itemDescription: 'ল্যাপটপ ব্যাকপ্যাক (ম্যাট ব্ল্যাক)',
          priceToCollect: 490,
          destinationCampusBn: 'ঢাকা কলেজ',
          destinationBoothBn: 'প্রধান ফটক বুথ',
        },
        custodyHistory: [
          {
            fromHolder: 'factory',
            toHolder: 'delivery_runner',
            actorName: 'সাব্বির আহমেদ (রানার)',
            actorRole: 'delivery_man',
            timestamp: '2026-03-13T13:00:00Z',
            transferCode: 'XFER-FAC-02',
            notes: 'পাবলিক বাস হাফ-পাস রুটে ট্রানজিট সম্পন্ন।',
          },
          {
            fromHolder: 'delivery_runner',
            toHolder: 'pickup_staff',
            actorName: 'মেহেদী হাসান (বুথ কর্মী)',
            actorRole: 'pickup_staff',
            timestamp: '2026-03-13T15:20:00Z',
            transferCode: 'XFER-DC-01',
            notes: 'ঢাকা কলেজ বুথে অক্ষত অবস্থায় সিলযুক্ত পার্সেল গ্রহণ করা হয়েছে।',
          },
        ],
        deliveryManId: 'user-delivery-1',
        deliveryManName: 'সাব্বির আহমেদ',
        pickupStaffId: 'user-pickup-1',
        pickupStaffName: 'মেহেদী হাসান',
        handoverOtp: '5128',
        createdAt: '2026-03-12T10:00:00Z',
      },
      // Order 3: Instant Digital Note Access
      {
        id: 'CS-2026-850',
        buyerId: 'user-buyer-1',
        buyerName: 'রাফিকুল ইসলাম',
        buyerPhone: '01711223344',
        buyerCampusId: 'dhaka-college',
        sellerId: 'user-seller-1',
        sellerName: 'তানজিনা আক্তার',
        storeId: 'store-eden-books',
        items: [
          {
            productId: 'prod-digital-bcs-note',
            productTitle: '৪৭তম বিসিএস আন্তর্জাতিক বিষয়াবলী মাস্টার হ্যান্ডনোট (ডিজিটাল পিডিএফ)',
            unitPrice: 120,
            quantity: 1,
            imageUrl: '/images/academic_textbooks_1792159211354.jpg',
            storeId: 'store-eden-books',
            isDigital: true,
          },
        ],
        totalAmount: 120,
        paymentMethod: 'bkash',
        paymentStatus: 'verified',
        transactionId: 'BK9A441P09',
        senderPhone: '01711223344',
        campusId: 'dhaka-college',
        pickupPointId: 'digital-download',
        pickupPointName: 'অনলাইন ইনস্ট্যান্ট ডিজিটাল এক্সেস',
        preferredDateTime: 'তাৎক্ষণিক আনলক',
        status: 'completed',
        currentCustody: 'buyer',
        isDigitalOrder: true,
        digitalAccessGranted: true,
        custodyHistory: [],
        createdAt: '2026-03-11T12:00:00Z',
        completedAt: '2026-03-11T12:02:00Z',
      },
    ],
    favorites: {
      'user-buyer-1': ['prod-hoodie-factory', 'prod-digital-bcs-note'],
    },
    reviews: [
      {
        id: 'rev-1',
        orderId: 'CS-2026-850',
        productId: 'prod-digital-bcs-note',
        buyerId: 'user-buyer-1',
        buyerName: 'রাফিকুল ইসলাম',
        sellerId: 'user-seller-1',
        rating: 5,
        comment: 'বিকাশে পেমেন্ট করার সাথে সাথেই পুরো পিডিএফ ফাইল আনলক হয়ে গিয়েছে! নোটের হ্যান্ডরাইটিং ও ম্যাপ প্রেজেন্টেশন খুবই গোছানো।',
        createdAt: '2026-03-11T13:00:00Z',
      },
    ],
    roleApplications: [
      {
        id: 'app-1',
        userId: 'user-pending-1',
        userName: 'জাহিদ হাসান',
        userEmail: 'zahid@student.dcu.edu.bd',
        userPhone: '01755667788',
        requestedRole: 'seller',
        status: 'pending',
        campusId: 'titumir-college',
        studentId: 'GTC-2023-BBA-104',
        department: 'ব্যবসায় শিক্ষা অনুষদ',
        details: 'পুরাতন বই ও সেমিস্টার সাজেশন বিক্রির জন্য বিক্রেতা একাউন্ট খুলতে চাই।',
        createdAt: '2026-03-13T12:00:00Z',
      },
    ],
    auditLogs: [
      {
        id: 'log-1',
        actorId: 'user-admin-1',
        actorName: 'ড. মোজাম্মেল হক',
        actorRole: 'admin',
        action: 'FACTORY_PARTNER_APPROVED',
        details: 'Approved direct apparel and bag factory partner for Dhaka Central University.',
        timestamp: '2026-01-10T10:05:00Z',
      },
    ],
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
      if (loaded && loaded.roleApplications && loaded.users && loaded.products) {
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
      if (loaded && loaded.roleApplications && loaded.users && loaded.products) {
        dbCache = loaded;
        return dbCache!;
      }
    }
  } catch {
    // Ignore read error
  }

  // 3. Fall back to initial seed data
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
