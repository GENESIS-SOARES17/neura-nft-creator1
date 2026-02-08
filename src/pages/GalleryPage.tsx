import React, { useState } from 'react';
import { 
  Image, 
  Tag, 
  Clock, 
  Loader2,
  Wallet,
  Filter,
  Grid,
  List
} from 'lucide-react';
import NFTCard from '../components/NFTCard';
import { NFTMetadata } from '../hooks/useNFT';

interface GalleryPageProps {
  userNFTs: NFTMetadata[];
  isLoading: boolean;
  walletConnected: boolean;
  walletAddress: string | null;
  onViewNFT: (nft: NFTMetadata) => void;
  onConnectWallet: () => void;
}

export default function GalleryPage({ 
  userNFTs, 
  isLoading, 
  walletConnected,
  walletAddress,
  onViewNFT,
  onConnectWallet
}: GalleryPageProps) {
  const [filter, setFilter] = useState<'all' | 'listed' | 'unlisted'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredNFTs = userNFTs.filter(nft => {
    if (filter === 'listed') return nft.isListed;
    if (filter === 'unlisted') return !nft.isListed;
    return true;
  });

  const stats = {
    total: userNFTs.length,
    listed: userNFTs.filter(nft => nft.isListed).length,
    unlisted: userNFTs.filter(nft => !nft.isListed).length,
    totalValue: userNFTs
      .filter(nft => nft.isListed)
      .reduce((sum, nft) => sum + parseFloat(nft.price), 0)
      .toFixed(2)
  };

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
              <Wallet className="w-12 h-12 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-md">
              Connect your wallet to view your NFT collection and manage your listings.
            </p>
            <button
              onClick={onConnectWallet}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              <Wallet className="w-6 h-6" />
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            My Gallery
          </h1>
          <p className="text-xl text-gray-400">
            Manage your NFT collection and listings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Image className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Total NFTs</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Tag className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-gray-400">Listed</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.listed}</p>
          </div>
          
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-gray-400">Unlisted</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.unlisted}</p>
          </div>
          
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-400">Total Value</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {stats.totalValue} ANKR
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
              {(['all', 'listed', 'unlisted'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    filter === f
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

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
        </div>

        {/* NFT Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          </div>
        ) : filteredNFTs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Image className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {filter === 'all' ? 'No NFTs Yet' : `No ${filter} NFTs`}
            </h3>
            <p className="text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Create your first NFT to get started!'
                : `You don't have any ${filter} NFTs`}
            </p>
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
                onView={onViewNFT}
                isOwned={true}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
