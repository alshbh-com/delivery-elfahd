
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
