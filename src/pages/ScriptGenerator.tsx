import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ScriptGenerator = () => {
  const { isAuthenticated } = useAuth();

  // Update the useEffect hook in ScriptGenerator.tsx to load scripts on mount
  useEffect(() => {
    if (isAuthenticated) {
      getScripts().catch(console.error);
    }
  }, [isAuthenticated, getScripts]);

  return (
    <div>
      {/* Component content */}
    </div>
  );
};

export default ScriptGenerator;