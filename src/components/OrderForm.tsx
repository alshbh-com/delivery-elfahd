import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/types';
import { ShoppingCart, Phone, MapPin, User, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const OrderForm = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    address: '',
    phone: '',
    orderDetails: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getNextAvailableWorker = async () => {
    try {
      // Get active workers
      const { data: workers, error } = await supabase
        .from('workers')
        .select('*')
        .eq('status', 'active');

      if (error || !workers || workers.length === 0) {
        return null;
      }

      // Get order counts for each worker
      const workersWithCounts = await Promise.all(
        workers.map(async (worker) => {
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('worker_id', worker.id);

          return {
            ...worker,
            ordersCount: count || 0
          };
        })
      );

      // Sort by order count (ascending) then by last_order (ascending for fairness)
      workersWithCounts.sort((a, b) => {
        if (a.ordersCount !== b.ordersCount) {
          return a.ordersCount - b.ordersCount;
        }
        // If same order count, prioritize worker who got order longest time ago
        return (a.last_order || 0) - (b.last_order || 0);
      });

      return workersWithCounts[0];
    } catch (error) {
      console.error('Error getting available worker:', error);
      return null;
    }
  };

  const formatOrderMessage = (order: Order, workerName: string): string => {
    return `🆕 طلب جديد للعامل ${workerName}

👤 العميل: ${order.customerName}
📱 التليفون: ${order.phone}
📍 العنوان: ${order.address}
🛒 تفاصيل الطلب: ${order.orderDetails}
⏰ وقت الطلب: ${new Date(order.timestamp).toLocaleString('ar-EG')}

رقم الطلب: ${order.id}`;
  };

  const formatAdminMessage = (order: Order, workerName: string): string => {
    return `📋 طلب جديد تم تسجيله

العامل المكلف: ${workerName}
العميل: ${order.customerName}
التليفون: ${order.phone}
العنوان: ${order.address}
تفاصيل الطلب: ${order.orderDetails}
وقت الطلب: ${new Date(order.timestamp).toLocaleString('ar-EG')}
رقم الطلب: ${order.id}`;
  };

  const sendWhatsAppMessage = (phoneNumber: string, message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.address || !formData.phone || !formData.orderDetails) {
      toast({
        title: "❌ خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order in database
      const orderData = {
        customer_name: formData.customerName,
        customer_address: formData.address,
        customer_phone: formData.phone,
        order_details: formData.orderDetails,
        status: 'pending'
      };

      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Get available worker
      const availableWorker = await getNextAvailableWorker();
      
      if (!availableWorker) {
        toast({
          title: "⚠️ لا يوجد عمال متاحين",
          description: "جميع العمال غير متاحين حاليًا. سيتم حفظ الطلب للمراجعة.",
        });
        
        // Send to admin only
        const adminMessage = `⚠️ طلب جديد - لا يوجد عمال متاحين

العميل: ${formData.customerName}
التليفون: ${formData.phone}
العنوان: ${formData.address}
تفاصيل الطلب: ${formData.orderDetails}
وقت الطلب: ${new Date().toLocaleString('ar-EG')}
رقم الطلب: ${orderResult.id}`;

        sendWhatsAppMessage("201024713976", adminMessage);
        
        setFormData({
          customerName: '',
          address: '',
          phone: '',
          orderDetails: ''
        });
        
        setIsSubmitting(false);
        return;
      }

      // Assign worker to order
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          worker_id: availableWorker.id,
          status: 'assigned'
        })
        .eq('id', orderResult.id);

      if (updateError) {
        throw updateError;
      }

      // Update worker's last order time
      await supabase
        .from('workers')
        .update({ last_order: Date.now() })
        .eq('id', availableWorker.id);

      // Create order object for messages
      const order: Order = {
        id: orderResult.id,
        customerName: formData.customerName,
        address: formData.address,
        phone: formData.phone,
        orderDetails: formData.orderDetails,
        timestamp: orderResult.created_at,
        assignedWorker: availableWorker.name,
        status: 'assigned'
      };

      // Send WhatsApp messages
      const workerMessage = formatOrderMessage(order, availableWorker.name);
      const adminMessage = formatAdminMessage(order, availableWorker.name);

      // Send to worker
      sendWhatsAppMessage(availableWorker.phone, workerMessage);
      
      // Send to admin after delay
      setTimeout(() => {
        sendWhatsAppMessage("201024713976", adminMessage);
      }, 1000);

      toast({
        title: "✅ تم إرسال الطلب بنجاح! 🎉",
        description: `تم تعيين الطلب للعامل ${availableWorker.name} وإرسال الرسائل على واتساب`,
      });

      // Reset form
      setFormData({
        customerName: '',
        address: '',
        phone: '',
        orderDetails: ''
      });

    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "❌ خطأ في إرسال الطلب",
        description: "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer Name */}
      <div className="space-y-3">
        <Label htmlFor="customerName" className="text-gray-800 font-bold text-lg flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-orange-600" />
          </div>
          الاسم الكامل
        </Label>
        <Input
          id="customerName"
          name="customerName"
          type="text"
          value={formData.customerName}
          onChange={handleInputChange}
          required
          className="h-14 text-lg border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-300 rounded-xl shadow-sm"
          placeholder="ادخل اسمك الكامل..."
        />
      </div>

      {/* Phone */}
      <div className="space-y-3">
        <Label htmlFor="phone" className="text-gray-800 font-bold text-lg flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Phone className="h-5 w-5 text-green-600" />
          </div>
          رقم التليفون
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          required
          className="h-14 text-lg border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-300 rounded-xl shadow-sm"
          placeholder="01xxxxxxxxx"
        />
      </div>

      {/* Address */}
      <div className="space-y-3">
        <Label htmlFor="address" className="text-gray-800 font-bold text-lg flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          العنوان بالتفصيل
        </Label>
        <Input
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={handleInputChange}
          required
          className="h-14 text-lg border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-300 rounded-xl shadow-sm"
          placeholder="العنوان الكامل مع العلامات المميزة..."
        />
      </div>

      {/* Order Details */}
      <div className="space-y-3">
        <Label htmlFor="orderDetails" className="text-gray-800 font-bold text-lg flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-purple-600" />
          </div>
          تفاصيل الطلب
        </Label>
        <Textarea
          id="orderDetails"
          name="orderDetails"
          value={formData.orderDetails}
          onChange={handleInputChange}
          required
          rows={6}
          className="text-lg border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-300 resize-none rounded-xl shadow-sm"
          placeholder="اكتب تفاصيل طلبك بوضوح... 

مثال: توصيل طلب طعام من مطعم كنتاكي
- الطلب: وجبة زنجر + بطاطس كبيرة + مشروب
- العنوان: شارع الجمهورية بجوار بنك مصر
- الوقت المطلوب: الآن أو حدد الوقت"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-16 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span>جاري الإرسال...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <Send className="h-6 w-6" />
            <span>إرسال الطلب 🚀</span>
          </div>
        )}
      </Button>

      {/* Help Text */}
      <div className="text-center mt-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
          <p className="text-gray-700 font-medium text-base">
            📞 سيتم التواصل معك خلال دقائق من إرسال الطلب
          </p>
          <p className="text-gray-600 text-sm mt-2">
            💬 ستصلك رسالة واتساب بتأكيد الطلب وبيانات المندوب
          </p>
        </div>
      </div>
    </form>
  );
};

export default OrderForm;
