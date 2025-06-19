
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SettingsTabProps {
  logo: string | null;
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SettingsTab = ({ logo, onLogoUpload }: SettingsTabProps) => {
  return (
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
            onChange={onLogoUpload}
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
  );
};

export default SettingsTab;
