import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, CheckCircle, Clock, Users, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Order, Worker } from '@/types';
import { useToast } from '@/hooks/use-toast';
import OffersManagement from './OffersManagement';

const AdminPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [newWorker, setNewWorker] = useState({ name: '', whatsappNumber: '' });
  const [logo, setLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchWorkers();
    loadLogo();
  }, []);

  const loadLogo = async () => {
    try {
      // Try to get logo from Supabase storage first
      const { data: files } = await supabase.storage.from('offer-images').list('logos');
      if (files && files.length > 0) {
        const { data } = supabase.storage.from('offer-images').getPublicUrl(`logos/${files[0].name}`);
        if (data?.publicUrl) {
          setLogo(data.publicUrl);
          localStorage.setItem('site_logo', data.publicUrl);
          return;
        }
      }
      
      // Fallback to localStorage
      const savedLogo = localStorage.getItem('site_logo');
      if (savedLogo) {
        setLogo(savedLogo);
      }
    } catch (error) {
      console.error('Error loading logo:', error);
      const savedLogo = localStorage.getItem('site_logo');
      if (savedLogo) {
        setLogo(savedLogo);
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "خطأ",
          description: "فشل في جلب الطلبات",
          variant: "destructive"
        });
        return;
      }

      // Convert Supabase data to match our Order interface
      const formattedOrders: Order[] = (data || []).map(order => ({
        id: order.id,
        customerName: order.customer_name,
        address: order.customer_address,
        phone: order.customer_phone,
        orderDetails: order.order_details,
        timestamp: order.created_at,
        assignedWorker: order.worker_id,
        status: order.status as 'pending' | 'assigned' | 'completed'
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workers:', error);
        return;
      }

      const formattedWorkers: Worker[] = (data || []).map(worker => ({
        id: worker.id,
        name: worker.name,
        whatsappNumber: worker.phone,
        status: worker.status as 'active' | 'inactive',
        lastOrderTime: worker.last_order?.toString(),
        ordersCount: 0
      }));

      setWorkers(formattedWorkers);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addWorker = async () => {
    if (!newWorker.name.trim() || !newWorker.whatsappNumber.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع البيانات",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('workers')
        .insert([{
          name: newWorker.name,
          phone: newWorker.whatsappNumber,
          status: 'active'
        }]);

      if (error) {
        console.error('Error adding worker:', error);
        toast({
          title: "خطأ",
          description: "فشل في إضافة العامل",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "نجح",
        description: "تم إضافة العامل بنجاح",
      });

      setNewWorker({ name: '', whatsappNumber: '' });
      fetchWorkers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleWorkerStatus = async (workerId: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('workers')
        .update({ status: newStatus })
        .eq('id', workerId);

      if (error) {
        console.error('Error updating worker status:', error);
        toast({
          title: "خطأ",
          description: "فشل في تحديث حالة العامل",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "نجح",
        description: `تم تحديث حالة العامل إلى ${newStatus === 'active' ? 'نشط' : 'غير نشط'}`,
      });

      fetchWorkers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteWorker = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العامل؟')) return;

    try {
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting worker:', error);
        toast({
          title: "خطأ",
          description: "فشل في حذف العامل",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "نجح",
        description: "تم حذف العامل بنجاح",
      });

      fetchWorkers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting order:', error);
        toast({
          title: "خطأ",
          description: "فشل في حذف الطلب",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "نجح",
        description: "تم حذف الطلب بنجاح",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `logo.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('offer-images')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data } = supabase.storage.from('offer-images').getPublicUrl(filePath);
        
        if (data?.publicUrl) {
          setLogo(data.publicUrl);
          localStorage.setItem('site_logo', data.publicUrl);
          
          toast({
            title: "نجح",
            description: "تم تحديث الشعار بنجاح وسيظهر للمستخدمين",
          });
        }
      } catch (error) {
        console.error('Error uploading logo:', error);
        
        // Fallback to local storage
        const reader = new FileReader();
        reader.onload = (e) => {
          const logoUrl = e.target?.result as string;
          setLogo(logoUrl);
          localStorage.setItem('site_logo', logoUrl);
          toast({
            title: "تحذير",
            description: "تم حفظ الشعار محلياً فقط. يرجى المحاولة مرة أخرى لحفظه على الخادم",
            variant: "destructive"
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل لوحة الإدارة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة إدارة الفهد</h1>
          <p className="text-gray-600">إدارة الطلبات والعمال والعروض</p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="workers">العمال</TabsTrigger>
            <TabsTrigger value="offers">العروض</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
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
                              onClick={() => deleteOrder(order.id)}
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                          <div>
                            <p className="text-sm text-gray-600">الهاتف:</p>
                            <p className="font-medium">{order.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">العنوان:</p>
                            <p className="font-medium">{order.address}</p>
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
          </TabsContent>

          <TabsContent value="workers">
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  إدارة العمال ({workers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-4 text-right">إضافة عامل جديد</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-right">
                      <label className="block text-sm font-medium mb-2">اسم العامل</label>
                      <Input
                        value={newWorker.name}
                        onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                        placeholder="أدخل اسم العامل"
                        className="text-right"
                      />
                    </div>
                    <div className="text-right">
                      <label className="block text-sm font-medium mb-2">رقم الواتساب</label>
                      <Input
                        value={newWorker.whatsappNumber}
                        onChange={(e) => setNewWorker({ ...newWorker, whatsappNumber: e.target.value })}
                        placeholder="201234567890"
                        className="text-right"
                      />
                    </div>
                  </div>
                  <Button onClick={addWorker} className="mt-4 bg-green-600 hover:bg-green-700">
                    إضافة عامل
                  </Button>
                </div>

                {workers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا يوجد عمال مسجلين</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {workers.map((worker) => (
                      <div key={worker.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => deleteWorker(worker.id)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-right flex-1">
                            <h3 className="font-semibold text-lg">{worker.name}</h3>
                            <p className="text-sm text-gray-600">الواتساب: {worker.whatsappNumber}</p>
                            <div className="flex items-center gap-3 mt-2 justify-end">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {worker.status === 'active' ? 'نشط' : 'غير نشط'}
                                </span>
                                <Switch
                                  checked={worker.status === 'active'}
                                  onCheckedChange={() => toggleWorkerStatus(worker.id, worker.status)}
                                />
                              </div>
                              <Badge variant={worker.status === 'active' ? 'default' : 'secondary'}>
                                {worker.status === 'active' ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <OffersManagement />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">إعدادات الموقع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-right">
                  <label className="block text-sm font-medium mb-2">شعار الموقع</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="text-right"
                  />
                  {logo && (
                    <div className="mt-4 text-center">
                      <img src={logo} alt="الشعار الحالي" className="w-20 h-20 rounded-full mx-auto" />
                      <p className="text-sm text-gray-600 mt-2">الشعار الحالي</p>
                      <p className="text-xs text-green-600 mt-1">سيظهر هذا الشعار لجميع المستخدمين</p>
                    </div>
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
