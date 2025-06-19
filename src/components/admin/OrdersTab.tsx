
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, CheckCircle, Clock, Users, Package, User } from 'lucide-react';
import { Order, Worker } from '@/types';

interface OrdersTabProps {
  orders: Order[];
  workers: Worker[];
  onDeleteOrder: (id: string) => void;
  loading: boolean;
}

const OrdersTab = ({ orders, workers, onDeleteOrder, loading }: OrdersTabProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 ml-1" />في الانتظار</Badge>;
      case 'assigned':
        return <Badge variant="default"><Users className="w-3 h-3 ml-1" />تم التعيين</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-700"><CheckCircle className="w-3 h-3 ml-1" />مكتمل</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getWorkerName = (workerId?: string) => {
    if (!workerId) return 'غير محدد';
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'عامل محذوف';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري تحميل الطلبات...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right flex items-center gap-2">
          <Package className="w-5 h-5" />
          إدارة الطلبات ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد طلبات حالياً</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    {getStatusBadge(order.status)}
                    <Button
                      onClick={() => onDeleteOrder(order.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <h3 className="font-semibold text-lg">{order.customerName}</h3>
                    <p className="text-sm text-gray-600">{formatDate(order.timestamp)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
                  <div>
                    <p className="text-sm text-gray-600">الهاتف:</p>
                    <p className="font-medium">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">العنوان:</p>
                    <p className="font-medium">{order.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">العامل المسؤول:</p>
                    <div className="flex items-center gap-2 justify-end">
                      <User className="w-4 h-4 text-blue-500" />
                      <p className="font-medium text-blue-600">{getWorkerName(order.assignedWorker)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-right">
                  <p className="text-sm text-gray-600">تفاصيل الطلب:</p>
                  <p className="font-medium">{order.orderDetails}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersTab;
