import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';

interface Props {
  imageSrc: string;
  onCropComplete: (croppedImageBase64: string) => void;
  onCancel: () => void;
}

const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to the cropped size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Resize if too large
  const MAX_WIDTH = 256;
  const MAX_HEIGHT = 256;
  let finalWidth = canvas.width;
  let finalHeight = canvas.height;

  if (finalWidth > MAX_WIDTH || finalHeight > MAX_HEIGHT) {
    const finalCanvas = document.createElement('canvas');
    if (finalWidth > finalHeight) {
      finalHeight *= MAX_WIDTH / finalWidth;
      finalWidth = MAX_WIDTH;
    } else {
      finalWidth *= MAX_HEIGHT / finalHeight;
      finalHeight = MAX_HEIGHT;
    }
    finalCanvas.width = finalWidth;
    finalCanvas.height = finalHeight;
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx?.drawImage(canvas, 0, 0, finalWidth, finalHeight);
    return finalCanvas.toDataURL('image/jpeg', 0.8);
  }

  return canvas.toDataURL('image/jpeg', 0.8);
};

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBase64);
    } catch (e) {
      console.error(e);
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 99999 }}>
      <div className="modal-sheet" style={{ display: 'flex', flexDirection: 'column', height: '80vh', padding: 0 }}>
        <div className="modal-header" style={{ padding: '16px' }}>
          <h3 className="form-title">Resize Photo</h3>
          <button className="modal-close" onClick={onCancel}><X size={20} /></button>
        </div>
        
        <div style={{ position: 'relative', flex: 1, width: '100%', background: '#000' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px' }}>Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>
          
          <div className="form-actions" style={{ margin: 0 }}>
            <button className="btn-outline" onClick={onCancel}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}><Check size={16} /> Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
