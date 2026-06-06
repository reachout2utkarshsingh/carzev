import React, { useRef, useEffect, useState } from 'react';

interface CanvasImageSequenceProps {
  progress: number; // 0 to 1
}

const TOTAL_FRAMES = 240;

const currentFrame = (index: number) =>
  `/images/ezgif-frame-${index.toString().padStart(3, '0')}.webp`;

export default function CanvasImageSequence({ progress }: CanvasImageSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const [firstLoaded, setFirstLoaded] = useState(false);
  
  const progressRef = useRef(progress);
  const targetIndexRef = useRef(0);
  const loadingSetRef = useRef<Set<number>>(new Set());
  const pendingQueueRef = useRef<number[]>([]);

  const renderFrame = (p: number) => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    
    // ensure progress is 0-1, map to 0-239
    const targetIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(p * TOTAL_FRAMES)));
    
    // Find closest loaded image (search outwards from targetIndex)
    let imgToDraw = imagesRef.current[targetIndex];
    if (!imgToDraw || !imgToDraw.complete) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = targetIndex - offset;
        const next = targetIndex + offset;
        
        if (prev >= 0 && imagesRef.current[prev] && imagesRef.current[prev]!.complete) {
          imgToDraw = imagesRef.current[prev];
          break;
        }
        if (next < TOTAL_FRAMES && imagesRef.current[next] && imagesRef.current[next]!.complete) {
          imgToDraw = imagesRef.current[next];
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

  const loadFrame = (idx: number) => {
    if (imagesRef.current[idx] || loadingSetRef.current.has(idx)) return;
    
    loadingSetRef.current.add(idx);
    const img = new Image();
    img.src = currentFrame(idx + 1);
    
    img.onload = () => {
      imagesRef.current[idx] = img;
      loadingSetRef.current.delete(idx);
      
      // If this image is the one currently needed, render it
      const currentTarget = targetIndexRef.current;
      if (idx === currentTarget) {
        requestAnimationFrame(() => renderFrame(progressRef.current));
      }
      
      startNextDownloads();
    };
    
    img.onerror = () => {
      loadingSetRef.current.delete(idx);
      startNextDownloads();
    };
  };

  const startNextDownloads = () => {
    const targetIndex = targetIndexRef.current;
    
    // Clean queue of already loaded/loading
    pendingQueueRef.current = pendingQueueRef.current.filter(
      (idx) => !imagesRef.current[idx] && !loadingSetRef.current.has(idx)
    );
    
    if (pendingQueueRef.current.length === 0) return;
    
    // Sort queue by priority score:
    // Keyframes (divisible by 8) are prioritized. Within keyframes / non-keyframes, sort by distance to current frame.
    pendingQueueRef.current.sort((a, b) => {
      const distA = Math.abs(a - targetIndex);
      const distB = Math.abs(b - targetIndex);
      
      const isKeyA = a % 8 === 0 || a === 0 || a === TOTAL_FRAMES - 1;
      const isKeyB = b % 8 === 0 || b === 0 || b === TOTAL_FRAMES - 1;
      
      const scoreA = isKeyA ? distA / 10 : distA;
      const scoreB = isKeyB ? distB / 10 : distB;
      
      return scoreA - scoreB;
    });
    
    const MAX_CONCURRENT = 4;
    const slotsAvailable = MAX_CONCURRENT - loadingSetRef.current.size;
    
    for (let i = 0; i < slotsAvailable && i < pendingQueueRef.current.length; i++) {
      const nextIdx = pendingQueueRef.current[i];
      loadFrame(nextIdx);
    }
  };

  // Preload first frame immediately, queue the rest when it's done
  useEffect(() => {
    const firstImg = new Image();
    firstImg.src = currentFrame(1);
    firstImg.onload = () => {
      imagesRef.current[0] = firstImg;
      setFirstLoaded(true);
      requestAnimationFrame(() => renderFrame(progressRef.current));
      
      // Initialize queue with all other frame indices
      const queue = [];
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        queue.push(i);
      }
      pendingQueueRef.current = queue;
      startNextDownloads();
    };
    firstImg.onerror = () => {
      console.error("Failed to load first frame");
      setFirstLoaded(true);
      const queue = [];
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        queue.push(i);
      }
      pendingQueueRef.current = queue;
      startNextDownloads();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update refs and trigger prioritized downloads when scroll progress changes
  useEffect(() => {
    progressRef.current = progress;
    targetIndexRef.current = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(progress * TOTAL_FRAMES)));
    requestAnimationFrame(() => renderFrame(progress));
    startNextDownloads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  // Set canvas size and render on resize
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        requestAnimationFrame(() => renderFrame(progressRef.current));
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize(); // Initial setup
    return () => window.removeEventListener('resize', updateSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/55 pointer-events-none z-10"></div>
      {/* Subtle vignette for premium look */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/90 pointer-events-none mix-blend-multiply z-10"></div>
    </div>
  );
}
