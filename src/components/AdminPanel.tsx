
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Users, User, Upload, Settings, BarChart3, Clock, Phone, MapPin, Package } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { Order, Worker } from '@/types';
import { toast } from 'sonner';

const AdminPanel = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    activeWorkers: 0,
  });
  
  // Add Worker Dialog States
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    whatsappNumber: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Logo states
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      // Load logo from localStorage
      const savedLogo = localStorage.getItem('site_logo');
      if (savedLogo) {
        setLogo(savedLogo);
      }
    }
  }, [isAuthenticated]);

  const loadData = () => {
    const ordersData = dataService.getOrders();
    const workersData = dataService.getWorkers();
    
    setOrders(ordersData);
    setWorkers(workersData);
    
    // Calculate stats
    setStats({
      totalOrders: ordersData.length,
      pendingOrders: ordersData.filter(o => o.status === 'pending').length,
      completedOrders: ordersData.filter(o => o.status === 'completed').length,
      activeWorkers: workersData.filter(w => w.status === 'active').length,
    });
  };

  const handleLogin = () => {
    if (dataService.verifyAdminPassword(password)) {
      setIsAuthenticated(true);
      toast.success('تم تسجيل الدخول بنجاح');
    } else {
      toast.error('كلمة المرور غير صحيحة');
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    dataService.deleteOrder(orderId);
    loadData();
    toast.success('تم حذف الطلب');
  };

  const handleToggleWorkerStatus = (workerId: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    dataService.updateWorkerStatus(workerId, newStatus);
    loadData();
    toast.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إلغاء'} العامل`);
  };

  const handleDeleteWorker = (workerId: string) => {
    const updatedWorkers = workers.filter(w => w.id !== workerId);
    dataService.saveWorkers(updatedWorkers);
    loadData();
    toast.success('تم حذف العامل');
  };

  const handleAddWorker = () => {
    if (!newWorker.name || !newWorker.whatsappNumber) {
      toast.error('يرجى ملئ جميع الحقول');
      return;
    }

    dataService.addWorker({
      name: newWorker.name,
      whatsappNumber: newWorker.whatsappNumber,
      status: newWorker.status
    });

    setNewWorker({ name: '', whatsappNumber: '', status: 'active' });
    setIsAddWorkerOpen(false);
    loadData();
    toast.success('تم إضافة العامل بنجاح');
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogo(result);
        localStorage.setItem('site_logo', result);
        toast.success('تم رفع الشعار بنجاح');
      };
      reader.readAsDataURL(file);
    }
  };

  const getWorkerOrderCount = (workerId: string) => {
    return orders.filter(order => order.assignedWorker === workerId).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'assigned': return 'تم التوزيع';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Settings className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                لوحة إدارة الفهد
              </CardTitle>
              <p className="text-gray-600 mt-2">يرجى إدخال كلمة المرور للدخول</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="text-center text-lg tracking-widest border-orange-200 focus:border-orange-400"
                  placeholder="••••••••••••"
                />
              </div>
              <Button 
                onClick={handleLogin} 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                size="lg"
              >
                دخول
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              {logo && (
                <img src={logo} alt="شعار الفهد" className="w-12 h-12 rounded-full shadow-md" />
              )}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  لوحة إدارة الفهد
                </h1>
                <p className="text-gray-600">نظام إدارة الطلبات والعمال</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                    <Upload className="w-4 h-4 ml-2" />
                    رفع شعار
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>رفع شعار الموقع</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-center">
                      {logo && (
                        <img src={logo} alt="الشعار الحالي" className="w-32 h-32 mx-auto rounded-lg shadow-md mb-4" />
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="border-orange-200"
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                onClick={() => setIsAuthenticated(false)} 
                variant="outline" 
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                خروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">إجمالي الطلبات</p>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </div>
                <Package className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">قيد الانتظار</p>
                  <p className="text-3xl font-bold">{stats.pendingOrders}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">مكتملة</p>
                  <p className="text-3xl font-bold">{stats.completedOrders}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">العمال النشطين</p>
                  <p className="text-3xl font-bold">{stats.activeWorkers}</p>
                </div>
                <Users className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="orders" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              إدارة الطلبات
            </TabsTrigger>
            <TabsTrigger value="workers" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              إدارة العمال
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-orange-800 flex items-center">
                  <Package className="w-6 h-6 ml-2" />
                  جميع الطلبات ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">لا توجد طلبات حتى الآن</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <Card key={order.id} className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-400">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center space-x-4 space-x-reverse">
                                <Avatar className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600">
                                  <AvatarFallback className="text-white font-bold">
                                    {order.customerName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-bold text-lg text-gray-800">{order.customerName}</h3>
                                  <Badge className={`${getStatusColor(order.status)} border`}>
                                    {getStatusText(order.status)}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Phone className="w-4 h-4 ml-2 text-orange-500" />
                                  {order.phone}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="w-4 h-4 ml-2 text-orange-500" />
                                  {order.address}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Clock className="w-4 h-4 ml-2 text-orange-500" />
                                  {formatDate(order.timestamp)}
                                </div>
                                {order.assignedWorker && (
                                  <div className="flex items-center text-gray-600">
                                    <User className="w-4 h-4 ml-2 text-green-500" />
                                    العامل: {workers.find(w => w.id === order.assignedWorker)?.name || 'غير معروف'}
                                  </div>
                                )}
                              </div>
                              
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-1">تفاصيل الطلب:</p>
                                <p className="text-gray-600">{order.orderDetails}</p>
                              </div>
                            </div>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="shadow-md">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>حذف الطلب</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف طلب {order.customerName}؟ لا يمكن التراجع عن هذا الإجراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workers Tab */}
          <TabsContent value="workers" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-orange-800 flex items-center">
                  <Users className="w-6 h-6 ml-2" />
                  إدارة العمال ({workers.length})
                </CardTitle>
                
                <Dialog open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md">
                      إضافة عامل جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة عامل جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="workerName">اسم العامل</Label>
                        <Input
                          id="workerName"
                          value={newWorker.name}
                          onChange={(e) => setNewWorker({...newWorker, name: e.target.value})}
                          placeholder="أدخل اسم العامل"
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="workerPhone">رقم الواتساب</Label>
                        <Input
                          id="workerPhone"
                          value={newWorker.whatsappNumber}
                          onChange={(e) => setNewWorker({...newWorker, whatsappNumber: e.target.value})}
                          placeholder="مثال: 201234567890"
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                          id="workerStatus"
                          checked={newWorker.status === 'active'}
                          onCheckedChange={(checked) => 
                            setNewWorker({...newWorker, status: checked ? 'active' : 'inactive'})
                          }
                        />
                        <Label htmlFor="workerStatus">نشط</Label>
                      </div>
                      <Button onClick={handleAddWorker} className="w-full bg-orange-500 hover:bg-orange-600">
                        إضافة العامل
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {workers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">لا يوجد عمال مسجلين</p>
                    </div>
                  ) : (
                    workers.map((worker) => (
                      <Card key={worker.id} className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-400">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 space-x-reverse">
                              <Avatar className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600">
                                <AvatarFallback className="text-white font-bold text-lg">
                                  {worker.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-2">
                                <h3 className="font-bold text-xl text-gray-800">{worker.name}</h3>
                                <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 ml-1 text-blue-500" />
                                    {worker.whatsappNumber}
                                  </div>
                                  <Badge className={`${worker.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} border`}>
                                    {worker.status === 'active' ? 'نشط' : 'غير نشط'}
                                  </Badge>
                                </div>
                                <div className="bg-blue-50 px-3 py-1 rounded-full inline-block">
                                  <span className="text-sm font-medium text-blue-700">
                                    عدد الطلبات: {getWorkerOrderCount(worker.id)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Switch
                                checked={worker.status === 'active'}
                                onCheckedChange={() => handleToggleWorkerStatus(worker.id, worker.status)}
                              />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="shadow-md">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>حذف العامل</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من حذف العامل {worker.name}؟ لا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteWorker(worker.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      حذف
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
