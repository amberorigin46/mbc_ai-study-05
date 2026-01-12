
import { YouTubeVideo } from '../types';

export type VideoType = 'all' | 'short' | 'long';

export const searchVideos = async (
  apiKey: string,
  keyword: string, 
  videoType: VideoType = 'all'
): Promise<YouTubeVideo[]> => {
  if (!apiKey) throw new Error("YouTube API 키를 입력해주세요.");

  try {
    let durationParam = '';
    if (videoType === 'short') durationParam = '&videoDuration=short';
    else if (videoType === 'long') durationParam = '&videoDuration=medium'; // 4~20분 내외

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(keyword)}&type=video${durationParam}&key=${apiKey}`;
    
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      throw new Error(errorData.error?.message || "YouTube API 호출에 실패했습니다.");
    }
    const searchData = await searchResponse.json();
    
    const validItems = (searchData.items || []).filter((item: any) => item.id && item.id.videoId);
    if (validItems.length === 0) return [];

    const videoIds = validItems.map((item: any) => item.id.videoId).join(',');
    
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`;
    const statsResponse = await fetch(statsUrl);
    const statsData = await statsResponse.json();

    const channelIds = Array.from(new Set(statsData.items.map((item: any) => item.snippet.channelId))).join(',');
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=${apiKey}`;
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();

    const channelMap = new Map();
    channelData.items.forEach((item: any) => {
      const subCount = parseInt(item.statistics.subscriberCount);
      channelMap.set(item.id, isNaN(subCount) || subCount === 0 ? 1 : subCount);
    });

    return statsData.items.map((item: any): YouTubeVideo => {
      const subs = channelMap.get(item.snippet.channelId) || 1;
      const views = parseInt(item.statistics.viewCount) || 0;
      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        viewCount: views,
        subscriberCount: subs,
        performanceRatio: Number((views / subs).toFixed(2))
      };
    });
  } catch (error: any) {
    console.error("YouTube Service Error:", error);
    throw error;
  }
};

export const getVideoComments = async (apiKey: string, videoId: string): Promise<string[]> => {
  if (!apiKey) return [];
  try {
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=50&videoId=${videoId}&key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.items || []).map((item: any) => item.snippet.topLevelComment.snippet.textDisplay);
  } catch (error) {
    return [];
  }
};
