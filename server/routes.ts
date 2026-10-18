import fs from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';
import {
  CAMPUSES,
  getDb,
  saveDb,
} from './db.ts';
import {
  Product,
  Order,
  Store,
  User,
  Review,
  AuditLog,
  CampusId,
  OrderStatus,
  UserRole,
  RoleApplication,
} from '../src/types/index.ts';

export const apiRouter = Router();

// Campuses
apiRouter.get('/campuses', (_req: Request, res: Response) => {
  res.json({ success: true, campuses: CAMPUSES });
});

// Auth Routes
apiRouter.get('/auth/admin-status', (_req: Request, res: Response) => {
  const db = getDb();
  const adminUser = db.users.find((u) => u.role === 'admin');
  res.json({
    success: true,
    hasAdmin: !!adminUser,
    adminName: adminUser ? adminUser.name : null,
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.json({ success: false, user: null, message: 'No active session' });
  }
  const db = getDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.json({ success: false, user: null, message: 'User not found' });
  }

  const linkedAccounts = db.users.filter(
    (u) =>
      u.id !== user.id &&
      ((user.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
        (user.phone && u.phone === user.phone) ||
        user.linkedAccountIds?.includes(u.id))
  );

  res.json({ success: true, user, linkedAccounts });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { credential, email, phone, password } = req.body;
  const db = getDb();

  const searchVal = (credential || email || phone || '').toString().trim().toLowerCase();
  if (!searchVal) {
    return res.status(400).json({
      success: false,
      message: 'ইমেইল অথবা মোবাইল নম্বর প্রদান করুন।',
    });
  }

  const user = db.users.find(
    (u) =>
      (u.email && u.email.toLowerCase() === searchVal) ||
      (u.phone && u.phone.trim() === searchVal)
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'এই ইমেইল বা ফোন নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে আগে রেজিস্ট্রেশন করুন।',
    });
  }

  // If password is provided and user has a password set
  if (user.password && password) {
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'পাসওয়ার্ড সঠিক নয়। দয়া করে সঠিক পাসওয়ার্ড দিন।',
      });
    }
  }

  if (user.approvalStatus === 'pending') {
    return res.status(403).json({
      success: false,
      message: 'আপনার অ্যাকাউন্টটি পর্যালোচনায় রয়েছে। অ্যাডমিন অনুমোদনের পর লগইন করতে পারবেন।',
    });
  }

  if (user.approvalStatus === 'rejected') {
    return res.status(403).json({
      success: false,
      message: 'আপনার অ্যাকাউন্টটি অনুমোদিত হয়নি।',
    });
  }

  res.json({ success: true, user });
});

