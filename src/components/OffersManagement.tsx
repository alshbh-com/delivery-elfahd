
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Offer } from '@/types';
import { useToast } from '@/hooks/use-toast';

const OffersManagement = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOffer, setEditingOffer] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    discount_percentage: '',
    original_price: '',
    offer_price: '',
    expires_at: '',
    image: null as File | null
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching offers:', error);
        toast({
          title: "خطأ",
          description: "فشل في جلب العروض",
          variant: "destructive"
        });
        return;
      }

      setOffers(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('offer-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      toast({
        title: "خطأ",
        description: "فشل في رفع الصورة",
        variant: "destructive"
      });
      return null;
    }

    const { data } = supabase.storage
      .from('offer-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleAddOffer = async () => {
    if (!newOffer.title.trim()) {
      toast({
        title: "خطأ",
        description: "عنوان العرض مطلوب",
        variant: "destructive"
      });
      return;
    }

    try {
      let imageUrl = null;
      if (newOffer.image) {
        imageUrl = await uploadImage(newOffer.image);
        if (!imageUrl) return;
      }

      const offerData = {
        title: newOffer.title,
        description: newOffer.description || null,
        discount_percentage: newOffer.discount_percentage ? parseInt(newOffer.discount_percentage) : null,
        original_price: newOffer.original_price ? parseFloat(newOffer.original_price) : null,
        offer_price: newOffer.offer_price ? parseFloat(newOffer.offer_price) : null,
        expires_at: newOffer.expires_at || null,
        image_url: imageUrl,
        is_active: true
      };

      const { error } = await supabase
        .from('offers')
        .insert([offerData]);

      if (error) {
        console.error('Error adding offer:', error);
        toast({
          title: "خطأ",
          description: "فشل في إضافة العرض",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "نجح",
        description: "تم إضافة العرض بنجاح",
      });

      setNewOffer({
        title: '',
        description: '',
        discount_percentage: '',
        original_price: '',
        offer_price: '',
        expires_at: '',
        image: null
      });
      setShowAddForm(false);
      fetchOffers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;

    try {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting offer:', error);
        toast({
          title: "خطأ",
          description: "فشل في حذف العرض",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "نجح",
        description: "تم حذف العرض بنجاح",
      });

      fetchOffers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleOfferStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) {
        console.error('Error updating offer status:', error);
        toast({
          title: "خطأ",
          description: "فشل في تحديث حالة العرض",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "نجح",
        description: `تم ${!currentStatus ? 'تفعيل' : 'إلغاء'} العرض بنجاح`,
      });

      fetchOffers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  if (loading) {
    return <div className="text-center">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-right">إدارة العروض</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 hover:bg-green-700"
        >
          {showAddForm ? 'إلغاء' : 'إضافة عرض جديد'}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-right">إضافة عرض جديد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-right">
              <Label htmlFor="title">عنوان العرض *</Label>
              <Input
                id="title"
                value={newOffer.title}
                onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                className="text-right"
                placeholder="أدخل عنوان العرض"
              />
            </div>

            <div className="text-right">
              <Label htmlFor="description">وصف العرض</Label>
              <Textarea
                id="description"
                value={newOffer.description}
                onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                className="text-right"
                placeholder="أدخل وصف العرض"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-right">
                <Label htmlFor="discount">نسبة الخصم (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={newOffer.discount_percentage}
                  onChange={(e) => setNewOffer({ ...newOffer, discount_percentage: e.target.value })}
                  className="text-right"
                  placeholder="25"
                />
              </div>

              <div className="text-right">
                <Label htmlFor="original_price">السعر الأصلي</Label>
                <Input
                  id="original_price"
                  type="number"
                  step="0.01"
                  value={newOffer.original_price}
                  onChange={(e) => setNewOffer({ ...newOffer, original_price: e.target.value })}
                  className="text-right"
                  placeholder="100.00"
                />
              </div>

              <div className="text-right">
                <Label htmlFor="offer_price">سعر العرض</Label>
                <Input
                  id="offer_price"
                  type="number"
                  step="0.01"
                  value={newOffer.offer_price}
                  onChange={(e) => setNewOffer({ ...newOffer, offer_price: e.target.value })}
                  className="text-right"
                  placeholder="75.00"
                />
              </div>
            </div>

            <div className="text-right">
              <Label htmlFor="expires_at">تاريخ انتهاء العرض</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={newOffer.expires_at}
                onChange={(e) => setNewOffer({ ...newOffer, expires_at: e.target.value })}
                className="text-right"
              />
            </div>

            <div className="text-right">
              <Label htmlFor="image">صورة العرض</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setNewOffer({ ...newOffer, image: e.target.files?.[0] || null })}
                className="text-right"
              />
              {newOffer.image && (
                <p className="text-sm text-gray-600 mt-1 text-right">
                  تم اختيار: {newOffer.image.name}
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAddOffer}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 ml-2" />
                إضافة العرض
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {offers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">لا توجد عروض حالياً</p>
            </CardContent>
          </Card>
        ) : (
          offers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {offer.image_url && (
                    <div className="md:w-32 h-32 flex-shrink-0">
                      <img
                        src={offer.image_url}
                        alt={offer.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 text-right">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <Badge variant={offer.is_active ? "default" : "secondary"}>
                          {offer.is_active ? 'نشط' : 'غير نشط'}
                        </Badge>
                        {offer.expires_at && (
                          <Badge variant="outline">
                            ينتهي: {formatDate(offer.expires_at)}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold">{offer.title}</h3>
                    </div>
                    
                    {offer.description && (
                      <p className="text-gray-600 mb-3">{offer.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDeleteOffer(offer.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => toggleOfferStatus(offer.id, offer.is_active)}
                          variant={offer.is_active ? "secondary" : "default"}
                          size="sm"
                        >
                          {offer.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                        </Button>
                      </div>
                      
                      {(offer.original_price || offer.offer_price) && (
                        <div className="flex items-center gap-2">
                          {offer.offer_price && (
                            <span className="text-lg font-bold text-green-600">
                              {offer.offer_price} ج.م
                            </span>
                          )}
                          {offer.original_price && (
                            <span className="text-gray-500 line-through">
                              {offer.original_price} ج.م
                            </span>
                          )}
                          {offer.discount_percentage && (
                            <Badge className="bg-red-500">
                              خصم {offer.discount_percentage}%
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OffersManagement;
