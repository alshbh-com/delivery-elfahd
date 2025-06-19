
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Users } from 'lucide-react';
import { Worker } from '@/types';

interface WorkersTabProps {
  workers: Worker[];
  onAddWorker: (worker: { name: string; whatsappNumber: string }) => void;
  onToggleWorkerStatus: (workerId: string, currentStatus: 'active' | 'inactive') => void;
  onDeleteWorker: (id: string) => void;
  loading: boolean;
}

const WorkersTab = ({ workers, onAddWorker, onToggleWorkerStatus, onDeleteWorker, loading }: WorkersTabProps) => {
  const [newWorker, setNewWorker] = useState({ name: '', whatsappNumber: '' });

  const handleAddWorker = () => {
    onAddWorker(newWorker);
    setNewWorker({ name: '', whatsappNumber: '' });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري تحميل العمال...</p>
      </div>
    );
  }

  return (
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
          <Button onClick={handleAddWorker} className="mt-4 bg-green-600 hover:bg-green-700">
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
                      onClick={() => onDeleteWorker(worker.id)}
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
                          onCheckedChange={() => onToggleWorkerStatus(worker.id, worker.status)}
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
  );
};

export default WorkersTab;
