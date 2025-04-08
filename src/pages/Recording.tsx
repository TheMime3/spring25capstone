import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Mic, StopCircle, PlayCircle, AlertCircle, ArrowLeft, Download, RefreshCw, Pause, Play, Upload } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useScriptHistoryStore } from '../store/scriptHistoryStore';
import { useVideoStore } from '../store/videoStore';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  countdown: number;
  recordingTime: number;
  isPreviewMode: boolean;
}

const Recording = () => {
  const navigate = useNavigate();
  const { scripts } = useScriptHistoryStore();
  const { uploadVideo } = useVideoStore();
  const selectedScript = scripts[0]; // For now, using the latest script

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const scrollStartTimeRef = useRef<number>(0);
  const recordedBlobRef = useRef<Blob | null>(null);

  // State
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    countdown: 0,
    recordingTime: 0,
    isPreviewMode: false,
  });
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentWord, setCurrentWord] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [hasPermissions, setHasPermissions] = useState<{video: boolean, audio: boolean}>({
    video: false,
    audio: false,
  });

  // Split script into words for highlighting
  const words = selectedScript?.content.split(/\s+/) || [];

  // Handle permissions check
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permissions = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setHasPermissions({ video: true, audio: true });
        permissions.getTracks().forEach(track => track.stop());
      } catch (error) {
        setHasPermissions({ video: false, audio: false });
        setError('Please grant camera and microphone permissions to record.');
      }
    };
    checkPermissions();
  }, []);

  // Handle teleprompter scrolling
  const startTeleprompter = useCallback(() => {
    if (!teleprompterRef.current) return;
    
    const duration = 60000; // 60 seconds
    const startTime = performance.now();
    scrollStartTimeRef.current = startTime;
    
    const scroll = (currentTime: number) => {
      if (!teleprompterRef.current) return;
      
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const totalHeight = teleprompterRef.current.scrollHeight - teleprompterRef.current.clientHeight;
      teleprompterRef.current.scrollTop = totalHeight * progress;
      
      // Update current word
      const wordIndex = Math.floor((words.length * progress));
      setCurrentWord(wordIndex);
      
      if (progress < 1 && state.isRecording && !state.isPaused) {
        animationFrameRef.current = requestAnimationFrame(scroll);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(scroll);
  }, [state.isRecording, state.isPaused, words.length]);

  // Start recording with countdown
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Start countdown
      setState(prev => ({ ...prev, countdown: 3 }));
      
      for (let i = 3; i > 0; i--) {
        setState(prev => ({ ...prev, countdown: i }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        recordedBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setState(prev => ({ ...prev, isRecording: true, countdown: 0 }));
      startTeleprompter();
      
    } catch (error) {
      console.error('Recording error:', error);
      setError('Failed to start recording. Please check your camera and microphone permissions.');
    }
  }, [startTeleprompter]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setState(prev => ({ ...prev, isRecording: false, isPaused: false }));
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Pause/Resume recording
  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return;
    
    setState(prev => {
      const newIsPaused = !prev.isPaused;
      
      if (newIsPaused) {
        mediaRecorderRef.current?.pause();
        cancelAnimationFrame(animationFrameRef.current);
      } else {
        mediaRecorderRef.current?.resume();
        startTeleprompter();
      }
      
      return { ...prev, isPaused: newIsPaused };
    });
  }, [startTeleprompter]);

  // Reset everything
  const resetRecording = useCallback(() => {
    setRecordedVideo(null);
    recordedBlobRef.current = null;
    setState({
      isRecording: false,
      isPaused: false,
      countdown: 0,
      recordingTime: 0,
      isPreviewMode: false,
    });
    setCurrentWord(0);
    
    if (teleprompterRef.current) {
      teleprompterRef.current.scrollTop = 0;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

  // Handle video upload
  const handleUpload = async () => {
    if (!recordedBlobRef.current || !selectedScript) return;

    setIsUploading(true);
    setError(null);

    try {
      const file = new File([recordedBlobRef.current], 'recording.webm', {
        type: 'video/webm'
      });

      await uploadVideo({
        file,
        title: `${selectedScript.title || 'Untitled Script'} - Recording`,
        description: 'Recorded using Presentation Coach',
        scriptId: selectedScript.id
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Upload error:', error);
      setError('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${hasPermissions.video ? 'text-green-400' : 'text-red-400'}`}>
              <Video className="w-4 h-4" />
              Camera
            </div>
            <div className={`flex items-center gap-2 ${hasPermissions.audio ? 'text-green-400' : 'text-red-400'}`}>
              <Mic className="w-4 h-4" />
              Microphone
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-500">Recording Error</h3>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* Video Preview */}
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {state.countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-6xl font-bold">
                    {state.countdown}
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {state.isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-sm font-medium">
                      {state.isPaused ? 'Paused' : 'Recording'}
                    </span>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex justify-center gap-4">
                {!state.isRecording && !recordedVideo && (
                  <button
                    onClick={startRecording}
                    disabled={!hasPermissions.video || !hasPermissions.audio}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Video className="w-5 h-5" />
                    Start Recording
                  </button>
                )}

                {state.isRecording && (
                  <>
                    <button
                      onClick={togglePause}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      {state.isPaused ? (
                        <>
                          <Play className="w-5 h-5" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-5 h-5" />
                          Pause
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <StopCircle className="w-5 h-5" />
                      Stop Recording
                    </button>
                  </>
                )}

                {recordedVideo && (
                  <>
                    <button
                      onClick={resetRecording}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Record Again
                    </button>
                    
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Upload Recording
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Teleprompter */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Your Script</h2>
              <div
                ref={teleprompterRef}
                className="h-[60vh] overflow-y-auto pr-4 space-y-4 teleprompter-scroll"
              >
                {words.map((word, index) => (
                  <span
                    key={index}
                    className={`inline-block mr-1 transition-colors duration-200 ${
                      index === currentWord ? 'text-yellow-400 font-bold' : 'text-gray-300'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Playback */}
          {recordedVideo && (
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-semibold">Preview Recording</h2>
              <video
                src={recordedVideo}
                controls
                className="w-full rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Recording;