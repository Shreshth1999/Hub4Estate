import { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
  showControls?: boolean;
}

export function ImagePreview({ src, alt = 'Image', className = '', showControls = true }: ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    link.click();
  };

  const resetZoom = () => setZoom(1);

  return (
    <>
      {/* Thumbnail - Click to open */}
      <div
        className={`relative cursor-pointer group ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-image.png';
          }}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center rounded-lg">
          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
        </div>
      </div>

      {/* Full Screen Preview Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={() => {
            setIsOpen(false);
            resetZoom();
          }}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              resetZoom();
            }}
            className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <X size={24} />
          </button>

          {/* Controls */}
          {showControls && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                className="text-white hover:text-blue-400 transition-colors p-2"
                disabled={zoom <= 0.5}
              >
                <ZoomOut size={20} />
              </button>

              <span className="text-white font-medium min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                className="text-white hover:text-blue-400 transition-colors p-2"
                disabled={zoom >= 3}
              >
                <ZoomIn size={20} />
              </button>

              <div className="w-px h-6 bg-white bg-opacity-30 mx-2" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="text-white hover:text-blue-400 transition-colors p-2"
              >
                <Download size={20} />
              </button>
            </div>
          )}

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.png';
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

// Gallery component for multiple images
interface ImageGalleryProps {
  images: string[];
  className?: string;
}

export function ImageGallery({ images, className = '' }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
      setZoom(1);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
      setZoom(1);
    }
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="relative cursor-pointer group aspect-square overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all"
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={image}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={() => {
            setSelectedIndex(null);
            setZoom(1);
          }}
        >
          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(null);
              setZoom(1);
            }}
            className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full"
          >
            <X size={24} />
          </button>

          {/* Previous */}
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoom(prev => Math.max(prev - 0.5, 0.5));
              }}
              className="text-white hover:text-blue-400 transition-colors p-2"
            >
              <ZoomOut size={20} />
            </button>

            <span className="text-white font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoom(prev => Math.min(prev + 0.5, 3));
              }}
              className="text-white hover:text-blue-400 transition-colors p-2"
            >
              <ZoomIn size={20} />
            </button>
          </div>

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex]}
              alt={`Image ${selectedIndex + 1}`}
              className="transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
        </div>
      )}
    </>
  );
}
