
import OrderForm from '@/components/OrderForm';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <OrderForm />
      
      {/* زر الإدارة المخفي */}
      <Button
        onClick={() => navigate('/admin')}
        variant="ghost"
        size="sm"
        className="fixed bottom-4 left-4 opacity-20 hover:opacity-100 transition-opacity duration-300"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Index;
