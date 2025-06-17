
import { Order, Worker } from '@/types';

const ORDERS_KEY = 'delivery_orders';
const WORKERS_KEY = 'delivery_workers';
const ADMIN_PASSWORD = '01278006248';
const ADMIN_WHATSAPP = '201024713976';

// بيانات العمال الافتراضية
const defaultWorkers: Worker[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    whatsappNumber: '201234567890',
    status: 'active',
    ordersCount: 0
  },
  {
    id: '2',
    name: 'محمد علي',
    whatsappNumber: '201234567891',
    status: 'active',
    ordersCount: 0
  },
  {
    id: '3',
    name: 'علي حسن',
    whatsappNumber: '201234567892',
    status: 'active',
    ordersCount: 0
  }
];

class DataService {
  // إدارة الطلبات
  getOrders(): Order[] {
    const orders = localStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
  }

  saveOrder(order: Order): void {
    const orders = this.getOrders();
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  deleteOrder(orderId: string): void {
    const orders = this.getOrders();
    const filteredOrders = orders.filter(order => order.id !== orderId);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(filteredOrders));
  }

  // إدارة العمال
  getWorkers(): Worker[] {
    const workers = localStorage.getItem(WORKERS_KEY);
    if (!workers) {
      this.initializeWorkers();
      return defaultWorkers;
    }
    return JSON.parse(workers);
  }

  initializeWorkers(): void {
    localStorage.setItem(WORKERS_KEY, JSON.stringify(defaultWorkers));
  }

  saveWorkers(workers: Worker[]): void {
    localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
  }

  addWorker(worker: Omit<Worker, 'id' | 'ordersCount'>): void {
    const workers = this.getWorkers();
    const newWorker: Worker = {
      ...worker,
      id: Date.now().toString(),
      ordersCount: 0
    };
    workers.push(newWorker);
    this.saveWorkers(workers);
  }

  updateWorkerStatus(workerId: string, status: 'active' | 'inactive'): void {
    const workers = this.getWorkers();
    const workerIndex = workers.findIndex(w => w.id === workerId);
    if (workerIndex !== -1) {
      workers[workerIndex].status = status;
      this.saveWorkers(workers);
    }
  }

  // نظام التوزيع العادل
  getNextAvailableWorker(): Worker | null {
    const workers = this.getWorkers().filter(w => w.status === 'active');
    if (workers.length === 0) return null;

    // ترتيب العمال حسب عدد الطلبات ثم وقت آخر طلب
    workers.sort((a, b) => {
      if (a.ordersCount !== b.ordersCount) {
        return a.ordersCount - b.ordersCount;
      }
      if (!a.lastOrderTime && !b.lastOrderTime) return 0;
      if (!a.lastOrderTime) return -1;
      if (!b.lastOrderTime) return 1;
      return new Date(a.lastOrderTime).getTime() - new Date(b.lastOrderTime).getTime();
    });

    return workers[0];
  }

  assignOrderToWorker(workerId: string): void {
    const workers = this.getWorkers();
    const workerIndex = workers.findIndex(w => w.id === workerId);
    if (workerIndex !== -1) {
      workers[workerIndex].ordersCount += 1;
      workers[workerIndex].lastOrderTime = new Date().toISOString();
      this.saveWorkers(workers);
    }
  }

  // إرسال واتساب
  sendWhatsAppMessage(phoneNumber: string, message: string): void {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  // التحقق من كلمة مرور الإدارة
  verifyAdminPassword(password: string): boolean {
    return password === ADMIN_PASSWORD;
  }

  getAdminWhatsApp(): string {
    return ADMIN_WHATSAPP;
  }
}

export const dataService = new DataService();
