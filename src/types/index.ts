
export interface Order {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  orderDetails: string;
  timestamp: string;
  assignedWorker?: string;
  status: 'pending' | 'assigned' | 'completed';
}

export interface Worker {
  id: string;
  name: string;
  whatsappNumber: string;
  status: 'active' | 'inactive';
  lastOrderTime?: string;
  ordersCount: number;
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  discount_percentage?: number;
  original_price?: number;
  offer_price?: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
