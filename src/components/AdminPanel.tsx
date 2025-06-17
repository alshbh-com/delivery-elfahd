
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { dataService } from '@/services/dataService';
import { Order, Worker } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  ShoppingCart, 
  Trash2, 
  UserPlus, 
  Phone, 
  CheckCircle, 
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [newWorker, setNewWorker] = useState({
    name: '',
    whatsappNumber: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = () => {
    setOrders(dataService.getOrders());
    setWorkers(dataService.getWorkers());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (dataService.verifyAdminPassword(password)) {
      setIsAuthenticated(true);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحبًا بك في لوحة التحكم",
      });
    } else {
      toast({
        title: "كلمة المرور خاطئة",
        description: "يرجى إدخال كلمة المرور الصحيحة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    dataService.deleteOrder(orderId);
    loadData();
    toast({
      title: "تم حذف الطلب",
      description: "تم حذف الطلب بنجاح",
    });
  };

  const handleToggleWorkerStatus = (workerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    dataService.updateWorkerStatus(workerId, newStatus);
    loadData();
    toast({
      title: "تم تحديث حالة العامل",
      description: `تم ${newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} العامل`,
    });
  };

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name || !newWorker.whatsappNumber) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع البيانات",
        variant: "destructive",
      });
      return;
    }

    dataService.addWorker({
      name: newWorker.name,
      whatsappNumber: newWorker.whatsappNumber,
      status: 'active'
    });

    setNewWorker({ name: '', whatsappNumber: '' });
    loadData();
    toast({
      title: "تم إضافة العامل",
      description: "تم إضافة العامل الجديد بنجاح",
    });
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">في الانتظار</Badge>;
      case 'assigned':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">تم التعيين</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">مكتمل</Badge>;
      default:
        return <Badge variant="secondary">غير معروف</Badge>;
    }
  };

  const getStats = () => {
    const totalOrders = orders.length;
    const activeWorkers = workers.filter(w => w.status === 'active').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    return {
      totalOrders,
      activeWorkers,
      pendingOrders,
      completedOrders
    };
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2 justify-center">
              <Shield className="h-6 w-6" />
              لوحة تحكم الإدارة
            </CardTitle>
            <CardDescription className="text-orange-100 text-center">
              يرجى إدخال كلمة المرور للمتابعة
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-semibold">
                  كلمة المر
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  placeholder="ادخل كلمة المرور"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
              >
                دخول
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-4">
            🔧 لوحة تحكم الإدارة
          </h1>
          <p className="text-gray-600">إدارة الطلبات والعمال</p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">العمال النشطين</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeWorkers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">طلبات معلقة</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-full">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">طلبات مكتملة</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="orders" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              الطلبات
            </TabsTrigger>
            <TabsTrigger value="workers" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              العمال
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-orange-500" />
                  قائمة الطلبات
                </CardTitle>
                <CardDescription>
                  جميع الطلبات المسجلة في النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد طلبات حتى الآن</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{order.customerName}</h3>
                              <p className="text-sm text-gray-600">رقم الطلب: {order.id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getOrderStatusBadge(order.status)}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p><strong>التليفون:</strong> {order.phone}</p>
                              <p><strong>العنوان:</strong> {order.address}</p>
                            </div>
                            <div>
                              <p><strong>العامل المكلف:</strong> {order.assignedWorker || 'غير محدد'}</p>
                              <p><strong>وقت الطلب:</strong> {new Date(order.timestamp).toLocaleString('ar-EG')}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <p><strong>تفاصيل الطلب:</strong></p>
                            <p className="bg-gray-50 p-2 rounded mt-1">{order.orderDetails}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workers" className="space-y-4">
            {/* إضافة عامل جديد */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-orange-500" />
                  إضافة عامل جديد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddWorker} className="flex gap-4">
                  <Input
                    placeholder="اسم العامل"
                    value={newWorker.name}
                    onChange={(e) => setNewWorker(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1"
                  />
                  <Input
                    placeholder="رقم الواتساب"
                    value={newWorker.whatsappNumber}
                    onChange={(e) => setNewWorker(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    className="flex-1"
                  />
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                    إضافة
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* قائمة العمال */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  قائمة العمال
                </CardTitle>
                <CardDescription>
                  إدارة العمال وحالاتهم
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا يوجد عمال مسجلين</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workers.map((worker) => (
                      <Card key={worker.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{worker.name}</h3>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {worker.whatsappNumber}
                              </p>
                            </div>
                            <Badge
                              variant={worker.status === 'active' ? 'default' : 'secondary'}
                              className={worker.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {worker.status === 'active' ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <p><strong>عدد الطلبات:</strong> {worker.ordersCount}</p>
                            {worker.lastOrderTime && (
                              <p><strong>آخر طلب:</strong> {new Date(worker.lastOrderTime).toLocaleString('ar-EG')}</p>
                            )}
                          </div>

                          <Button
                            size="sm"
                            variant={worker.status === 'active' ? 'destructive' : 'default'}
                            onClick={() => handleToggleWorkerStatus(worker.id, worker.status)}
                            className="w-full mt-3"
                          >
                            {worker.status === 'active' ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                إلغاء التفعيل
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                تفعيل
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
