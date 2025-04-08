import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useVideoStore } from '../store/videoStore';
import { Video } from '../types/video';

const VideoList: React.FC = () => {
  const { videos, getVideos, deleteVideo, isLoading } = useVideoStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    getVideos().catch(console.error);
  }, [getVideos]);

  const handleDelete = async (id: string) => {
    try {
      await deleteVideo(id);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No videos uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="space-y-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{video.title}</h3>
                  <p className="text-sm text-gray-500">{formatDate(video.createdAt)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowDeleteConfirm(video.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete video"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {video.description && (
                <p className="mt-2 text-sm text-gray-600">{video.description}</p>
              )}
              <div className="mt-4">
                <video
                  src={video.url}
                  controls
                  className="w-full rounded-lg"
                  preload="metadata"
                />
              </div>
            </div>

            {showDeleteConfirm === video.id && (
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-700 mb-4">
                  Are you sure you want to delete this video? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoList;