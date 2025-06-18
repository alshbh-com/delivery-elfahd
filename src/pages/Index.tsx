
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderForm from '@/components/OrderForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const Index = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load logo from localStorage
    const savedLogo = localStorage.getItem('site_logo');
    if (savedLogo) {
      setLogo(savedLogo);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header with Admin Button */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              {logo && (
                <img src={logo} alt="شعار الفهد" className="w-12 h-12 md:w-16 md:h-16 rounded-full shadow-lg" />
              )}
              <div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  الفهد
                </h1>
                <p className="text-sm md:text-lg text-gray-600 mt-1 md:mt-2">خدمة التوصيل السريع والموثوق</p>
              </div>
            </div>
            
            {/* Admin Button */}
            <Button
              onClick={() => navigate('/admin')}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg flex items-center gap-2 text-xs md:text-sm px-3 py-2 md:px-4 md:py-2"
              size="sm"
            >
              <Settings className="w-3 h-3 md:w-4 md:h-4" />
              لوحة الإدارة
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4 px-2">
            اطلب الآن واحصل على خدمة توصيل سريعة ومميزة
          </h2>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            نحن نوفر خدمة توصيل احترافية مع نظام توزيع عادل يضمن وصول طلبك في أسرع وقت
          </p>
        </div>

        {/* Order Form */}
        <div className="max-w-2xl mx-auto px-4">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-2 px-4 md:px-6">
              <CardTitle className="text-xl md:text-2xl font-bold text-orange-800">
                اطلب خدمة التوصيل الآن
              </CardTitle>
              <p className="text-gray-600 text-sm md:text-base">املأ البيانات التالية وسنتواصل معك فوراً</p>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-6">
              <OrderForm />
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 md:mt-12 pt-6 md:pt-8 border-t border-orange-200 px-4">
          <p className="text-gray-600 text-sm md:text-base">
            © 2024 الفهد لخدمات التوصيل - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
