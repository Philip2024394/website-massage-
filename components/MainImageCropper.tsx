import React, { useRef, useState, useEffect } from 'react';

interface MainImageCropperProps {
  imageUrl: string;
  aspect?: number; // width/height, default 16/9
  onConfirm: (dataUrl: string) => void;
  onCancel?: () => void;
}

// Simple image positioner - drag to move image within fixed frame
const MainImageCropper = ({ imageUrl, aspect = 16 / 9, onConfirm, onCancel }: MainImageCropperProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState<{ x: number; y: number } | null>(null);
  const [version, setVersion] = useState(0);
  const [outputWidth, setOutputWidth] = useState(1200);
  const [outputHeight, setOutputHeight] = useState(675);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [widthInput, setWidthInput] = useState('1200');
  const [heightInput, setHeightInput] = useState('675');
  
  const currentAspect = outputWidth / outputHeight;

  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
    setStartDrag(null);
    setVersion((v) => v + 1);
  }, [imageUrl]);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartDrag({ x: e.clientX, y: e.clientY });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !startDrag) return;
    const dx = e.clientX - startDrag.x;
    const dy = e.clientY - startDrag.y;
    setStartDrag({ x: e.clientX, y: e.clientY });
    setPosition((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const onMouseUp = () => {
    setIsDragging(false);
    setStartDrag(null);
  };

  const exportCrop = () => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate how to fit the image to fill the container maintaining aspect
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const containerAspect = containerW / containerH;
    
    let drawWidth, drawHeight;
    if (imgAspect > containerAspect) {
      // Image is wider - fit to height
      drawHeight = containerH;
      drawWidth = drawHeight * imgAspect;
    } else {
      // Image is taller - fit to width
      drawWidth = containerW;
      drawHeight = drawWidth / imgAspect;
    }

    // Center point with position offset
    const centerX = containerW / 2 + position.x;
    const centerY = containerH / 2 + position.y;
    const drawX = centerX - drawWidth / 2;
    const drawY = centerY - drawHeight / 2;

    // Scale to output dimensions
    const scaleX = outputWidth / containerW;
    const scaleY = outputHeight / containerH;

    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, drawX * scaleX, drawY * scaleY, drawWidth * scaleX, drawHeight * scaleY);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onConfirm(dataUrl);
    } catch (err) {
      console.error('🚫 Canvas export failed:', err);
      alert('Unable to process this image. Please try uploading it again.');
    }
  };

  // Compute container height from available width and aspect
  const [containerWidth, setContainerWidth] = useState<number>(0);
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentAspect]); // Recalculate when aspect changes

  const heightPx = containerWidth > 0 ? Math.round(containerWidth / currentAspect) : 256; // fallback

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">Position Banner Image</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-800 text-sm"
            onClick={() => {
              setPosition({ x: 0, y: 0 });
              setIsDragging(false);
              setStartDrag(null);
              setVersion((v) => v + 1);
            }}
          >Reset Position</button>
          <button
            type="button"
            className="px-3 py-1 rounded-md bg-orange-500 text-white text-sm font-semibold"
            onClick={exportCrop}
          >Save Image</button>
        </div>
      </div>

      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-gray-700 mb-1">
          <strong>Drag to position:</strong> Click and drag the image to move it within the frame
        </p>
        <p className="text-xs text-gray-600">The image will fill the entire frame width. Drag up/down to adjust what part shows.</p>
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-black/5"
        style={{ height: heightPx }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Position"
          className="select-none cursor-move"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'center center',
            width: '100%',
            height: 'auto'
          }}
          key={version}
          crossOrigin="anonymous"
          draggable={false}
        />
      </div>

      {onCancel && (
        <div className="mt-2 text-right">
          <button type="button" className="px-3 py-1 rounded-md bg-gray-100 text-gray-800 text-sm" onClick={onCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default MainImageCropper;
