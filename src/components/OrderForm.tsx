
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/types';
import { dataService } from '@/services/dataService';
import { ShoppingCart, Phone, MapPin, User } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.address || !formData.phone || !formData.orderDetails) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // إنشاء الطلب
      const order: Order = {
        id: Date.now().toString(),
        customerName: formData.customerName,
        address: formData.address,
        phone: formData.phone,
        orderDetails: formData.orderDetails,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      // العثور على عامل متاح
      const availableWorker = dataService.getNextAvailableWorker();
      
      if (!availableWorker) {
        toast({
          title: "لا يوجد عمال متاحين",
          description: "جميع العمال غير متاحين حاليًا. سيتم حفظ الطلب للمراجعة.",
          variant: "destructive",
        });
        
        // حفظ الطلب بدون تعيين عامل
        dataService.saveOrder(order);
        
        // إرسال للإدارة فقط
        const adminMessage = `⚠️ طلب جديد - لا يوجد عمال متاحين

العميل: ${order.customerName}
التليفون: ${order.phone}
العنوان: ${order.address}
تفاصيل الطلب: ${order.orderDetails}
وقت الطلب: ${new Date(order.timestamp).toLocaleString('ar-EG')}
رقم الطلب: ${order.id}`;

        dataService.sendWhatsAppMessage(dataService.getAdminWhatsApp(), adminMessage);
        
        // إعادة تعيين النموذج
        setFormData({
          customerName: '',
          address: '',
          phone: '',
          orderDetails: ''
        });
        
        setIsSubmitting(false);
        return;
      }

      // تعيين العامل للطلب
      order.assignedWorker = availableWorker.name;
      order.status = 'assigned';

      // حفظ الطلب
      dataService.saveOrder(order);
      
      // تحديث بيانات العامل
      dataService.assignOrderToWorker(availableWorker.id);

      // إرسال الرسائل
      const workerMessage = formatOrderMessage(order, availableWorker.name);
      const adminMessage = formatAdminMessage(order, availableWorker.name);

      // إرسال للعامل
      dataService.sendWhatsAppMessage(availableWorker.whatsappNumber, workerMessage);
      
      // إرسال للإدارة
      setTimeout(() => {
        dataService.sendWhatsAppMessage(dataService.getAdminWhatsApp(), adminMessage);
      }, 1000);

      toast({
        title: "تم إرسال الطلب بنجاح! 🎉",
        description: `تم تعيين الطلب للعامل ${availableWorker.name} وإرسال الرسائل على واتساب`,
      });

      // إعادة تعيين النموذج
      setFormData({
        customerName: '',
        address: '',
        phone: '',
        orderDetails: ''
      });

    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "خطأ في إرسال الطلب",
        description: "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">🚚 خدمة التوصيل السريع</h1>
          </div>
          <p className="text-gray-600 text-lg">اطلب الآن واستلم في أسرع وقت</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              نموذج الطلب
            </CardTitle>
            <CardDescription className="text-orange-100">
              املأ البيانات التالية وسنتواصل معك فورًا
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-gray-700 font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-orange-500" />
                  الاسم الكامل
                </Label>
                <Input
                  id="customerName"
                  name="customerName"
                  type="text"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-300"
                  placeholder="ادخل اسمك الكامل"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-orange-500" />
                  رقم التليفون
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-300"
                  placeholder="01xxxxxxxxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-700 font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  العنوان بالتفصيل
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-300"
                  placeholder="العنوان الكامل مع العلامات المميزة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderDetails" className="text-gray-700 font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-orange-500" />
                  تفاصيل الطلب
                </Label>
                <Textarea
                  id="orderDetails"
                  name="orderDetails"
                  value={formData.orderDetails}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-300 resize-none"
                  placeholder="اكتب تفاصيل طلبك بوضوح..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    جاري الإرسال...
                  </div>
                ) : (
                  "إرسال الطلب 🚀"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8 animate-fade-in">
          <p className="text-gray-600">
            سيتم التواصل معك خلال دقائق من إرسال الطلب
          </p>
          <div className="mt-4 flex justify-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-full px-6 py-2 shadow-md">
              <p className="text-sm text-gray-700">
                ⚡ توصيل سريع | 📱 تواصل فوري | 💯 جودة مضمونة
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
