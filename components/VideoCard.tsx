
import React from 'react';
import { YouTubeVideo } from '../types';

interface VideoCardProps {
  video: YouTubeVideo;
  onSelect: (video: YouTubeVideo) => void;
  isSelected: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect, isSelected }) => {
  // Color code the performance ratio
  const getRatioColor = (ratio: number) => {
    if (ratio >= 5) return 'text-green-600 bg-green-50 border-green-200';
    if (ratio >= 1.5) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div 
      onClick={() => onSelect(video)}
      className={`group cursor-pointer bg-white rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg ${
        isSelected ? 'border-red-500 ring-2 ring-red-100 shadow-md' : 'border-gray-200 hover:border-red-300'
      }`}
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <span className={`px-2 py-1 rounded text-xs font-bold border ${getRatioColor(video.performanceRatio)}`}>
            지표: {video.performanceRatio}x
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-gray-900 line-clamp-2 text-sm h-10 mb-2 leading-tight">
          {video.title}
        </h3>
        
        <div className="flex flex-col gap-1 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>채널:</span>
            <span className="font-medium text-gray-700">{video.channelTitle}</span>
          </div>
          <div className="flex justify-between">
            <span>구독자:</span>
            <span className="font-medium text-gray-700">{video.subscriberCount.toLocaleString()}명</span>
          </div>
          <div className="flex justify-between">
            <span>조회수:</span>
            <span className="font-medium text-gray-700">{video.viewCount.toLocaleString()}회</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
