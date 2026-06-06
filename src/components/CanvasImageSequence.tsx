import React, { useRef, useEffect, useState } from 'react';

interface CanvasImageSequenceProps {
  progress: number; // 0 to 1
}

const TOTAL_FRAMES = 240;

const currentFrame = (index: number) =>
  `/images/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

export default function CanvasImageSequence({ progress }: CanvasImageSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const [firstLoaded, setFirstLoaded] = useState(false);
  const progressRef = useRef(progress);

  // Keep progressRef updated for onload callbacks
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const renderFrame = (p: number) => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    
    // ensure progress is 0-1, map to 0-239
    const targetIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(p * TOTAL_FRAMES)));
    
    // Find closest loaded image
    let imgToDraw = imagesRef.current[targetIndex];
    if (!imgToDraw || !imgToDraw.complete) {
      for (let i = targetIndex; i >= 0; i--) {
        if (imagesRef.current[i] && imagesRef.current[i]!.complete) {
          imgToDraw = imagesRef.current[i];
          break;
        }
      }
    }
    
    if (imgToDraw && imgToDraw.complete) {
      const canvas = canvasRef.current;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = imgToDraw.width;
      const imgHeight = imgToDraw.height;

      const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
      const x = (canvasWidth / 2) - (imgWidth / 2) * scale;
      const y = (canvasHeight / 2) - (imgHeight / 2) * scale;

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.drawImage(imgToDraw, x, y, imgWidth * scale, imgHeight * scale);
    }
  };

  // Preload images
  useEffect(() => {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        imagesRef.current[i - 1] = img;
        if (i === 1) {
          setFirstLoaded(true);
        }
        // If this image is the one currently needed, render it
        const targetIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(progressRef.current * TOTAL_FRAMES)));
        if (i - 1 === targetIndex) {
          requestAnimationFrame(() => renderFrame(progressRef.current));
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set canvas size and render on resize
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        requestAnimationFrame(() => renderFrame(progress));
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize(); // Initial setup
    return () => window.removeEventListener('resize', updateSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render when progress changes
  useEffect(() => {
    requestAnimationFrame(() => renderFrame(progress));
  }, [progress]);

  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-[#0a0a0a] pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
      {!firstLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-10">
          <div className="text-white text-sm uppercase tracking-widest flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-t-[#00C896] border-white/20 rounded-full animate-spin mb-4"></div>
            Loading Experience...
          </div>
        </div>
      )}
      {/* Subtle vignette for premium look */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/90 pointer-events-none mix-blend-multiply z-10"></div>
    </div>
  );
}
