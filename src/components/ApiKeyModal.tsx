import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import ApiKeySetup from './ApiKeySetup';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleSave = (apiKey: string) => {
    onSave(apiKey);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className={`fixed inset-0 transition-opacity ${isClosing ? 'opacity-0' : 'opacity-100'}`}
          style={{ transitionDuration: '300ms' }}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div 
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
            isClosing ? 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95' : 'opacity-100 translate-y-0 sm:scale-100'
          }`}
          style={{ transitionDuration: '300ms' }}
        >
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={handleClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6">
            <ApiKeySetup onSave={handleSave} onCancel={handleClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;