import { useEffect, useState } from 'react';

function Home() {
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/optimized/banner1.webp';
    img.onload = () => setBannerLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="relative">
        <div 
          className={`w-full h-[500px] transition-opacity duration-500 ${bannerLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage: 'url("/optimized/banner1.webp")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        {/* Rest of your component code */}
      </div>
    </div>
  );
}

export default Home; 