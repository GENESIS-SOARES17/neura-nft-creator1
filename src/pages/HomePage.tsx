import React from 'react';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Layers, 
  ArrowRight,
  Wallet,
  Image,
  Tag,
  TrendingUp
} from 'lucide-react';
import NFTCard from '../components/NFTCard';
import { NFTMetadata } from '../hooks/useNFT';

interface HomePageProps {
  featuredNFTs: NFTMetadata[];
  onNavigate: (page: string) => void;
  onViewNFT: (nft: NFTMetadata) => void;
  onBuyNFT: (nft: NFTMetadata) => void;
}

export default function HomePage({ featuredNFTs, onNavigate, onViewNFT, onBuyNFT }: HomePageProps) {
  const features = [
    {
      icon: Wallet,
      title: 'Multi-Wallet Support',
      description: 'Connect with MetaMask, OKX, Rabby, and more EVM-compatible wallets.'
    },
    {
      icon: Image,
      title: 'Create & Mint',
      description: 'Upload images, videos, or audio and mint them as unique NFTs on Neura.'
    },
    {
      icon: Tag,
      title: 'Set Royalties',
      description: 'Earn up to 20% royalties on every secondary sale of your creations.'
    },
    {
      icon: Layers,
      title: 'Batch Minting',
      description: 'Mint up to 50 NFTs at once with our efficient batch minting feature.'
    }
  ];

  const stats = [
    { value: '10K+', label: 'NFTs Created' },
    { value: '5K+', label: 'Artists' },
    { value: '50K+', label: 'Transactions' },
    { value: '100K', label: 'ANKR Volume' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[#0a0a0f]">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/30 rounded-full blur-[128px] animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[128px] animate-pulse delay-500" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
          
          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400/50 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 10}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Powered by Neura Testnet</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Create, Mint &
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Sell NFTs
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12">
            The ultimate NFT creation studio on Neura. Connect your wallet, 
            create stunning digital art, and list it for sale in minutes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('create')}
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
            >
              <Sparkles className="w-6 h-6" />
              Start Creating
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('marketplace')}
              className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 text-white font-bold text-lg rounded-xl transition-all duration-300"
            >
              Explore Marketplace
            </button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-purple-500/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-purple-500 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-[#0a0a0f] to-[#12121a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A complete toolkit for creating, managing, and selling your NFTs on the Neura network.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured NFTs Section */}
      <section className="py-24 bg-[#12121a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Featured NFTs
              </h2>
              <p className="text-gray-400">Discover trending creations from our community</p>
            </div>
            <button
              onClick={() => onNavigate('marketplace')}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredNFTs.slice(0, 6).map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                onBuy={onBuyNFT}
                onView={onViewNFT}
              />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <button
              onClick={() => onNavigate('marketplace')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors"
            >
              View All NFTs
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-[#12121a] to-[#0a0a0f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative p-12 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-3xl overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-cyan-600/10" />
            
            <div className="relative z-10">
              <Shield className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Create Your First NFT?
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of creators on Neura. Connect your wallet and start minting in seconds.
              </p>
              <button
                onClick={() => onNavigate('create')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                <Sparkles className="w-6 h-6" />
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
