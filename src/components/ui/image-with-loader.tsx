import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  blurDataUrl?: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  onClick?: () => void;
}

/**
 * Image component with:
 * - Shimmer skeleton loader while loading
 * - Blur-up effect (shows low-quality placeholder first)
 * - Smooth fade-in on load
 */
export function ImageWithLoader({
  src,
  alt,
  className = '',
  containerClassName = '',
  blurDataUrl = '',
  width,
  height,
  fill = false,
  objectFit = 'cover',
  onClick,
}: ImageWithLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setIsLoading(false);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const containerStyle = fill
    ? { position: 'absolute' as const, inset: 0 }
    : { width, height };

  return (
    <div
      className={cn('relative overflow-hidden', onClick && 'cursor-pointer', containerClassName)}
      style={containerStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Shimmer skeleton loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 via-neutral-50 to-neutral-100 animate-shimmer" />
      )}

      {/* Blur-up placeholder */}
      {blurDataUrl && !imageLoaded && (
        <img
          src={blurDataUrl}
          alt=""
          aria-hidden="true"
          className={cn('absolute inset-0 w-full h-full', objectFit === 'cover' ? 'object-cover' : `object-${objectFit}`)}
        />
      )}

      {/* Main image */}
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            objectFit === 'cover' ? 'object-cover' : `object-${objectFit}`,
            imageLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-200">
          <div className="text-center">
            <div className="text-neutral-400 text-sm font-medium">Failed to load image</div>
          </div>
        </div>
      )}
    </div>
  );
}
