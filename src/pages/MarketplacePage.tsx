import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  SlidersHorizontal,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react';
import NFTCard from '../components/NFTCard';
import { NFTMetadata } from '../hooks/useNFT';

interface MarketplacePageProps {
  nfts: NFTMetadata[];
  isLoading: boolean;
  onViewNFT: (nft: NFTMetadata) => void;
  onBuyNFT: (nft: NFTMetadata) => void;
}

export default function MarketplacePage({ nfts, isLoading, onViewNFT, onBuyNFT }: MarketplacePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedMediaType, setSelectedMediaType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: 'recent', label: 'Recently Listed' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'oldest', label: 'Oldest First' }
  ];

  const mediaTypes = ['image', 'video', 'audio'];

  // Filter and sort NFTs
  const filteredNFTs = nfts
    .filter(nft => {
      // Only show listed NFTs
      if (!nft.isListed) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!nft.name.toLowerCase().includes(query) && 
            !nft.description.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Media type filter
      if (selectedMediaType && nft.mediaType !== selectedMediaType) {
        return false;
      }
      
      // Price range filter
      const price = parseFloat(nft.price);
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'recent':
        default:
          return b.createdAt - a.createdAt;
      }
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMediaType(null);
    setPriceRange([0, 100]);
    setSortBy('recent');
  };

  const hasActiveFilters = searchQuery || selectedMediaType || priceRange[0] > 0 || priceRange[1] < 100;

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            NFT Marketplace
          </h1>
          <p className="text-xl text-gray-400">
            Discover and collect unique digital assets on Neura
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NFTs by name or description..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-purple-500 rounded-full" />
            )}
          </button>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-[#12121a]">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Media Type */}
            <div className="flex items-center gap-2">
              {mediaTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedMediaType(selectedMediaType === type ? null : type)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    selectedMediaType === type
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:border-purple-500/30'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* View Mode */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filters Panel */}
        {showFilters && (
          <div className="lg:hidden mb-8 p-6 bg-white/5 border border-white/10 rounded-xl space-y-6">
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-[#12121a]">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Media Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Media Type</label>
              <div className="flex flex-wrap gap-2">
                {mediaTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedMediaType(selectedMediaType === type ? null : type)}
                    className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                      selectedMediaType === type
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price Range: {priceRange[0]} - {priceRange[1]} ANKR
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseFloat(e.target.value) || 0, priceRange[1]])}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="Min"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value) || 100])}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            {filteredNFTs.length} {filteredNFTs.length === 1 ? 'NFT' : 'NFTs'} found
          </p>
        </div>

        {/* NFT Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          </div>
        ) : filteredNFTs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No NFTs Found</h3>
            <p className="text-gray-400 mb-6">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search query'
                : 'No NFTs are currently listed for sale'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/30 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredNFTs.map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                onBuy={onBuyNFT}
                onView={onViewNFT}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
