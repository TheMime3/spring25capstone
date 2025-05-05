import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Database, Video, FileText, 
  Download, Trash2, ChevronDown, ChevronUp,
  Search, RefreshCw, LogOut
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import PageTransition from '../components/PageTransition';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  questionnaire?: any;
  scripts?: any[];
  videos?: any[];
  isExpanded?: boolean;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .rpc('fetch_admin_user_data');

      if (fetchError) throw fetchError;

      const enrichedUsers = data.map(user => ({
        ...user,
        scripts: Array.isArray(user.scripts) ? user.scripts : [],
        videos: Array.isArray(user.videos) ? user.videos : [],
        isExpanded: false
      }));

      setUsers(enrichedUsers);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (selectedUsers.length === 0) return;
    
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .rpc('export_user_data', { user_ids: selectedUsers });

      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_data_export_${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (selectedUsers.length === 0 || !window.confirm('Are you sure you want to delete the selected users and all their data? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .rpc('bulk_delete_user_data', { user_ids: selectedUsers });

      if (error) throw error;

      await loadUsers();
      setSelectedUsers([]);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleUserExpansion = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isExpanded: !user.isExpanded }
        : user
    ));
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBusinessProfile = (questionnaire: any) => {
    if (!questionnaire) return null;

    const sections = [
      {
        title: 'Basic Information',
        data: questionnaire.basicInfo,
        fields: {
          presentationType: 'Presentation Type',
          audienceSize: 'Audience Size'
        }
      },
      {
        title: 'Business Information',
        data: questionnaire.businessInfo,
        fields: {
          businessName: 'Business Name',
          businessYears: 'Years in Business',
          industry: 'Industry',
          targetAudience: 'Target Audience',
          learningInterests: 'Learning Interests',
          foundUs: 'How They Found Us'
        }
      },
      {
        title: 'Contact Information',
        data: questionnaire.contactInfo,
        fields: {
          contactDetails: 'Contact Details',
          certifications: 'Certifications'
        }
      }
    ];

    return (
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3">{section.title}</h5>
            <dl className="grid grid-cols-1 gap-3">
              {Object.entries(section.fields).map(([key, label]) => (
                <div key={key}>
                  <dt className="text-sm font-medium text-gray-500">{label}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{section.data[key] || 'Not provided'}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    );
  };

  const formatScriptResponses = (script: any) => {
    const questions = {
      coreProblem: 'What is the core problem your business solves?',
      idealCustomer: 'Who is your ideal customer, and how do you help them?',
      businessInspiration: 'What inspired you to start this business?',
      uniqueValue: 'What makes your business unique compared to competitors?',
      keyMessage: 'What is the key message you want customers to remember?',
      customerJourney: 'How do customers typically interact with your product/service?',
      callToAction: 'What is your call to action?'
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h5 className="font-medium text-gray-900">{script.title || 'Untitled Script'}</h5>
            <p className="text-sm text-gray-500">{formatDate(script.created_at)}</p>
          </div>
        </div>

        {/* Script Generator Questions & Responses */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h6 className="font-medium text-gray-900">Script Generator Responses</h6>
          {Object.entries(questions).map(([key, question]) => (
            <div key={key} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
              <p className="text-sm font-medium text-gray-700">{question}</p>
              <p className="mt-1 text-sm text-gray-900">{script[key] || 'Not provided'}</p>
            </div>
          ))}
        </div>

        {/* Generated Script Content */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h6 className="font-medium text-gray-900 mb-2">Generated Script</h6>
          <div className="prose prose-sm max-w-none">
            {script.content}
          </div>
        </div>
      </div>
    );
  };

  const formatVideoData = (video: any) => (
    <div key={video.id} className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="aspect-video mb-2">
        <video
          src={video.url}
          controls
          className="w-full h-full rounded"
          preload="metadata"
        />
      </div>
      <div className="space-y-2">
        <h5 className="font-medium text-gray-900">{video.title}</h5>
        <p className="text-sm text-gray-500">{formatDate(video.created_at)}</p>
        {video.description && (
          <p className="text-sm text-gray-600">{video.description}</p>
        )}
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-100">
        <div className="bg-primary p-4 text-white">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Users className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={loadUsers}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Refresh</span>
                </button>
                
                <button
                  onClick={handleExport}
                  disabled={selectedUsers.length === 0 || isExporting}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  <span>{isExporting ? 'Exporting...' : 'Export Selected'}</span>
                </button>
                
                <button
                  onClick={handleDelete}
                  disabled={selectedUsers.length === 0 || isDeleting}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Selected'}</span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try a different search term' : 'No users have registered yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length}
                          onChange={() => {
                            if (selectedUsers.length === filteredUsers.length) {
                              setSelectedUsers([]);
                            } else {
                              setSelectedUsers(filteredUsers.map(user => user.id));
                            }
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Content
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <>
                        <tr key={user.id} className={user.isExpanded ? 'bg-gray-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-4">
                              <div className="flex items-center text-sm text-gray-500">
                                <Database className="h-4 w-4 mr-1" />
                                {user.questionnaire ? '1' : '0'}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <FileText className="h-4 w-4 mr-1" />
                                {user.scripts?.length || 0}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Video className="h-4 w-4 mr-1" />
                                {user.videos?.length || 0}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => toggleUserExpansion(user.id)}
                              className="text-primary hover:text-primary-dark"
                            >
                              {user.isExpanded ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                          </td>
                        </tr>
                        {user.isExpanded && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 bg-gray-50">
                              <div className="space-y-6">
                                {user.questionnaire && (
                                  <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Business Profile</h4>
                                    {formatBusinessProfile(user.questionnaire)}
                                  </div>
                                )}

                                {user.scripts && user.scripts.length > 0 && (
                                  <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Scripts</h4>
                                    <div className="space-y-6">
                                      {user.scripts.map((script: any) => formatScriptResponses(script))}
                                    </div>
                                  </div>
                                )}

                                {user.videos && user.videos.length > 0 && (
                                  <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Videos</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {user.videos.map((video: any) => formatVideoData(video))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;