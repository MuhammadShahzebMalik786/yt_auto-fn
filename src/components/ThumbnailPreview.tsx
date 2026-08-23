'use client';

import { useState } from 'react';

interface ThumbnailPreviewProps {
  topicId: number;
  slug: string;
  className?: string;
}

export default function ThumbnailPreview({ topicId, slug, className = "" }: ThumbnailPreviewProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Construct URL based on backend static route convention
  // e.g. static/projects/1_the_death_of_the_9_to_5/thumbnail.jpg
  const sanitizedSlug = slug.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const thumbUrl = `http://localhost:8000/static/projects/${topicId}_${sanitizedSlug}/thumbnail.jpg`;

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 border border-gray-800 ${className}`}>
        <div className="text-center text-gray-600 flex flex-col items-center">
          <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <span className="text-xs uppercase tracking-wider font-bold">Thumbnail Unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 skeleton-shimmer z-10"></div>
      )}
      <img
        src={thumbUrl}
        alt="Video Thumbnail"
        className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {loaded && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none"></div>
      )}
    </div>
  );
}
