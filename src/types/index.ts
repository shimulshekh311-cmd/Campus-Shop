export type CampusId =
  | 'dhaka-college'
  | 'eden-college'
  | 'titumir-college'
  | 'kabi-nazrul-college'
  | 'suhrawardy-college'
  | 'badrunnesa-college'
  | 'bangla-college';

export interface PickupPoint {
  id: string;
  campusId: CampusId;
  nameBn: string;
  nameEn: string;
  landmark: string;
  timeAdvice: string;
}

export interface Campus {
  id: CampusId;
  nameBn: string;
  nameEn: string;
  shortCode: string;
  locationBn: string;
  locationEn: string;
  pickupPoints: PickupPoint[];
  color: string;
}

export type UserRole =
  | 'buyer'
  | 'seller'
  | 'pickup_staff'
  | 'delivery_man'
  | 'factory_staff'
  | 'admin';

export type AccountApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  approvalStatus: AccountApprovalStatus;
  campusId: CampusId;
  studentId?: string;
  department?: string;
  avatarUrl?: string;
  storeId?: string;
  assignedPickupPointId?: string;
  factoryName?: string;
  linkedAccountIds?: string[];
  createdAt: string;
}

export type ProductCategory =
  | 'books'
  | 'notes'
  | 'stationery'
  | 'clothing'
  | 'bags'
  | 'electronics'
  | 'hostel'
  | 'digital';

export type ProductCondition = 'new' | 'like_new' | 'used_good' | 'used_fair';

export interface DigitalAssetInfo {
  pageCount: number;
  previewExcerptBn: string;
  fileFormat: string;
  fileSizeMb: number;
  downloadAccessUrl: string;
}

export interface Product {
  id: string;
  storeId: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  campusId: CampusId;
  title: string;
  titleEn?: string;
  description: string;
  category: ProductCategory;
  condition: ProductCondition;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  images: string[];
  isNegotiable: boolean;
  isAvailable: boolean;
  viewsCount: number;
  pickupPointIds: string[];
  department?: string;
  createdAt: string;
  rating?: number;
  reviewCount?: number;
  
  // Factory Direct specifications
  isFactoryManufactured?: boolean;
  factoryName?: string;
  factoryLocation?: string;
  designOptions?: string[];
  
  // Digital Product specifications
  isDigital?: boolean;
  digitalInfo?: DigitalAssetInfo;
}

export interface Store {
  id: string;
  userId?: string;
  ownerId?: string;
  ownerName?: string;
  storeName?: string;
  name?: string;
  bio?: string;
  campusId: CampusId;
  status?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  rating?: number;
  totalSales?: number;
  createdAt: string;
}

export type PaymentMethod = 'cash_on_pickup' | 'bkash' | 'nagad';
export type PaymentStatus = 'unpaid' | 'pending_verification' | 'verified';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'in_production'        // Factory preparing design & quality check
  | 'sealed_at_factory'     // Non-removable seal applied at factory
  | 'in_runner_custody'     // Delivery runner in transit via public transport (half-pass)
  | 'received_at_booth'     // Pickup point staff received and verified custody
  | 'ready_for_pickup'      // Ready for student cash collection
  | 'completed'             // Student paid cash & collected
  | 'cancelled';

export type CustodyHolder = 'factory' | 'delivery_runner' | 'pickup_staff' | 'buyer';

export interface OrderSealInfo {
  sealNumber: string;         // e.g. SEAL-DCU-9842
  sealedAt: string;
  factoryInspector: string;
  itemDescription: string;
  priceToCollect: number;
  destinationCampusBn: string;
  destinationBoothBn: string;
}

export interface CustodyTransferEvent {
  fromHolder: CustodyHolder;
  toHolder: CustodyHolder;
  actorName: string;
  actorRole: UserRole;
  timestamp: string;
  transferCode: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
  storeId: string;
  isDigital?: boolean;
  selectedDesign?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerCampusId: CampusId;
  sellerId: string;
  sellerName: string;
  storeId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  senderPhone?: string;
  campusId: CampusId;
  pickupPointId: string;
  pickupPointName: string;
  preferredDateTime: string;
  notes?: string;
  status: OrderStatus;
  
  // Custody tracking & accountability
  currentCustody: CustodyHolder;
  sealInfo?: OrderSealInfo;
  custodyHistory: CustodyTransferEvent[];
  
  deliveryManId?: string;
  deliveryManName?: string;
  pickupStaffId?: string;
  pickupStaffName?: string;
  handoverOtp?: string; // 4-digit code shown to buyer for verification at booth
  
  isDigitalOrder?: boolean;
  digitalAccessGranted?: boolean;
  
  createdAt: string;
  completedAt?: string;
  hasReviewed?: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RoleApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  requestedRole: UserRole;
  status: AccountApprovalStatus;
  campusId: CampusId;
  studentId?: string;
  department?: string;
  pickupPointId?: string;
  details?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}
