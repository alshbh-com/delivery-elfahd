
import React, { useState, useEffect } from 'react';
import OrderForm from '@/components/OrderForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Clock, Users, Star } from 'lucide-react';

const Index = () => {
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    // Load logo from localStorage
    const savedLogo = localStorage.getItem('site_logo');
    if (savedLogo) {
      setLogo(savedLogo);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 space-x-reverse mb-4">
              {logo && (
                <img src={logo} alt="شعار الفهد" className="w-16 h-16 rounded-full shadow-lg" />
              )}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  الفهد
                </h1>
                <p className="text-lg text-gray-600 mt-2">خدمة التو��يل السريع والموثوق</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            اطلب الآن واحصل على خدمة توصيل سريعة ومميزة
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نحن نوفر خدمة توصيل احترافية مع نظام توزيع عادل يضمن وصول طلبك في أسرع وقت
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">طلب سهل</h3>
              <p className="text-gray-600 text-sm">املأ النموذج واحصل على خدمة فورية</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">توصيل سريع</h3>
              <p className="text-gray-600 text-sm">نظام توزيع ذكي يضمن السرعة</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">فريق محترف</h3>
              <p className="text-gray-600 text-sm">عمال مدربون وموثوقون</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">جودة عالية</h3>
              <p className="text-gray-600 text-sm">خدمة متميزة ورضا العملاء أولويتنا</p>
            </CardContent>
          </Card>
        </div>

        {/* Order Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-orange-800">
                اطلب خدمة التوصيل الآن
              </CardTitle>
              <p className="text-gray-600">املأ البيانات التالية وسنتواصل معك فوراً</p>
            </CardHeader>
            <CardContent>
              <OrderForm />
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-orange-200">
          <p className="text-gray-600">
            © 2024 الفهد لخدمات التوصيل - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
