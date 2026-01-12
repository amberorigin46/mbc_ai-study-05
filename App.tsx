
import React, { useState, useEffect } from 'react';
import { YouTubeVideo, AnalysisResult } from './types';
import { searchVideos, getVideoComments, VideoType } from './services/youtubeService';
import { analyzeContent } from './services/geminiService';
import VideoCard from './components/VideoCard';
import AnalysisView from './components/AnalysisView';

const App: React.FC = () => {
  const [ytApiKey, setYtApiKey] = useState(() => localStorage.getItem('yt_api_key') || '');
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [keyword, setKeyword] = useState('');
  const [videoType, setVideoType] = useState<VideoType>('all');
  const [minRatio, setMinRatio] = useState<number>(0);
  
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    localStorage.setItem('yt_api_key', ytApiKey);
  }, [ytApiKey]);

  useEffect(() => {
    localStorage.setItem('gemini_api_key', geminiApiKey);
  }, [geminiApiKey]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ytApiKey) {
      setError('YouTube API 키를 먼저 입력해주세요 (상단 설정).');
      return;
    }
    if (!keyword.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedVideo(null);
    setAnalysisResult(null);

    try {
      const results = await searchVideos(ytApiKey, keyword, videoType);
      if (results.length === 0) {
        setError('검색 결과가 없습니다. 키워드나 필터를 변경해보세요.');
      } else {
        const sorted = results.sort((a, b) => b.performanceRatio - a.performanceRatio);
        setVideos(sorted);
      }
    } catch (err: any) {
      setError(err.message || '검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(v => v.performanceRatio >= minRatio);

  const handleAnalyze = async (video: YouTubeVideo) => {
    if (!geminiApiKey) {
      setError('Gemini API 키를 먼저 입력해주세요 (상단 설정).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setSelectedVideo(video);
    setAnalysisLoading(true);
    setAnalysisResult(null);
    setError(null);
    
    try {
      const comments = await getVideoComments(ytApiKey, video.id);
      const result = await analyzeContent(geminiApiKey, video.title, video.description, comments);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Top Utility Bar for API Keys */}
      <div className="bg-gray-900 text-white py-2 px-4 text-[10px] sm:text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">YouTube Key:</span>
              <input 
                type="password"
                value={ytApiKey}
                onChange={(e) => setYtApiKey(e.target.value)}
                placeholder="YouTube API Key"
                className="bg-gray-800 border-none rounded px-2 py-1 text-white w-32 sm:w-40 focus:ring-1 focus:ring-red-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Gemini Key:</span>
              <input 
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Gemini API Key"
                className="bg-gray-800 border-none rounded px-2 py-1 text-white w-32 sm:w-40 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="hidden md:block">
            <span className="text-gray-500">System Ready.</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-5 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505a3.017 3.017 0 0 0-2.122 2.136C0 8.055 0 12 0 12s0 3.945.501 5.814a3.017 3.017 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.945 24 12 24 12s0-3.945-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">TubeTrend <span className="text-red-600">Expert</span></h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Viral Script Planner</p>
              </div>
            </div>

            <div className="flex-1 max-w-2xl w-full">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="분석하고 싶은 주제 검색..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all outline-none"
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? '검색중..' : '영상 발굴'}
                </button>
              </form>
              
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  {(['all', 'short', 'long'] as VideoType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setVideoType(type)}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                        videoType === type ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      {type === 'all' ? '전체' : type === 'short' ? '쇼츠' : '롱폼'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400">바이럴 비율:</span>
                  {[0, 1.5, 3, 5].map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setMinRatio(ratio)}
                      className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                        minRatio === ratio ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-400 border-gray-100'
                      }`}
                    >
                      {ratio === 0 ? '전체' : `${ratio}x+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Video Grid */}
          <div className={`lg:col-span-${selectedVideo ? '5' : '12'} space-y-6`}>
            {filteredVideos.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">검색 결과 ({filteredVideos.length})</h2>
              </div>
            )}
            
            <div className={`grid grid-cols-1 ${selectedVideo ? 'sm:grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-4`}>
              {filteredVideos.map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  onSelect={handleAnalyze}
                  isSelected={selectedVideo?.id === video.id}
                />
              ))}
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 text-xs mt-3 font-medium">콘텐츠를 탐색하고 있습니다...</p>
              </div>
            )}
            
            {!loading && videos.length === 0 && !error && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm font-medium">키워드를 입력해 바이럴 소재를 찾아보세요.</p>
              </div>
            )}
          </div>

          {/* Analysis View Area */}
          {(selectedVideo || analysisLoading) && (
            <div className="lg:col-span-7 sticky top-28 h-fit">
              {analysisLoading ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center animate-pulse shadow-sm">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">AI 정밀 분석 중</h3>
                  <p className="text-gray-500 text-sm mt-2">댓글과 시청 패턴을 분석하여 기획안을 도출하고 있습니다.</p>
                </div>
              ) : analysisResult && (
                <AnalysisView 
                  video={selectedVideo!} 
                  result={analysisResult} 
                  geminiApiKey={geminiApiKey}
                  onClose={() => {
                    setSelectedVideo(null);
                    setAnalysisResult(null);
                  }} 
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
