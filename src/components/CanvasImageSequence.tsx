import React, { useRef, useEffect, useState } from 'react';
import { MotionValue } from 'motion/react';

interface CanvasImageSequenceProps {
  progress: MotionValue<number>;
}

const TOTAL_FRAMES = 240;
const IMG_WIDTH = 1903;
const IMG_HEIGHT = 987;

const currentFrame = (index: number) =>
  `/images/ezgif-frame-${index.toString().padStart(3, '0')}.webp`;

export default function CanvasImageSequence({ progress }: CanvasImageSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const [firstLoaded, setFirstLoaded] = useState(false);
  
  const progressRef = useRef(progress.get());
  const targetIndexRef = useRef(Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(progress.get() * TOTAL_FRAMES))));
  const loadingSetRef = useRef<Set<number>>(new Set());
  const pendingQueueRef = useRef<number[]>([]);
  const lastDrawnIndexRef = useRef<number>(-1);

  const lastDownloadCheckRef = useRef(0);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const renderFrame = (p: number) => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    
    // ensure progress is 0-1, map to 0-239
    const targetIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(p * TOTAL_FRAMES)));
    
    // Find closest loaded image (search outwards from targetIndex)
    let imgToDraw = imagesRef.current[targetIndex];
    let drawIndex = targetIndex;
    if (!imgToDraw || !imgToDraw.complete) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = targetIndex - offset;
        const next = targetIndex + offset;
        
        if (prev >= 0 && imagesRef.current[prev] && imagesRef.current[prev]!.complete) {
          imgToDraw = imagesRef.current[prev];
          drawIndex = prev;
          break;
        }
        if (next < TOTAL_FRAMES && imagesRef.current[next] && imagesRef.current[next]!.complete) {
          imgToDraw = imagesRef.current[next];
          drawIndex = next;
          break;
        }
      }
    }
    
    // Skip drawing if the frame is identical to the last drawn frame
    if (drawIndex === lastDrawnIndexRef.current) {
      return;
    }
    
    if (imgToDraw && imgToDraw.complete) {
      const canvas = canvasRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(imgToDraw, 0, 0, canvas.width, canvas.height);
      lastDrawnIndexRef.current = drawIndex;
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
      
      throttledStartNextDownloads();
    };
    
    img.onerror = () => {
      loadingSetRef.current.delete(idx);
      throttledStartNextDownloads();
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

  const throttledStartNextDownloads = () => {
    const now = Date.now();
    const LIMIT = 150; // ms
    
    if (now - lastDownloadCheckRef.current >= LIMIT) {
      lastDownloadCheckRef.current = now;
      startNextDownloads();
    } else {
      if (throttleTimeoutRef.current) clearTimeout(throttleTimeoutRef.current);
      throttleTimeoutRef.current = setTimeout(() => {
        lastDownloadCheckRef.current = Date.now();
        startNextDownloads();
      }, LIMIT);
    }
  };

  // Preload first frame immediately, queue the rest when it's done
  useEffect(() => {
    // Set fixed internal dimensions matching image source size
    if (canvasRef.current) {
      canvasRef.current.width = IMG_WIDTH;
      canvasRef.current.height = IMG_HEIGHT;
    }

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
      throttledStartNextDownloads();
    };
    firstImg.onerror = () => {
      console.error("Failed to load first frame");
      setFirstLoaded(true);
      const queue = [];
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        queue.push(i);
      }
      pendingQueueRef.current = queue;
      throttledStartNextDownloads();
    };
    
    return () => {
      if (throttleTimeoutRef.current) clearTimeout(throttleTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update refs and trigger prioritized downloads when scroll progress changes
  useEffect(() => {
    const unsubscribe = progress.onChange((latest) => {
      progressRef.current = latest;
      targetIndexRef.current = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(latest * TOTAL_FRAMES)));
      requestAnimationFrame(() => renderFrame(latest));
      throttledStartNextDownloads();
    });
    
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-[#0a0a0a] pointer-events-none flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-contain md:object-cover" 
      />
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