apiRouter.post('/auth/switch-account', (req: Request, res: Response) => {
  const { targetUserId } = req.body;
  const db = getDb();
  const user = db.users.find((u) => u.id === targetUserId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'অ্যাকাউন্টটি পাওয়া যায়নি' });
  }

  if (user.approvalStatus !== 'approved' && user.role !== 'buyer') {
    return res.status(403).json({
      success: false,
      message: 'এই অ্যাকাউন্টটি এখনো অ্যাডমিন কর্তৃক অনুমোদিত হয়নি।',
    });
  }

  res.json({ success: true, user });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const {
    name,
    email,
    phone,
    password,
    campusId,
    department,
    studentId,
    role,
    pickupPointId,
    factoryName,
    storeName,
    details,
  } = req.body;

  if (!name?.trim() || !email?.trim() || !phone?.trim() || !campusId) {
    return res.status(400).json({ success: false, message: 'সব প্রয়োজনীয় তথ্য (নাম, ইমেইল, মোবাইল ও ক্যাম্পাস) পূরণ করুন।' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();
  const cleanPassword = (password || '').trim();

  const db = getDb();

  // Check if email or phone already registered
  const existingUser = db.users.find(
    (u) =>
      u.email.toLowerCase() === cleanEmail ||
      u.phone === cleanPhone
  );
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'এই ইমেইল বা ফোন নম্বরে ইতিমধ্যে একটি অ্যাকাউন্ট আছে। অনুগ্রহ করে লগইন করুন।',
    });
  }

  const requestedRole = (role as UserRole) || 'buyer';

  // SINGLE ADMIN RULE: Only ONE account can be admin!
  if (requestedRole === 'admin') {
    const existingAdmin = db.users.find((u) => u.role === 'admin');
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'সিস্টেমে ইতিমধ্যে ১টি অ্যাডমিন অ্যাকাউন্ট নিবন্ধিত আছে। বাস্তব প্রোডাকশনে শুধুমাত্র ১টি অ্যাডমিন অ্যাকাউন্ট থাকতে পারবে।',
      });
    }
  }

  // Auto-approve buyer and first admin. Sellers and Staff can be approved or pending
  const isAutoApproved = requestedRole === 'admin' || requestedRole === 'buyer' || requestedRole === 'seller';

  const newUserId = `user-${requestedRole}-${Date.now()}`;
  let storeId: string | undefined = undefined;

  if (requestedRole === 'seller') {
    storeId = `store-${newUserId}`;
    const newStore: Store = {
      id: storeId,
      userId: newUserId,
      ownerName: name.trim(),
      storeName: storeName?.trim() || `${name.trim()} এর ক্যাম্পাস স্টোর`,
      bio: 'ঢাকা সেন্ট্রাল ইউনিভার্সিটি শিক্ষার্থী বিক্রেতা হাব।',
      campusId: campusId as CampusId,
      status: 'approved',
      rating: 5.0,
      totalSales: 0,
      createdAt: new Date().toISOString(),
    };
    db.stores.push(newStore);
  }

  const newUser: User = {
    id: newUserId,
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password: cleanPassword || undefined,
    campusId: campusId as CampusId,
    department: department?.trim() || (requestedRole === 'admin' ? 'কেন্দ্রীয় মনিটরিং ও অ্যাডমিন সেল' : 'সাধারণ শিক্ষার্থী'),
    studentId: studentId?.trim() || (requestedRole === 'admin' ? 'ADMIN-DCU-01' : `ID-${Math.floor(1000 + Math.random() * 9000)}`),
    role: requestedRole,
    approvalStatus: isAutoApproved ? 'approved' : 'pending',
    storeId,
    assignedPickupPointId: pickupPointId || undefined,
    factoryName: factoryName || undefined,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  if (!isAutoApproved) {
    const newApp: RoleApplication = {
      id: `app-${Date.now()}`,
      userId: newUser.id,
      userName: newUser.name,
      userEmail: newUser.email,
      userPhone: newUser.phone,
      requestedRole,
      status: 'pending',
      campusId: newUser.campusId,
      studentId: newUser.studentId,
      department: newUser.department,
      pickupPointId,
      details: details || `${requestedRole} অ্যাকাউন্টের জন্য আবেদন জমা হয়েছে।`,
      createdAt: new Date().toISOString(),
    };
    db.roleApplications.unshift(newApp);

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      action: 'ROLE_APPLICATION_SUBMITTED',
      details: `Application for ${requestedRole} role pending admin approval.`,
      timestamp: new Date().toISOString(),
    });
  } else {
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      action: requestedRole === 'admin' ? 'FIRST_ADMIN_REGISTERED' : 'USER_REGISTERED',
      details: requestedRole === 'admin'
        ? `প্রথম ও একমাত্র সুপার অ্যাডমিন অ্যাকাউন্ট নিবন্ধিত হয়েছে (${newUser.name})।`
        : `নতুন অ্যাকাউন্ট নিবন্ধিত হয়েছে (${newUser.name}, ${requestedRole})।`,
      timestamp: new Date().toISOString(),
    });
  }

  saveDb(db);
  res.json({
    success: true,
    user: newUser,
    isPendingApproval: !isAutoApproved,
    message: isAutoApproved
      ? (requestedRole === 'admin'
          ? 'সুপার অ্যাডমিন অ্যাকাউন্ট সফলভাবে নিবন্ধিত হয়েছে!'
          : 'অ্যাকাউন্ট সফলভাবে নিবন্ধিত ও সক্রিয় হয়েছে!')
      : 'আপনার আবেদন জমা নেওয়া হয়েছে! অ্যাডমিন অনুমোদন দেওয়ার পর এই অ্যাকাউন্ট সক্রিয় হবে।',
  });
});

