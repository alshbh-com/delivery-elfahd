
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Percent, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Offer } from '@/types';

const OffersSection = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching offers:', error);
        return;
      }

      setOffers(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-orange-800 mb-2">
          🔥 العروض الحصرية
        </h2>
        <p className="text-gray-600">اكتشف أفضل العروض المتاحة لفترة محدودة</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-orange-200">
            <CardContent className="p-0">
              {offer.image_url && (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={offer.image_url} 
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                  {offer.discount_percentage && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white text-lg px-3 py-1">
                      <Percent className="w-4 h-4 ml-1" />
                      {offer.discount_percentage}%
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-right">
                  {offer.title}
                </h3>
                
                {offer.description && (
                  <p className="text-gray-600 text-sm mb-3 text-right leading-relaxed">
                    {offer.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  {offer.original_price && offer.offer_price && (
                    <div className="text-right">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="text-2xl font-bold text-green-600">
                          {offer.offer_price} ج.م
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          {offer.original_price} ج.م
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {offer.discount_percentage && !offer.image_url && (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      <Tag className="w-3 h-3 ml-1" />
                      خصم {offer.discount_percentage}%
                    </Badge>
                  )}
                </div>
                
                {offer.expires_at && (
                  <div className="flex items-center justify-center bg-orange-50 px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-600 ml-2" />
                    <span className="text-sm text-orange-700 font-medium">
                      ينتهي في: {formatDate(offer.expires_at)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OffersSection;
