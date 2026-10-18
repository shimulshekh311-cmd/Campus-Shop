import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Check, RefreshCw, AlertCircle } from 'lucide-react';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl: string;
  onSaveLogo: (logoData: string) => void;
}

export const LogoUploadModal: React.FC<LogoUploadModalProps> = ({
  isOpen,
  onClose,
  currentLogoUrl,
  onSaveLogo,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentLogoUrl);
  const [urlInput, setUrlInput] = useState('');
  const [objectFit, setObjectFit] = useState<'cover' | 'contain'>('cover');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('অনুগ্রহ করে একটি ছবি ফাইল (.png, .jpg, .webp, .svg) নির্বাচন করুন।');
      return;
    }
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPreviewUrl(result);
        setUrlInput('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUrlApply = () => {
    if (!urlInput.trim()) return;
    setPreviewUrl(urlInput.trim());
    setErrorMsg('');
  };

  const handleSave = async () => {
    if (!previewUrl) {
      setErrorMsg('কোনো লোগো ইমেজ পাওয়া যায়নি।');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/settings/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: previewUrl }),
      });
      const data = await res.json();
      if (data.success) {
        onSaveLogo(previewUrl);
        setSuccessMsg('আপনার মূল লোগোটি সফলভাবে সেভ ও সেট হয়েছে!');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1200);
      } else {
        // Fallback to client-side saving
        onSaveLogo(previewUrl);
        onClose();
      }
    } catch {
      // If offline or server error, client saving still works
      onSaveLogo(previewUrl);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0D5C3A] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base leading-snug">
                আপনার আসল লোগো যুক্ত করুন
              </h3>
              <p className="text-xs text-stone-500">
                আপনার দেওয়া ছবিটি হুবহু ওয়েবসাইটের লোগো হিসেবে সেট করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-stone-800">
          {/* Live Preview Box */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-100/70 border border-dashed border-stone-300">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
              ন্যাভবার প্রিভিউ (Navbar Preview)
            </span>
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-stone-200 shadow-xs max-w-full">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-emerald-900/15 flex items-center justify-center shrink-0 shadow-2xs">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Logo Preview"
                    className={`w-full h-full ${objectFit === 'contain' ? 'object-contain p-0.5' : 'object-cover object-center'}`}
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-stone-400" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-black tracking-tight text-[#0D5C3A] leading-tight">
                  CampusShop
                </span>
                <span className="text-[11px] text-stone-600 font-medium leading-tight mt-0.5">
                  ক্যাম্পাসের সকল প্রয়োজন এক জায়গায়
                </span>
              </div>
            </div>

            {/* Fit mode switch */}
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="text-stone-500">ছবির ডিসপ্লে:</span>
              <button
                type="button"
                onClick={() => setObjectFit('cover')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                  objectFit === 'cover'
                    ? 'bg-[#0D5C3A] text-white'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                ক্রপ / ফুল ফিট
              </button>
              <button
                type="button"
                onClick={() => setObjectFit('contain')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                  objectFit === 'contain'
                    ? 'bg-[#0D5C3A] text-white'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                সম্পূর্ণ ছবি (No Crop)
              </button>
            </div>
          </div>

          {/* Drag & drop / File input button */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-300 hover:border-[#0D5C3A] bg-emerald-50/50 hover:bg-emerald-50/80 rounded-2xl p-5 text-center cursor-pointer transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#0D5C3A] mx-auto flex items-center justify-center mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <p className="font-semibold text-sm text-[#0D5C3A]">
              আপনার ডিভাইস থেকে আসল ছবিটি বেছে নিন
            </p>
            <p className="text-xs text-stone-500 mt-1">
              অথবা ফাইলটি টেনে এনে এখানে ছেড়ে দিন (PNG, JPG, SVG)
            </p>
          </div>

          {/* Or enter Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">
              অথবা ছবির লিংক দিন (Image URL):
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://.../logo.png"
                className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30"
              />
              <button
                type="button"
                onClick={handleUrlApply}
                disabled={!urlInput.trim()}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 disabled:opacity-40 cursor-pointer"
              >
                প্রিভিউ
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-stone-100 bg-stone-50/70 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/70 transition-colors cursor-pointer"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0D5C3A] hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>সেভ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>লোগো চূড়ান্তভাবে সেট করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