// Products Routes
apiRouter.get('/products', (req: Request, res: Response) => {
  const db = getDb();
  let results = [...db.products];

  const { campusId, category, condition, search, minPrice, maxPrice, storeId, sellerId } =
    req.query;

  if (campusId && campusId !== 'all') {
    results = results.filter((p) => p.campusId === campusId);
  }

  if (category && category !== 'all') {
    results = results.filter((p) => p.category === category);
  }

  if (condition && condition !== 'all') {
    results = results.filter((p) => p.condition === condition);
  }

  if (storeId) {
    results = results.filter((p) => p.storeId === storeId);
  }

  if (sellerId) {
    results = results.filter((p) => p.sellerId === sellerId);
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.titleEn && p.titleEn.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q) ||
        (p.department && p.department.toLowerCase().includes(q)) ||
        (p.factoryName && p.factoryName.toLowerCase().includes(q)) ||
        p.sellerName.toLowerCase().includes(q)
    );
  }

  if (minPrice) {
    const min = Number(minPrice);
    if (!isNaN(min)) results = results.filter((p) => p.price >= min);
  }

  if (maxPrice) {
    const max = Number(maxPrice);
    if (!isNaN(max)) results = results.filter((p) => p.price <= max);
  }

  res.json({ success: true, products: results, total: results.length });
});

// Orders & Checkout Routes
apiRouter.get('/orders', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
  const db = getDb();
  const user = db.users.find((u) => u.id === userId);

  if (!user || user.role === 'admin') {
    return res.json({ success: true, orders: db.orders });
  }

  if (user.role === 'seller') {
    const sellerOrders = db.orders.filter(
      (o) => o.sellerId === user.id || o.buyerId === user.id
    );
    return res.json({ success: true, orders: sellerOrders });
  }

  if (user.role === 'pickup_staff') {
    const pickupOrders = db.orders.filter(
      (o) =>
        o.pickupPointId === user.assignedPickupPointId ||
        o.campusId === user.campusId
    );
    return res.json({ success: true, orders: pickupOrders });
  }

  if (user.role === 'delivery_man') {
    // Delivery runners see physical orders that need campus transit
    const transitOrders = db.orders.filter((o) => !o.isDigitalOrder);
    return res.json({ success: true, orders: transitOrders });
  }

  if (user.role === 'factory_staff') {
    // Factory staff see apparel, bag and manufacturing batch orders
    const factoryOrders = db.orders.filter(
      (o) =>
        !o.isDigitalOrder &&
        o.items.some((it) => {
          const prod = db.products.find((p) => p.id === it.productId);
          return prod?.isFactoryManufactured || prod?.sellerId === user.id;
        })
    );
    return res.json({ success: true, orders: factoryOrders });
  }

  // Buyer orders
  const buyerOrders = db.orders.filter((o) => o.buyerId === user.id);
  res.json({ success: true, orders: buyerOrders });
});

