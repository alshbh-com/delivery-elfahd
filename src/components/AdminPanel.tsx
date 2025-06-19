
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Order, Worker } from '@/types';
import { useToast } from '@/hooks/use-toast';
import OffersManagement from './OffersManagement';
import OrdersTab from './admin/OrdersTab';
import WorkersTab from './admin/WorkersTab';
import SettingsTab from './admin/SettingsTab';

const AdminPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
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

  const addWorker = async (newWorker: { name: string; whatsappNumber: string }) => {
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
            <OrdersTab
              orders={orders}
              onDeleteOrder={deleteOrder}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="workers">
            <WorkersTab
              workers={workers}
              onAddWorker={addWorker}
              onToggleWorkerStatus={toggleWorkerStatus}
              onDeleteWorker={deleteWorker}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="offers">
            <OffersManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab
              logo={logo}
              onLogoUpload={handleLogoUpload}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
