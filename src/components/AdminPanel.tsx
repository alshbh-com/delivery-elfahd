import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Users, User, Upload, Settings, BarChart3, Clock, Phone, MapPin, Package, ArrowLeft, Plus, Tag, Percent, Image as ImageIcon } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { supabase } from '@/integrations/supabase/client';
import { Order, Worker, Offer } from '@/types';
import { toast } from 'sonner';

const AdminPanel = () => {
  const navigate = useNavigate();
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

  // Add offers state
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    image_url: '',
    discount_percentage: '',
    original_price: '',
    offer_price: '',
    expires_at: ''
  });

  // Logo states
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      loadOffers();
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

  const loadOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading offers:', error);
        return;
      }

      setOffers(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
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

  const handleAddOffer = async () => {
    if (!newOffer.title) {
      toast.error('يرجى إدخال عنوان العرض');
      return;
    }

    try {
      const offerData = {
        title: newOffer.title,
        description: newOffer.description || null,
        image_url: newOffer.image_url || null,
        discount_percentage: newOffer.discount_percentage ? parseInt(newOffer.discount_percentage) : null,
        original_price: newOffer.original_price ? parseFloat(newOffer.original_price) : null,
        offer_price: newOffer.offer_price ? parseFloat(newOffer.offer_price) : null,
        expires_at: newOffer.expires_at || null,
        is_active: true
      };

      const { error } = await supabase
        .from('offers')
        .insert([offerData]);

      if (error) {
        console.error('Error adding offer:', error);
        toast.error('حدث خطأ في إضافة العرض');
        return;
      }

      setNewOffer({
        title: '',
        description: '',
        image_url: '',
        discount_percentage: '',
        original_price: '',
        offer_price: '',
        expires_at: ''
      });
      setIsAddOfferOpen(false);
      loadOffers();
      toast.success('تم إضافة العرض بنجاح');
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ غير متوقع');
    }
  };

  const handleToggleOfferStatus = async (offerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ is_active: !currentStatus })
        .eq('id', offerId);

      if (error) {
        console.error('Error updating offer status:', error);
        toast.error('حدث خطأ في تحديث حالة العرض');
        return;
      }

      loadOffers();
      toast.success(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء'} العرض`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ غير متوقع');
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', offerId);

      if (error) {
        console.error('Error deleting offer:', error);
        toast.error('حدث خطأ في حذف العرض');
        return;
      }

      loadOffers();
      toast.success('تم حذف العرض');
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ غير متوقع');
    }
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
              <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Settings className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                لوحة إدارة الفهد
              </CardTitle>
              <p className="text-gray-600 mt-2 text-sm md:text-base">يرجى إدخال كلمة المرور للدخول</p>
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
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Back Button and Logo */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-50 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">الرئيسية</span>
              </Button>
              
              {logo && (
                <img src={logo} alt="شعار الفهد" className="w-8 h-8 md:w-12 md:h-12 rounded-full shadow-md" />
              )}
              <div>
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  لوحة إدارة الفهد
                </h1>
                <p className="text-gray-600 text-xs md:text-sm">نظام إدارة الطلبات والعمال</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50 text-xs md:text-sm px-2 md:px-3">
                    <Upload className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                    <span className="hidden md:inline">رفع شعار</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm md:max-w-md">
                  <DialogHeader>
                    <DialogTitle>رفع شعار الموقع</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-center">
                      {logo && (
                        <img src={logo} alt="الشعار الحالي" className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-lg shadow-md mb-4" />
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
                className="border-red-300 text-red-700 hover:bg-red-50 text-xs md:text-sm px-2 md:px-3"
              >
                خروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 md:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl border-0">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs md:text-sm">إجمالي الطلبات</p>
                  <p className="text-xl md:text-3xl font-bold">{stats.totalOrders}</p>
                </div>
                <Package className="w-6 h-6 md:w-10 md:h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-xl border-0">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs md:text-sm">قيد الانتظار</p>
                  <p className="text-xl md:text-3xl font-bold">{stats.pendingOrders}</p>
                </div>
                <Clock className="w-6 h-6 md:w-10 md:h-10 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl border-0">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs md:text-sm">مكتملة</p>
                  <p className="text-xl md:text-3xl font-bold">{stats.completedOrders}</p>
                </div>
                <BarChart3 className="w-6 h-6 md:w-10 md:h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl border-0">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs md:text-sm">العمال النشطين</p>
                  <p className="text-xl md:text-3xl font-bold">{stats.activeWorkers}</p>
                </div>
                <Users className="w-6 h-6 md:w-10 md:h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="orders" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-sm md:text-base">
              إدارة الطلبات
            </TabsTrigger>
            <TabsTrigger value="workers" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-sm md:text-base">
              إدارة العمال
            </TabsTrigger>
            <TabsTrigger value="offers" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-sm md:text-base">
              إدارة العروض
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4 md:space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-lg md:text-xl text-orange-800 flex items-center">
                  <Package className="w-5 h-5 md:w-6 md:h-6 ml-2" />
                  جميع الطلبات ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 md:px-6">
                <div className="grid gap-3 md:gap-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-8 md:py-12 text-gray-500">
                      <Package className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-base md:text-lg">لا توجد طلبات حتى الآن</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <Card key={order.id} className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-400">
                        <CardContent className="p-3 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-0">
                            <div className="flex-1 space-y-2 md:space-y-3">
                              <div className="flex items-center space-x-3 space-x-reverse">
                                <Avatar className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-400 to-orange-600">
                                  <AvatarFallback className="text-white font-bold text-sm md:text-base">
                                    {order.customerName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-bold text-base md:text-lg text-gray-800">{order.customerName}</h3>
                                  <Badge className={`${getStatusColor(order.status)} border text-xs`}>
                                    {getStatusText(order.status)}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-2 text-xs md:text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Phone className="w-3 h-3 md:w-4 md:h-4 ml-2 text-orange-500" />
                                  {order.phone}
                                </div>
                                <div className="flex items-start text-gray-600">
                                  <MapPin className="w-3 h-3 md:w-4 md:h-4 ml-2 mt-0.5 text-orange-500 flex-shrink-0" />
                                  <span className="break-words">{order.address}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Clock className="w-3 h-3 md:w-4 md:h-4 ml-2 text-orange-500" />
                                  {formatDate(order.timestamp)}
                                </div>
                                {order.assignedWorker && (
                                  <div className="flex items-center text-gray-600">
                                    <User className="w-3 h-3 md:w-4 md:h-4 ml-2 text-green-500" />
                                    العامل: {workers.find(w => w.id === order.assignedWorker)?.name || 'غير معروف'}
                                  </div>
                                )}
                              </div>
                              
                              <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                                <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">تفاصيل الطلب:</p>
                                <p className="text-xs md:text-sm text-gray-600 break-words">{order.orderDetails}</p>
                              </div>
                            </div>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="shadow-md self-start">
                                  <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-sm md:max-w-md">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>حذف الطلب</AlertDialogTitle>
                                  <AlertDialogDescription className="text-sm">
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
          <TabsContent value="workers" className="space-y-4 md:space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 pb-3 md:pb-4">
                <CardTitle className="text-lg md:text-xl text-orange-800 flex items-center">
                  <Users className="w-5 h-5 md:w-6 md:h-6 ml-2" />
                  إدارة العمال ({workers.length})
                </CardTitle>
                
                <Dialog open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md text-sm md:text-base px-3 py-2 md:px-4 md:py-2">
                      <Plus className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                      إضافة عامل
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm md:max-w-md">
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
              <CardContent className="px-3 md:px-6">
                <div className="grid gap-3 md:gap-4">
                  {workers.length === 0 ? (
                    <div className="text-center py-8 md:py-12 text-gray-500">
                      <Users className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-base md:text-lg">لا يوجد عمال مسجلين</p>
                    </div>
                  ) : (
                    workers.map((worker) => (
                      <Card key={worker.id} className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-400">
                        <CardContent className="p-3 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                            <div className="flex items-start md:items-center space-x-3 space-x-reverse flex-1">
                              <Avatar className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-400 to-blue-600">
                                <AvatarFallback className="text-white font-bold text-sm md:text-lg">
                                  {worker.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1 md:space-y-2 flex-1">
                                <h3 className="font-bold text-base md:text-xl text-gray-800 break-words">{worker.name}</h3>
                                <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4 md:space-x-reverse text-xs md:text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Phone className="w-3 h-3 md:w-4 md:h-4 ml-1 text-blue-500" />
                                    <span className="break-all">{worker.whatsappNumber}</span>
                                  </div>
                                  <Badge className={`${worker.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} border w-fit`}>
                                    {worker.status === 'active' ? 'نشط' : 'غير نشط'}
                                  </Badge>
                                </div>
                                <div className="bg-blue-50 px-2 py-1 md:px-3 md:py-1 rounded-full inline-block">
                                  <span className="text-xs md:text-sm font-medium text-blue-700">
                                    عدد الطلبات: {getWorkerOrderCount(worker.id)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 space-x-reverse self-start md:self-center">
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <span className="text-xs text-gray-600">{worker.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                                <Switch
                                  checked={worker.status === 'active'}
                                  onCheckedChange={() => handleToggleWorkerStatus(worker.id, worker.status)}
                                />
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="shadow-md">
                                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-sm md:max-w-md">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>حذف العامل</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm">
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

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-4 md:space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 pb-3 md:pb-4">
                <CardTitle className="text-lg md:text-xl text-orange-800 flex items-center">
                  <Tag className="w-5 h-5 md:w-6 md:h-6 ml-2" />
                  إدارة العروض ({offers.length})
                </CardTitle>
                
                <Dialog open={isAddOfferOpen} onOpenChange={setIsAddOfferOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md text-sm md:text-base px-3 py-2 md:px-4 md:py-2">
                      <Plus className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                      إضافة عرض
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>إضافة عرض جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="offerTitle">عنوان العرض *</Label>
                        <Input
                          id="offerTitle"
                          value={newOffer.title}
                          onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                          placeholder="أدخل عنوان العرض"
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="offerDescription">وصف العرض</Label>
                        <Textarea
                          id="offerDescription"
                          value={newOffer.description}
                          onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                          placeholder="أدخل وصف العرض"
                          className="border-orange-200 focus:border-orange-400"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="offerImage">رابط الصورة</Label>
                        <Input
                          id="offerImage"
                          value={newOffer.image_url}
                          onChange={(e) => setNewOffer({...newOffer, image_url: e.target.value})}
                          placeholder="https://example.com/image.jpg"
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="discountPercentage">نسبة الخصم (%)</Label>
                          <Input
                            id="discountPercentage"
                            type="number"
                            value={newOffer.discount_percentage}
                            onChange={(e) => setNewOffer({...newOffer, discount_percentage: e.target.value})}
                            placeholder="20"
                            className="border-orange-200 focus:border-orange-400"
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiresAt">تاريخ الانتهاء</Label>
                          <Input
                            id="expiresAt"
                            type="datetime-local"
                            value={newOffer.expires_at}
                            onChange={(e) => setNewOffer({...newOffer, expires_at: e.target.value})}
                            className="border-orange-200 focus:border-orange-400"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="originalPrice">السعر الأصلي (ج.م)</Label>
                          <Input
                            id="originalPrice"
                            type="number"
                            step="0.01"
                            value={newOffer.original_price}
                            onChange={(e) => setNewOffer({...newOffer, original_price: e.target.value})}
                            placeholder="100.00"
                            className="border-orange-200 focus:border-orange-400"
                          />
                        </div>
                        <div>
                          <Label htmlFor="offerPrice">سعر العرض (ج.م)</Label>
                          <Input
                            id="offerPrice"
                            type="number"
                            step="0.01"
                            value={newOffer.offer_price}
                            onChange={(e) => setNewOffer({...newOffer, offer_price: e.target.value})}
                            placeholder="80.00"
                            className="border-orange-200 focus:border-orange-400"
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddOffer} className="w-full bg-orange-500 hover:bg-orange-600">
                        إضافة العرض
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="px-3 md:px-6">
                <div className="grid gap-3 md:gap-4">
                  {offers.length === 0 ? (
                    <div className="text-center py-8 md:py-12 text-gray-500">
                      <Tag className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-base md:text-lg">لا توجد عروض حتى الآن</p>
                    </div>
                  ) : (
                    offers.map((offer) => (
                      <Card key={offer.id} className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-400">
                        <CardContent className="p-3 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-0">
                            <div className="flex-1 space-y-2 md:space-y-3">
                              <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                                  {offer.image_url ? (
                                    <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover rounded-lg" />
                                  ) : (
                                    <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-bold text-base md:text-lg text-gray-800">{offer.title}</h3>
                                  <Badge className={`${offer.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} border text-xs`}>
                                    {offer.is_active ? 'نشط' : 'غير نشط'}
                                  </Badge>
                                </div>
                              </div>
                              
                              {offer.description && (
                                <p className="text-xs md:text-sm text-gray-600 break-words">{offer.description}</p>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm">
                                {offer.discount_percentage && (
                                  <div className="flex items-center text-gray-600">
                                    <Percent className="w-3 h-3 md:w-4 md:h-4 ml-2 text-green-500" />
                                    خصم: {offer.discount_percentage}%
                                  </div>
                                )}
                                {offer.original_price && offer.offer_price && (
                                  <div className="flex items-center text-gray-600">
                                    <Tag className="w-3 h-3 md:w-4 md:h-4 ml-2 text-blue-500" />
                                    {offer.offer_price} ج.م (بدلاً من {offer.original_price} ج.م)
                                  </div>
                                )}
                                {offer.expires_at && (
                                  <div className="flex items-center text-gray-600">
                                    <Clock className="w-3 h-3 md:w-4 md:h-4 ml-2 text-orange-500" />
                                    ينتهي: {formatDate(offer.expires_at)}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 space-x-reverse self-start md:self-center">
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <span className="text-xs text-gray-600">{offer.is_active ? 'نشط' : 'غير نشط'}</span>
                                <Switch
                                  checked={offer.is_active}
                                  onCheckedChange={() => handleToggleOfferStatus(offer.id, offer.is_active)}
                                />
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="shadow-md">
                                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-sm md:max-w-md">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>حذف العرض</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm">
                                      هل أنت متأكد من حذف العرض "{offer.title}"؟ لا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteOffer(offer.id)}
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
