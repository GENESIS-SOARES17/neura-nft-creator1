import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image, 
  Video, 
  Music, 
  X, 
  Plus, 
  Trash2,
  Sparkles,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import { MintParams } from '../hooks/useNFT';
import { PLATFORM_CONFIG } from '../config/neura';

interface CreateNFTFormProps {
  onMint: (params: MintParams) => Promise<void>;
  onBatchMint: (items: MintParams[]) => Promise<void>;
  isMinting: boolean;
  walletConnected: boolean;
}

interface NFTFormData {
  name: string;
  description: string;
  imageURI: string;
  mediaType: 'image' | 'video' | 'audio';
  royaltyPercentage: number;
  attributes: { trait_type: string; value: string }[];
}

const initialFormData: NFTFormData = {
  name: '',
  description: '',
  imageURI: '',
  mediaType: 'image',
  royaltyPercentage: 5,
  attributes: []
};

export default function CreateNFTForm({ onMint, onBatchMint, isMinting, walletConnected }: CreateNFTFormProps) {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [formData, setFormData] = useState<NFTFormData>(initialFormData);
  const [batchItems, setBatchItems] = useState<NFTFormData[]>([{ ...initialFormData }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediaTypes = [
    { id: 'image', label: 'Image', icon: Image, formats: 'JPG, PNG, GIF, WebP, SVG' },
    { id: 'video', label: 'Video', icon: Video, formats: 'MP4, WebM' },
    { id: 'audio', label: 'Audio', icon: Music, formats: 'MP3, WAV, OGG' }
  ];

  const validateForm = (data: NFTFormData): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!data.name.trim()) newErrors.name = 'Name is required';
    if (!data.imageURI.trim()) newErrors.imageURI = 'Media URL is required';
    if (data.royaltyPercentage < 0 || data.royaltyPercentage > 20) {
      newErrors.royaltyPercentage = 'Royalty must be between 0% and 20%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletConnected) {
      setErrors({ wallet: 'Please connect your wallet first' });
      return;
    }

    if (mode === 'single') {
      if (!validateForm(formData)) return;
      
      await onMint({
        name: formData.name,
        description: formData.description,
        imageURI: formData.imageURI,
        mediaType: formData.mediaType,
        royaltyPercentage: formData.royaltyPercentage * 100, // Convert to basis points
        attributes: formData.attributes
      });
      
      setFormData(initialFormData);
      setPreviewUrl('');
    } else {
      const validItems = batchItems.filter(item => item.name && item.imageURI);
      if (validItems.length === 0) {
        setErrors({ batch: 'Add at least one valid NFT' });
        return;
      }
      
      await onBatchMint(validItems.map(item => ({
        name: item.name,
        description: item.description,
        imageURI: item.imageURI,
        mediaType: item.mediaType,
        royaltyPercentage: item.royaltyPercentage * 100,
        attributes: item.attributes
      })));
      
      setBatchItems([{ ...initialFormData }]);
    }
  };

  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '' }]
    }));
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const addBatchItem = () => {
    if (batchItems.length < PLATFORM_CONFIG.maxBatchSize) {
      setBatchItems(prev => [...prev, { ...initialFormData }]);
    }
  };

  const removeBatchItem = (index: number) => {
    setBatchItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateBatchItem = (index: number, field: keyof NFTFormData, value: any) => {
    setBatchItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Mode Toggle */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setMode('single')}
          className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-300 ${
            mode === 'single'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
          }`}
        >
          <Sparkles className="w-5 h-5 mx-auto mb-2" />
          Single NFT
        </button>
        <button
          onClick={() => setMode('batch')}
          className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-300 ${
            mode === 'batch'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
          }`}
        >
          <Plus className="w-5 h-5 mx-auto mb-2" />
          Batch Mint
        </button>
      </div>

      {/* Error Alert */}
      {errors.wallet && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{errors.wallet}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {mode === 'single' ? (
          <>
            {/* Media Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Media Type</label>
              <div className="grid grid-cols-3 gap-4">
                {mediaTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mediaType: type.id as any }))}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      formData.mediaType === type.id
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/30'
                    }`}
                  >
                    <type.icon className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">{type.label}</p>
                    <p className="text-xs mt-1 opacity-60">{type.formats}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Media URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Media URL <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.imageURI}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, imageURI: e.target.value }));
                    setPreviewUrl(e.target.value);
                  }}
                  placeholder="https://example.com/your-nft-media.png"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                    errors.imageURI ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
                {previewUrl && formData.mediaType === 'image' && (
                  <div className="mt-4 relative aspect-video rounded-xl overflow-hidden bg-white/5">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                      onError={() => setPreviewUrl('')}
                    />
                  </div>
                )}
              </div>
              {errors.imageURI && (
                <p className="mt-2 text-sm text-red-400">{errors.imageURI}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Awesome NFT"
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                  errors.name ? 'border-red-500/50' : 'border-white/10'
                }`}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your NFT..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
              />
            </div>

            {/* Royalty */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Royalty Percentage
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={formData.royaltyPercentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, royaltyPercentage: parseFloat(e.target.value) }))}
                  className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                />
                <div className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-center">
                  <span className="text-white font-medium">{formData.royaltyPercentage}%</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                You'll receive this percentage from secondary sales (max 20%)
              </p>
            </div>

            {/* Attributes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">Attributes</label>
                <button
                  type="button"
                  onClick={addAttribute}
                  className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                >
                  <Plus className="w-4 h-4" />
                  Add Attribute
                </button>
              </div>
              <div className="space-y-3">
                {formData.attributes.map((attr, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={attr.trait_type}
                      onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                      placeholder="Trait type"
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <input
                      type="text"
                      value={attr.value}
                      onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Batch Mode */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-400">
                {batchItems.length} / {PLATFORM_CONFIG.maxBatchSize} NFTs
              </p>
              <button
                type="button"
                onClick={addBatchItem}
                disabled={batchItems.length >= PLATFORM_CONFIG.maxBatchSize}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add NFT
              </button>
            </div>

            {batchItems.map((item, index) => (
              <div key={index} className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">NFT #{index + 1}</h4>
                  {batchItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBatchItem(index)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateBatchItem(index, 'name', e.target.value)}
                    placeholder="Name *"
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <input
                    type="url"
                    value={item.imageURI}
                    onChange={(e) => updateBatchItem(index, 'imageURI', e.target.value)}
                    placeholder="Media URL *"
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
                
                <textarea
                  value={item.description}
                  onChange={(e) => updateBatchItem(index, 'description', e.target.value)}
                  placeholder="Description"
                  rows={2}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
                
                <div className="flex items-center gap-4">
                  <select
                    value={item.mediaType}
                    onChange={(e) => updateBatchItem(index, 'mediaType', e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                  </select>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Royalty:</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={item.royaltyPercentage}
                      onChange={(e) => updateBatchItem(index, 'royaltyPercentage', parseFloat(e.target.value))}
                      className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <span className="text-sm text-gray-400">%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isMinting || !walletConnected}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isMinting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {mode === 'single' ? 'Minting NFT...' : 'Batch Minting...'}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {mode === 'single' ? 'Mint NFT' : `Mint ${batchItems.length} NFTs`}
            </>
          )}
        </button>

        {/* Gas Estimate */}
        <div className="text-center text-sm text-gray-500">
          Estimated gas: ~0.001 ANKR per NFT
        </div>
      </form>
    </div>
  );
}