// Checkout with strict business rules:
// 1. Must be buyer role.
// 2. Physical items: STRICTLY cash on pickup.
// 3. Digital items: bKash / Nagad with instant unlock.
apiRouter.post('/orders/checkout', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || req.body.buyerId;
  const db = getDb();
  const activeUser = db.users.find((u) => u.id === userId);

  if (!activeUser) {
    return res.status(401).json({ success: false, message: 'লগইন করে চেকআউট সম্পন্ন করুন' });
  }

  if (activeUser.role !== 'buyer') {
    const linkedBuyer = db.users.find(
      (u) =>
        u.role === 'buyer' &&
        ((activeUser.email && u.email.toLowerCase() === activeUser.email.toLowerCase()) ||
          (activeUser.phone && u.phone === activeUser.phone) ||
          activeUser.linkedAccountIds?.includes(u.id))
    );

    return res.status(403).json({
      success: false,
      requireBuyerAccount: true,
      existingBuyerAccount: linkedBuyer || null,
      message:
        'কোনো বিক্রেতা বা স্টাফ একাউন্ট থেকে সরাসরি পণ্য কেনা যাবে না। পণ্য কিনতে বায়ার একাউন্টে সুইচ বা রেজিস্ট্রেশন করুন।',
    });
  }

  const {
    items,
    paymentMethod,
    transactionId,
    senderPhone,
    campusId,
    pickupPointId,
    pickupPointName,
    preferredDateTime,
    notes,
    buyerPhone,
    selectedDesign,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'কার্ট খালি, কোনো পণ্য নির্বাচন করা হয়নি' });
  }

  let computedTotal = 0;
  const verifiedItems = [];
  let sellerId = '';
  let sellerName = '';
  let storeId = '';
  let hasPhysical = false;
  let hasDigital = false;
  let hasFactoryManufactured = false;
  let sampleItemDesc = '';

  for (const item of items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: `পণ্য পাওয়া যায়নি: ${item.productTitle || item.productId}`,
      });
    }

    if (!product.isDigital && product.stockQuantity < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `পণ্যটির পর্যাপ্ত মজুত নেই: ${product.title}`,
      });
    }

    if (product.isDigital) {
      hasDigital = true;
    } else {
      hasPhysical = true;
      product.stockQuantity -= item.quantity;
      if (product.stockQuantity === 0) product.isAvailable = false;
    }

    if (product.isFactoryManufactured) {
      hasFactoryManufactured = true;
    }

    sampleItemDesc = product.title;
    computedTotal += product.price * item.quantity;
    sellerId = product.sellerId;
    sellerName = product.sellerName;
    storeId = product.storeId;

    verifiedItems.push({
      productId: product.id,
      productTitle: product.title,
      unitPrice: product.price,
      quantity: item.quantity,
      imageUrl: product.images[0] || '',
      storeId: product.storeId,
      isDigital: Boolean(product.isDigital),
      selectedDesign: selectedDesign || (product.designOptions ? product.designOptions[0] : undefined),
    });
  }

  // Business Rule: Physical goods strictly Cash on Delivery / Pickup
  let finalPaymentMethod = paymentMethod;
  if (hasPhysical) {
    finalPaymentMethod = 'cash_on_pickup';
  } else if (hasDigital) {
    finalPaymentMethod = paymentMethod === 'nagad' ? 'nagad' : 'bkash';
  }

  const handoverOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const orderId = `CS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  // Generate factory non-removable seal information for physical factory orders
  const destinationCampusObj = CAMPUSES.find((c) => c.id === (campusId || activeUser.campusId));
  const sealNumber = `SEAL-DCU-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: Order = {
    id: orderId,
    buyerId: activeUser.id,
    buyerName: activeUser.name,
    buyerPhone: buyerPhone || activeUser.phone,
    buyerCampusId: activeUser.campusId,
    sellerId,
    sellerName,
    storeId,
    items: verifiedItems,
    totalAmount: computedTotal,
    paymentMethod: finalPaymentMethod,
    paymentStatus: hasDigital ? 'verified' : 'unpaid',
    transactionId: transactionId || (hasDigital ? `TXN-${Date.now().toString().slice(-8)}` : undefined),
    senderPhone: senderPhone || undefined,
    campusId: (campusId || activeUser.campusId) as CampusId,
    pickupPointId: hasDigital ? 'digital-instant' : pickupPointId || 'dc-main-gate',
    pickupPointName: hasDigital ? 'অনলাইন তাৎক্ষণিক ডিজিটাল এক্সেস' : pickupPointName || 'ক্যাম্পাস প্রধান ফটক বুথ',
    preferredDateTime: hasDigital ? 'তাৎক্ষণিক আনলক' : preferredDateTime || 'আগামীকাল দুপুর ১:৩০',
    notes: notes || '',
    status: hasDigital ? 'completed' : hasFactoryManufactured ? 'in_production' : 'placed',
    currentCustody: hasDigital ? 'buyer' : hasFactoryManufactured ? 'factory' : 'factory',
    sealInfo: hasPhysical
      ? {
          sealNumber,
          sealedAt: new Date().toISOString(),
          factoryInspector: 'মিরপুর সেন্ট্রাল ফ্যাক্টরি ইন্সপেকশন টিম',
          itemDescription: sampleItemDesc,
          priceToCollect: computedTotal,
          destinationCampusBn: destinationCampusObj?.nameBn || 'ঢাকা কলেজ',
          destinationBoothBn: pickupPointName || 'প্রধান ফটক বুথ',
        }
      : undefined,
    custodyHistory: [
      {
        fromHolder: 'factory',
        toHolder: hasDigital ? 'buyer' : 'factory',
        actorName: hasDigital ? activeUser.name : 'ফ্যাক্টরি প্যাকেজিং ডেস্ক',
        actorRole: hasDigital ? 'buyer' : 'factory_staff',
        timestamp: new Date().toISOString(),
        transferCode: `INIT-${orderId}`,
        notes: hasDigital
          ? 'ডিজিটাল পেমেন্ট যাচাই শেষে অবিলম্বে এক্সেস দেওয়া হয়েছে।'
          : 'ফ্যাক্টরি থেকে অর্ডার গ্রহণ ও সিলযুক্ত প্যাকেজিং শুরু।',
      },
    ],
    handoverOtp,
    isDigitalOrder: hasDigital,
    digitalAccessGranted: hasDigital,
    createdAt: new Date().toISOString(),
    completedAt: hasDigital ? new Date().toISOString() : undefined,
  };

  db.orders.unshift(newOrder);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorId: activeUser.id,
    actorName: activeUser.name,
    actorRole: 'buyer',
    action: hasDigital ? 'DIGITAL_ORDER_UNLOCKED' : 'PHYSICAL_ORDER_PLACED',
    details: `Order #${newOrder.id} placed. Physical Seal: ${sealNumber}, Total: ৳ ${computedTotal}`,
    timestamp: new Date().toISOString(),
  });

  saveDb(db);
  res.json({ success: true, order: newOrder });
});

