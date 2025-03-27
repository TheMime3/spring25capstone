import { useState, useEffect } from 'react';

export const useOpenAI = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isKeyValid, setIsKeyValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if API key exists in localStorage
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsKeyValid(true);
    }
    setIsLoading(false);
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem('openai_api_key', key);
    setApiKey(key);
    setIsKeyValid(true);
    
    // Update environment variable (this is a client-side only approach)
    // In a real production app, you'd want to handle this more securely
    if (import.meta.env.DEV) {
      (window as any).VITE_OPENAI_API_KEY = key;
    }
    
    return true;
  };

  const clearApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey(null);
    setIsKeyValid(false);
  };

  return {
    apiKey,
    isKeyValid,
    isLoading,
    saveApiKey,
    clearApiKey
  };
};