import React from 'react';
import { VideoSuggestion } from '../types';
// FIX: Corrected import path for icons.
import { PlayIcon } from './icons'; // Import the new PlayIcon

interface VideoSuggestionsDisplayProps {
  videos: VideoSuggestion[];
}

const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname === '/watch') {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1];
      } else if (urlObj.pathname.startsWith('/shorts/')) {
        videoId = urlObj.pathname.split('/shorts/')[1];
      }
    }
  } catch (e) {
    // console.warn(`Could not parse URL for YouTube video ID: ${url}`, e); // Keep console clean for user
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }
  }
  return videoId;
};


const VideoSuggestionsDisplay: React.FC<VideoSuggestionsDisplayProps> = ({ videos }) => {
  if (!videos || videos.length === 0) {
    return (
      <div className="mt-3 pt-3.5 border-t border-slate-200">
        <p className="text-sm text-slate-600 italic">No relevant videos found for this query.</p>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-200">
      <h4 className="text-sm font-semibold text-slate-700 mb-2.5">Relevant Videos:</h4>
      <div className="space-y-3">
        {videos.map((video) => {
          const videoId = getYoutubeVideoId(video.link);
          const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

          return (
            <a
              key={video.id}
              href={video.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start p-3 bg-white rounded-lg shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-150 group"
            >
              <div className="relative w-24 h-auto aspect-video mr-3 shrink-0">
                {thumbnailUrl ? (
                  <>
                    <img 
                      src={thumbnailUrl} 
                      alt={`Thumbnail for ${video.title}`} 
                      className="w-full h-full object-cover rounded border border-slate-200"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-150 rounded opacity-0 group-hover:opacity-100">
                      <PlayIcon className="w-8 h-8 text-white opacity-90" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200 rounded text-3xl">
                    📺
                  </div>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <h5
                  className="text-sm font-medium text-blue-600 group-hover:text-blue-800 group-hover:underline truncate"
                  title={video.title}
                >
                  {video.title}
                </h5>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2" title={video.description}>
                  {video.description}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default VideoSuggestionsDisplay;