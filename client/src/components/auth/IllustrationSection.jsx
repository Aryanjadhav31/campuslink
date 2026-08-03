import React, { useState } from 'react';

const IllustrationSection = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative w-full max-w-sm mx-auto mt-8 mb-4 flex items-center justify-center">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#121212] border border-[#262626] p-2">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#121212] rounded-xl">
            <span className="text-xs text-zinc-500">Loading preview...</span>
          </div>
        )}

        <img
          src="/campus_collaboration.png"
          alt="CampusLink Student Network"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover rounded-xl transition-opacity duration-300 ${imageLoaded ? 'opacity-90' : 'opacity-0'
            }`}
        />
      </div>
    </div>
  );
};

export default IllustrationSection;
