import React, { useState } from 'react';
import { 
  Heart, 
  ExternalLink, 
  ShoppingCart, 
  Tag,
  User,
  Clock,
  Sparkles
} from 'lucide-react';
import { NFTMetadata } from '../hooks/useNFT';
import { NEURA_TESTNET } from '../config/neura';

interface NFTCardProps {
  nft: NFTMetadata;
  onBuy?: (nft: NFTMetadata) => void;
  onView?: (nft: NFTMetadata) => void;
  showActions?: boolean;
  isOwned?: boolean;
}

export default function NFTCard({ nft, onBuy, onView, showActions = true, isOwned = false }: NFTCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const royaltyPercent = (nft.royaltyPercentage / 100).toFixed(1);

  return (
    <div className="group relative bg-[#12121a] border border-purple-500/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <Sparkles className="w-12 h-12 mb-2" />
            <span className="text-sm">Image unavailable</span>
          </div>
        ) : (
          <img
            src={nft.imageURI}
            alt={nft.name}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-4 right-4 p-2.5 bg-black/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isLiked ? 'fill-pink-500 text-pink-500' : 'text-white'
            }`} 
          />
        </button>

        {/* Listed Badge */}
        {nft.isListed && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full">
            <span className="text-xs font-medium text-white">For Sale</span>
          </div>
        )}

        {/* Media Type Badge */}
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-gray-300 capitalize">{nft.mediaType}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Creator */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-purple-400 transition-colors">
            {nft.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <User className="w-4 h-4" />
            <span className="truncate">{formatAddress(nft.creator)}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Tag className="w-4 h-4" />
            <span>{royaltyPercent}% royalty</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{formatDate(nft.createdAt)}</span>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-purple-500/10">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">
              {nft.isListed ? 'Price' : 'Not listed'}
            </p>
            {nft.isListed && (
              <p className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {nft.price} ANKR
              </p>
            )}
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              {nft.isListed && !isOwned && onBuy && (
                <button
                  onClick={() => onBuy(nft)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy
                </button>
              )}
              
              {onView && (
                <button
                  onClick={() => onView(nft)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10" />
      </div>
    </div>
  );
}