// 1. Factory Packing & Sealing with Non-Removable Seal Slip
apiRouter.patch('/orders/:id/factory-seal', (req: Request, res: Response) => {
  const { inspectorName, sealNumber } = req.body;
  const db = getDb();
  const order = db.orders.find((o) => o.id === req.params.id);

  if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });

  order.status = 'sealed_at_factory';
  order.currentCustody = 'factory';
  if (!order.sealInfo) {
    order.sealInfo = {
      sealNumber: sealNumber || `SEAL-DCU-${Math.floor(1000 + Math.random() * 9000)}`,
      sealedAt: new Date().toISOString(),
      factoryInspector: inspectorName || 'সেন্ট্রাল ফ্যাক্টরি কোয়ালিটি ইন্সপেক্টর',
      itemDescription: order.items[0]?.productTitle || 'ক্যাম্পাস সামগ্রী',
      priceToCollect: order.totalAmount,
      destinationCampusBn: order.campusId,
      destinationBoothBn: order.pickupPointName,
    };
  }

  order.custodyHistory.push({
    fromHolder: 'factory',
    toHolder: 'factory',
    actorName: inspectorName || 'ফ্যাক্টরি ইনচার্জ',
    actorRole: 'factory_staff',
    timestamp: new Date().toISOString(),
    transferCode: `SEAL-${order.sealInfo.sealNumber}`,
    notes: 'অর্ডারে নন-রিমুভাল সিল ও তথ্য স্লিপ সংযুক্ত করে প্যাক সম্পন্ন করা হয়েছে।',
  });

  saveDb(db);
  res.json({ success: true, order });
});

// 2. Custody Transfer: Factory -> Delivery Runner (Daily Public Transit Departure)
apiRouter.patch('/orders/:id/runner-pickup', (req: Request, res: Response) => {
  const { runnerId, runnerName } = req.body;
  const db = getDb();
  const order = db.orders.find((o) => o.id === req.params.id);

  if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });

  order.status = 'in_runner_custody';
  order.currentCustody = 'delivery_runner';
  order.deliveryManId = runnerId || (req.headers['x-user-id'] as string) || '';
  order.deliveryManName = runnerName || 'ক্যাম্পাস রানার';

  order.custodyHistory.push({
    fromHolder: 'factory',
    toHolder: 'delivery_runner',
    actorName: order.deliveryManName || 'ক্যাম্পাস রানার',
    actorRole: 'delivery_man',
    timestamp: new Date().toISOString(),
    transferCode: `RUNNER-PICKUP-${order.id}`,
    notes: 'ফ্যাক্টরি থেকে সিল অক্ষত অবস্থায় বুঝে নিয়ে পাবলিক বাসে (হাফ-পাস) দৈনিক ক্যাম্পাস রুটে যাত্রা শুরু।',
  });

  saveDb(db);
  res.json({ success: true, order });
});

