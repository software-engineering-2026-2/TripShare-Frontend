import { useState, type ReactNode } from 'react';
import type { PlacePhoto as Photo } from '../../resources/api/places/contract';

interface PlacePhotoProps {
  photo: Photo | null;
  className: string;
  fallback?: ReactNode;
  altFallback?: string;
}

export default function PlacePhoto({
  photo,
  className,
  fallback = null,
  altFallback = '',
}: PlacePhotoProps) {
  const [failedUrl, setFailedUrl] = useState<string>();
  if (!photo || photo.url === failedUrl) return fallback;

  return (
    <img
      className={className}
      src={photo.url}
      alt={photo.altText ?? altFallback}
      loading="lazy"
      onError={() => setFailedUrl(photo.url)}
    />
  );
}
