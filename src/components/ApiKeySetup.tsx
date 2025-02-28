import { useState } from 'react';
import { Key, Save, AlertCircle } from 'lucide-react';

interface ApiKeySetupProps {
  onSave: (apiKey: string) => void;
  onCancel: () => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onSave, onCancel }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter your OpenAI API key');
      return;
    }
    
    if (!apiKey.startsWith('sk-')) {
      setError('This doesn\'t look like a valid OpenAI API key. Keys typically start with "sk-"');
      return;
    }
    
    setIsSaving(true);
    
    // Simulate saving the API key
    setTimeout(() => {
      onSave(apiKey);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <div className="flex items-center mb-4">
        <Key className="h-6 w-6 text-primary mr-2" />
        <h2 className="text-xl font-semibold text-black">OpenAI API Key Setup</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        To generate scripts with AI, you'll need to provide your OpenAI API key. This key will be stored securely in your browser.
      </p>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            OpenAI API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setError(null);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            placeholder="sk-..."
          />
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 inline mr-1" />
                Save API Key
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-xs text-gray-500">
        <p>Don't have an OpenAI API key?</p>
        <a 
          href="https://platform.openai.com/api-keys" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Get one from the OpenAI platform
        </a>
      </div>
    </div>
  );
};

export default ApiKeySetup;