// 3. Custody Transfer: Delivery Runner -> Campus Pickup Point Staff (Arrival at Campus Booth)
apiRouter.patch('/orders/:id/booth-receive', (req: Request, res: Response) => {
  const { staffId, staffName } = req.body;
  const db = getDb();
  const order = db.orders.find((o) => o.id === req.params.id);

  if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });

  order.status = 'ready_for_pickup';
  order.currentCustody = 'pickup_staff';
  order.pickupStaffId = staffId || (req.headers['x-user-id'] as string) || '';
  order.pickupStaffName = staffName || 'ক্যাম্পাস বুথ কর্মী';

  order.custodyHistory.push({
    fromHolder: 'delivery_runner',
    toHolder: 'pickup_staff',
    actorName: order.pickupStaffName || 'ক্যাম্পাস বুথ কর্মী',
    actorRole: 'pickup_staff',
    timestamp: new Date().toISOString(),
    transferCode: `BOOTH-RCV-${order.id}`,
    notes: 'রানার থেকে সিলযুক্ত পার্সেল বুঝে নিয়ে ক্যাম্পাসের স্টুডেন্ট বুথে সংরক্ষণ করা হয়েছে।',
  });

  saveDb(db);
  res.json({ success: true, order });
});

// 4. Custody Transfer: Campus Pickup Booth -> Student Client (Cash Collection & Handover)
apiRouter.patch('/orders/:id/booth-handover', (req: Request, res: Response) => {
  const { staffName, otp } = req.body;
  const db = getDb();
  const order = db.orders.find((o) => o.id === req.params.id);

  if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });

  if (otp && order.handoverOtp && otp !== order.handoverOtp) {
    return res.status(400).json({ success: false, message: 'ভুল ওটিপি (OTP)! ক্রেতার সঠিক ওটিপি মিলিয়ে নিন।' });
  }

  order.status = 'completed';
  order.currentCustody = 'buyer';
  order.paymentStatus = 'verified';
  order.completedAt = new Date().toISOString();

  order.custodyHistory.push({
    fromHolder: 'pickup_staff',
    toHolder: 'buyer',
    actorName: staffName || 'বুথ কর্মী',
    actorRole: 'pickup_staff',
    timestamp: new Date().toISOString(),
    transferCode: `CLIENT-HANDOVER-${order.id}`,
    notes: `ক্যাশ অন ডেলিভারি বাবদ ৳ ${order.totalAmount} টাকা সংগ্রহ করে সিলযুক্ত পার্সেল ক্রেতাকে হস্তান্তর করা হয়েছে।`,
  });

  saveDb(db);
  res.json({ success: true, order });
});

// Generic status patch fallback
apiRouter.patch('/orders/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const db = getDb();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });

  order.status = status as OrderStatus;
  if (status === 'completed') {
    order.completedAt = new Date().toISOString();
    order.paymentStatus = 'verified';
    order.currentCustody = 'buyer';
  }
  saveDb(db);
  res.json({ success: true, order });
});

// Admin Applications Management
apiRouter.get('/admin/role-applications', (_req: Request, res: Response) => {
  const db = getDb();
  res.json({ success: true, applications: db.roleApplications });
});

apiRouter.patch('/admin/role-applications/:id', (req: Request, res: Response) => {
  const { status } = req.body;
  const db = getDb();
  const app = db.roleApplications.find((a) => a.id === req.params.id);

  if (!app) return res.status(404).json({ success: false, message: 'আবেদন পাওয়া যায়নি' });

  app.status = status;
  const user = db.users.find((u) => u.id === app.userId);
  if (user) {
    user.approvalStatus = status;
  }

  saveDb(db);
  res.json({ success: true, application: app, user });
});

