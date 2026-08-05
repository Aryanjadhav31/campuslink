import React, { useState } from 'react';

const SingleImageRenderer = ({ src, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [orientation, setOrientation] = useState('landscape'); // 'portrait' | 'landscape' | 'square'
  const [aspectRatio, setAspectRatio] = useState(null);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      const ratio = naturalWidth / naturalHeight;
      setAspectRatio(ratio);

      if (naturalHeight > naturalWidth) {
        setOrientation('portrait');
      } else if (naturalWidth > naturalHeight) {
        setOrientation('landscape');
      } else {
        setOrientation('square');
      }
    }
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  if (hasError) return null;

  // Orientation-specific max-width & max-height container classes
  const getOrientationClasses = () => {
    switch (orientation) {
      case 'portrait':
        return 'w-full sm:w-auto max-w-full sm:max-w-[80%] md:max-w-[400px] max-h-[600px]';
      case 'square':
        return 'w-full sm:w-auto max-w-full sm:max-w-[80%] md:max-w-[450px] max-h-[450px] aspect-square';
      case 'landscape':
      default:
        return 'w-full sm:w-auto max-w-full sm:max-w-[80%] md:max-w-[650px] max-h-[550px]';
    }
  };

  return (
    <div className="my-3 sm:my-4 w-full flex items-center justify-center cursor-pointer select-none">
      <div 
        onClick={onClick}
        className={`relative overflow-hidden rounded-[16px] bg-[#111111] border border-gray-200/50 dark:border-[#1F1F1F] shadow-[0_4px_20px_rgba(0,0,0,0.12)] flex items-center justify-center transition-all duration-300 hover:scale-[1.01] group ${getOrientationClasses()}`}
        style={{
          aspectRatio: !isLoaded && aspectRatio ? `${aspectRatio}` : undefined
        }}
      >
        {/* Skeleton loader before image loads */}
        {!isLoaded && (
          <div className="w-full h-64 bg-gray-200 dark:bg-[#1A1A1A] animate-pulse rounded-[16px] flex items-center justify-center min-w-[280px]">
            <div className="w-7 h-7 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Portrait Ambient Blur Background */}
        {orientation === 'portrait' && isLoaded && (
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${src})` }}
          />
        )}

        {/* Main Single Image */}
        <img
          src={src}
          alt="Post Content"
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-auto object-contain rounded-[16px] relative z-10 transition-opacity duration-300 ease-out ${
            !isLoaded ? 'opacity-0 absolute inset-0 h-full w-full' : 'opacity-100'
          }`}
        />
      </div>
    </div>
  );
};

const MultiImageItem = ({ src, alt, onClick, isLastAndMore, remainingCount }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      onClick={onClick}
      className="relative w-full h-full overflow-hidden bg-[#111111] cursor-pointer group rounded-xl"
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-[#1A1A1A] animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      <img 
        src={src} 
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-[1.03] ${
          !isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Glassmorphism +N overlay */}
      {isLastAndMore && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all group-hover:bg-black/70">
          <span className="text-white font-bold text-xl sm:text-2xl tracking-wide drop-shadow-md">
            +{remainingCount + 1}
          </span>
        </div>
      )}
    </div>
  );
};

const MultiImageRenderer = ({ images, onImageClick }) => {
  const count = images.length;

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1.5 rounded-[16px] overflow-hidden mb-3 bg-[#111111]">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-[4/3] sm:aspect-square">
            <MultiImageItem
              src={img}
              alt={`Photo ${idx + 1}`}
              onClick={() => onImageClick(idx)}
            />
          </div>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-3 gap-1.5 rounded-[16px] overflow-hidden mb-3 max-h-[450px] bg-[#111111]">
        {/* Main large image */}
        <div className="col-span-2 relative aspect-[4/3] sm:aspect-[16/10]">
          <MultiImageItem
            src={images[0]}
            alt="Photo 1"
            onClick={() => onImageClick(0)}
          />
        </div>
        
        {/* 2 stacked side images */}
        <div className="col-span-1 grid grid-rows-2 gap-1.5 h-full">
          {images.slice(1, 3).map((img, idx) => (
            <div key={idx + 1} className="relative w-full h-full">
              <MultiImageItem
                src={img}
                alt={`Photo ${idx + 2}`}
                onClick={() => onImageClick(idx + 1)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4 or 5+ images
  const displayImages = images.slice(0, 4);
  const remainingCount = count - 4;

  return (
    <div className="grid grid-cols-2 gap-1.5 rounded-[16px] overflow-hidden mb-3 bg-[#111111]">
      {displayImages.map((img, idx) => {
        const isLastAndMore = idx === 3 && remainingCount > 0;

        return (
          <div key={idx} className="relative aspect-square">
            <MultiImageItem
              src={img}
              alt={`Photo ${idx + 1}`}
              onClick={() => onImageClick(idx)}
              isLastAndMore={isLastAndMore}
              remainingCount={remainingCount}
            />
          </div>
        );
      })}
    </div>
  );
};

const PostImageGrid = ({ images, onImageClick }) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    return (
      <div className="mb-3">
        <SingleImageRenderer src={images[0]} onClick={() => onImageClick(0)} />
      </div>
    );
  }

  return <MultiImageRenderer images={images} onImageClick={onImageClick} />;
};

export default PostImageGrid;

