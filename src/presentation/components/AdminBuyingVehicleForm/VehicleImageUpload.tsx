'use client';

import { useState, useEffect } from 'react';
import { Camera, Upload, X, Plus } from 'lucide-react';

interface VehicleImageUploadProps {
  initialMainImage?: string | null;
  initialSideImages?: string[];
}

export default function VehicleImageUpload({
  initialMainImage,
  initialSideImages = [],
}: VehicleImageUploadProps) {
  const [mainPreview, setMainPreview] = useState<string | null>(initialMainImage ?? null);
  const [sidePreviews, setSidePreviews] = useState<string[]>(initialSideImages);

  useEffect(() => {
    setMainPreview(initialMainImage ?? null);
    setSidePreviews(initialSideImages);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMainImage]);

  useEffect(() => {
    return () => {
      if (mainPreview?.startsWith('blob:')) URL.revokeObjectURL(mainPreview);
      sidePreviews.filter((p) => p.startsWith('blob:')).forEach((p) => URL.revokeObjectURL(p));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (mainPreview?.startsWith('blob:')) URL.revokeObjectURL(mainPreview);
    setMainPreview(URL.createObjectURL(file));
  };

  const removeMain = () => {
    if (mainPreview?.startsWith('blob:')) URL.revokeObjectURL(mainPreview);
    setMainPreview(initialMainImage ?? null);
  };

  const handleSideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newBlobs = files.map((f) => URL.createObjectURL(f));
    setSidePreviews((prev) => [...prev, ...newBlobs].slice(0, 4));
  };

  const removeSide = (index: number) => {
    const url = sidePreviews[index];
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    setSidePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const existingMain = !mainPreview?.startsWith('blob:') ? mainPreview : null;
  const existingSides = sidePreviews.filter((p) => !p.startsWith('blob:'));

  return (
    <>
      <div className="md:col-span-2 border-b border-white/5 pb-2 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Media</h3>
      </div>

      <div className="md:col-span-2 space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-2">
          <Camera className="w-3 h-3 text-primary" />
          Main Vehicle Photo
        </label>

        <input
          type="file"
          name="mainImage"
          id="buyingMainImageInput"
          accept="image/*"
          className="hidden"
          onChange={handleMainChange}
        />

        {mainPreview ? (
          <div className="relative w-full h-48 bg-white/5 rounded-xl overflow-hidden border border-primary/30">
            <img src={mainPreview} alt="Preview" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={removeMain}
              className="absolute top-2 right-2 bg-red-500 p-1 rounded-full text-white hover:bg-red-600 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <label
              htmlFor="buyingMainImageInput"
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <span className="text-xs font-bold uppercase tracking-widest">Change Photo</span>
            </label>
          </div>
        ) : (
          <label
            htmlFor="buyingMainImageInput"
            className="flex flex-col items-center justify-center w-full h-48 bg-white/5 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary/50 transition-all"
          >
            <Upload className="w-8 h-8 text-white/20 mb-3" />
            <p className="text-sm text-white/40">Click to upload main photo</p>
            <p className="text-xs text-white/20 mt-1">PNG, JPG or WEBP · Max 5 MB</p>
          </label>
        )}
      </div>

      <div className="md:col-span-2 space-y-4">
        <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-2">
          <Camera className="w-3 h-3 text-accent" />
          Gallery Photos
        </label>

        <div className="grid grid-cols-4 gap-4">
          {sidePreviews.map((preview, index) => (
            <div
              key={index}
              className="relative aspect-square bg-white/5 rounded-lg overflow-hidden border border-accent/20"
            >
              <img src={preview} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeSide(index)}
                className="absolute top-1 right-1 bg-red-500/80 p-0.5 rounded-full text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {sidePreviews.length < 4 && (
            <label className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-accent/50 transition-all flex flex-col items-center justify-center">
              <Plus className="w-6 h-6 text-white/20" />
              <input
                type="file"
                name="sideImages"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleSideChange}
              />
            </label>
          )}
        </div>
        <p className="text-[10px] text-white/20 italic">
          Up to 4 gallery photos. Select multiple at once.
        </p>
      </div>

      {existingMain && <input type="hidden" name="existingMainImage" value={existingMain} />}
      {existingSides.map((p, i) => (
        <input key={i} type="hidden" name="existingSideImages" value={p} />
      ))}
    </>
  );
}