// Admin Metrics
apiRouter.get('/admin/metrics', (_req: Request, res: Response) => {
  const db = getDb();
  const totalSalesAmount = db.orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  res.json({
    success: true,
    metrics: {
      totalUsers: db.users.length,
      totalOrders: db.orders.length,
      totalSalesAmount,
      pendingApplicationsCount: db.roleApplications.filter((a) => a.status === 'pending').length,
      activeProductsCount: db.products.filter((p) => p.isAvailable).length,
      campusesCovered: CAMPUSES.length,
    },
    roleApplications: db.roleApplications,
    auditLogs: db.auditLogs.slice(0, 20),
  });
});

// Favorites
apiRouter.get('/favorites', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.json({ success: true, productIds: [], products: [] });
  }
  const db = getDb();
  const favoriteIds = db.favorites[userId] || [];
  const favoriteProducts = db.products.filter((p) => favoriteIds.includes(p.id));
  res.json({ success: true, productIds: favoriteIds, products: favoriteProducts });
});

apiRouter.post('/favorites/toggle', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'পছন্দের তালিকায় রাখতে অনুগ্রহ করে লগইন করুন।' });
  }
  const { productId } = req.body;
  const db = getDb();

  if (!db.favorites[userId]) db.favorites[userId] = [];
  const idx = db.favorites[userId].indexOf(productId);
  if (idx > -1) db.favorites[userId].splice(idx, 1);
  else db.favorites[userId].push(productId);

  saveDb(db);
  res.json({ success: true, productIds: db.favorites[userId] });
});

// Reviews
apiRouter.post('/reviews', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || req.body.buyerId;
  const { orderId, productId, rating, comment } = req.body;
  const db = getDb();

  const order = db.orders.find((o) => o.id === orderId);
  const buyer = db.users.find((u) => u.id === userId);

  if (!order || !buyer) {
    return res.status(400).json({ success: false, message: 'ভ্যালিড অর্ডার পাওয়া যায়নি' });
  }

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    orderId,
    productId,
    buyerId: buyer.id,
    buyerName: buyer.name,
    sellerId: order.sellerId,
    rating: Number(rating) || 5,
    comment: comment || '',
    createdAt: new Date().toISOString(),
  };

  db.reviews.unshift(newReview);
  order.hasReviewed = true;
  saveDb(db);
  res.json({ success: true, review: newReview });
});

// Logo Settings
apiRouter.get('/settings/logo', (_req: Request, res: Response) => {
  const db = getDb() as any;
  res.json({
    success: true,
    logoUrl: db.customLogo || '/images/campus_shop_logo.jpg',
  });
});

apiRouter.post('/settings/logo', (req: Request, res: Response) => {
  const { imageData } = req.body;
  if (!imageData || typeof imageData !== 'string') {
    return res.status(400).json({ success: false, message: 'ইমেজ ডাটা পাওয়া যায়নি।' });
  }

  const db = getDb() as any;
  db.customLogo = imageData;
  saveDb(db);

  // If base64 data URL, also write to public folder for static serving
  if (imageData.startsWith('data:image/')) {
    try {
      const match = imageData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const targetDir = path.resolve(process.cwd(), 'public', 'images');
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.writeFileSync(path.join(targetDir, 'campus_shop_logo.jpg'), buffer);
        fs.writeFileSync(path.resolve(process.cwd(), 'public', 'campus_shop_logo.jpg'), buffer);

        // Also update dist if it exists
        const distDir = path.resolve(process.cwd(), 'dist', 'images');
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(path.join(distDir, 'campus_shop_logo.jpg'), buffer);
        }
        const distRootLogo = path.resolve(process.cwd(), 'dist', 'campus_shop_logo.jpg');
        if (fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
          fs.writeFileSync(distRootLogo, buffer);
        }
      }
    } catch (e) {
      console.warn('Failed to save logo to disk:', e);
    }
  }

  res.json({
    success: true,
    logoUrl: imageData,
    message: 'লোগো সফলভাবে আপডেট হয়েছে।',
  });
});
