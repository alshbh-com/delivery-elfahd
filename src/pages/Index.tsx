import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderForm from '@/components/OrderForm';
import OffersSection from '@/components/OffersSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, MessageCircle, Phone } from 'lucide-react';

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

  const handleWhatsAppContact = () => {
    const phoneNumber = "201024713976";
    const message = encodeURIComponent("مرحباً، أريد الاستفسار عن خدمة التوصيل");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-orange-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              {logo && (
                <div className="relative">
                  <img 
                    src={logo} 
                    alt="شعار الفهد" 
                    className="w-14 h-14 md:w-20 md:h-20 rounded-full shadow-2xl border-4 border-orange-300" 
                  />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
              )}
              <div className="text-right">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-600 via-orange-700 to-red-600 bg-clip-text text-transparent">
                  🦅 الفهد
                </h1>
                <p className="text-sm md:text-lg text-gray-700 mt-1 md:mt-2 font-medium">
                  ✨ خدمة التوصيل السريع والموثوق ✨
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {/* WhatsApp Contact Button */}
              <Button
                onClick={handleWhatsAppContact}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg flex items-center gap-2 text-xs md:text-sm px-3 py-2 md:px-4 md:py-2 rounded-full"
                size="sm"
              >
                <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">تواصل معنا</span>
              </Button>

              {/* Admin Button */}
              <Button
                onClick={() => navigate('/admin')}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg flex items-center gap-2 text-xs md:text-sm px-3 py-2 md:px-4 md:py-2 rounded-full"
                size="sm"
              >
                <Settings className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">لوحة الإدارة</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="relative">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 md:mb-6 px-2 leading-tight">
              🚀 اطلب الآن واحصل على خدمة توصيل 
              <span className="block text-orange-600 mt-2">سريعة ومميزة</span>
            </h2>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-orange-400 rounded-full opacity-20 animate-bounce"></div>
            <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-red-400 rounded-full opacity-30 animate-pulse"></div>
          </div>
          
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto px-4 leading-relaxed">
            💯 نحن نوفر خدمة توصيل احترافية مع نظام توزيع عادل 
            <br className="hidden md:block" />
            يضمن وصول طلبك في أسرع وقت ممكن
          </p>

          {/* Contact Info */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
              <Phone className="w-5 h-5 text-green-600" />
              <span className="text-gray-700 font-medium">متاح 24/7</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700 font-medium">رد فوري على الواتساب</span>
            </div>
          </div>
        </div>

        {/* Offers Section */}
        <OffersSection />

        {/* Enhanced Order Form */}
        <div className="max-w-4xl mx-auto px-4">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-red-400 to-orange-600"></div>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-200 rounded-full opacity-50"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-red-200 rounded-full opacity-30"></div>
            
            <CardHeader className="text-center pb-4 px-6 md:px-8 pt-8">
              <CardTitle className="text-2xl md:text-3xl font-bold text-orange-800 mb-3">
                📋 اطلب خدمة التوصيل الآن
              </CardTitle>
              <p className="text-gray-600 text-base md:text-lg">
                املأ البيانات التالية وسنتواصل معك فوراً عبر الواتساب
              </p>
              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-lg">⭐</span>
                  ))}
                  <span className="text-sm text-gray-600 mr-2">تقييم العملاء</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-6 md:px-8 pb-8">
              <OrderForm />
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Footer */}
        <div className="text-center mt-12 md:mt-16 pt-8 border-t border-orange-200 px-4">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🌟 لماذا تختار الفهد؟</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl px-6 py-4 shadow-md">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-gray-800">توصيل سريع</h4>
                <p className="text-sm text-gray-600">خلال دقائق من طلبك</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl px-6 py-4 shadow-md">
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-semibold text-gray-800">تواصل فوري</h4>
                <p className="text-sm text-gray-600">رد مباشر على الواتساب</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl px-6 py-4 shadow-md">
                <div className="text-2xl mb-2">💯</div>
                <h4 className="font-semibold text-gray-800">جودة مضمونة</h4>
                <p className="text-sm text-gray-600">خدمة احترافية موثوقة</p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm md:text-base mb-4">
            © 2024 الفهد لخدمات التوصيل - جميع الحقوق محفوظة
          </p>
          
          <Button
            onClick={handleWhatsAppContact}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5 ml-2" />
            تواصل معنا الآن
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
