import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Heart, 
  Share2, 
  Tag, 
  User, 
  Clock,
  ShoppingCart,
  Edit3,
  Loader2,
  Check,
  Copy
} from 'lucide-react';
import { NFTMetadata } from '../hooks/useNFT';
import { NEURA_TESTNET } from '../config/neura';

interface NFTDetailModalProps {
  nft: NFTMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  onBuy?: (nft: NFTMetadata) => void;
  onList?: (tokenId: number, price: string) => void;
  onUnlist?: (tokenId: number) => void;
  isOwner?: boolean;
  isLoading?: boolean;
  walletAddress?: string;
}

export default function NFTDetailModal({
  nft,
  isOpen,
  onClose,
  onBuy,
  onList,
  onUnlist,
  isOwner = false,
  isLoading = false,
  walletAddress
}: NFTDetailModalProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [listPrice, setListPrice] = useState('');
  const [showListForm, setShowListForm] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !nft) return null;

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const royaltyPercent = (nft.royaltyPercentage / 100).toFixed(1);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleList = () => {
    if (onList && listPrice) {
      onList(nft.tokenId, listPrice);
      setShowListForm(false);
      setListPrice('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0a0a0f] border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-sm text-gray-400 hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Section */}
        <div className="md:w-1/2 relative bg-gradient-to-br from-purple-900/20 to-pink-900/20">
          <div className="aspect-square">
            <img
              src={nft.imageURI}
              alt={nft.name}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                isLiked 
                  ? 'bg-pink-500/30 text-pink-400' 
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={copyLink}
              className="p-3 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 rounded-full transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto">
          {/* Title & Status */}
          <div className="mb-6">
            {nft.isListed && (
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full mb-3">
                For Sale
              </span>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{nft.name}</h2>
            <p className="text-gray-400">{nft.description || 'No description provided'}</p>
          </div>

          {/* Creator & Owner */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Creator</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <a
                  href={`${NEURA_TESTNET.blockExplorerUrls[0]}address/${nft.creator}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  {formatAddress(nft.creator)}
                </a>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Owner</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <a
                  href={`${NEURA_TESTNET.blockExplorerUrls[0]}address/${nft.owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  {formatAddress(nft.owner)}
                </a>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <Tag className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Royalty</p>
              <p className="text-lg font-bold text-white">{royaltyPercent}%</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <Clock className="w-5 h-5 text-pink-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-sm font-medium text-white">{formatDate(nft.createdAt)}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <span className="text-lg">#{nft.tokenId}</span>
              <p className="text-xs text-gray-500 mt-1">Token ID</p>
            </div>
          </div>

          {/* Attributes */}
          {nft.attributes && nft.attributes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Attributes</h3>
              <div className="grid grid-cols-2 gap-2">
                {nft.attributes.map((attr, index) => (
                  <div key={index} className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-xs text-purple-400 uppercase">{attr.trait_type}</p>
                    <p className="text-sm font-medium text-white">{attr.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price & Actions */}
          <div className="pt-6 border-t border-purple-500/10">
            {nft.isListed && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Current Price</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {nft.price} ANKR
                </p>
              </div>
            )}

            {/* Owner Actions */}
            {isOwner ? (
              <div className="space-y-3">
                {nft.isListed ? (
                  <button
                    onClick={() => onUnlist?.(nft.tokenId)}
                    disabled={isLoading}
                    className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Remove from Sale'
                    )}
                  </button>
                ) : showListForm ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={listPrice}
                        onChange={(e) => setListPrice(e.target.value)}
                        placeholder="Price in ANKR"
                        step="0.01"
                        min="0"
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                      <span className="text-gray-400">ANKR</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowListForm(false)}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-medium rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleList}
                        disabled={!listPrice || isLoading}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          'List for Sale'
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowListForm(true)}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-5 h-5" />
                    List for Sale
                  </button>
                )}
              </div>
            ) : nft.isListed && onBuy ? (
              <button
                onClick={() => onBuy(nft)}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Buy Now for {nft.price} ANKR
                  </>
                )}
              </button>
            ) : null}

            {/* View on Explorer */}
            <a
              href={`${NEURA_TESTNET.blockExplorerUrls[0]}token/${nft.tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View on Explorer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
