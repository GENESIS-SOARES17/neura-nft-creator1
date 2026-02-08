import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import CreatePage from './pages/CreatePage';
import GalleryPage from './pages/GalleryPage';
import NFTDetailModal from './components/NFTDetailModal';
import WalletModal from './components/WalletModal';
import { useWallet } from './hooks/useWallet';
import { useNFT, NFTMetadata, MintParams } from './hooks/useNFT';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

type Page = 'home' | 'marketplace' | 'create' | 'gallery';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'loading';
  message: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedNFT, setSelectedNFT] = useState<NFTMetadata | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const wallet = useWallet();
  const nft = useNFT();

  // Fetch NFTs on mount
  useEffect(() => {
    nft.fetchMarketplaceNFTs();
  }, []);

  // Fetch user NFTs when wallet connects
  useEffect(() => {
    if (wallet.address) {
      nft.fetchUserNFTs(wallet.address);
    }
  }, [wallet.address]);

  // Toast helpers
  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    
    if (type !== 'loading') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Navigation
  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // NFT Actions
  const handleViewNFT = (nftItem: NFTMetadata) => {
    setSelectedNFT(nftItem);
    setIsDetailModalOpen(true);
  };

  const handleBuyNFT = async (nftItem: NFTMetadata) => {
    if (!wallet.isConnected) {
      setIsWalletModalOpen(true);
      return;
    }

    const loadingId = addToast('loading', `Purchasing ${nftItem.name}...`);
    
    const success = await nft.buyNFT(nftItem.tokenId, wallet.address!);
    
    removeToast(loadingId);
    
    if (success) {
      addToast('success', `Successfully purchased ${nftItem.name}!`);
      setIsDetailModalOpen(false);
      wallet.updateBalances();
    } else {
      addToast('error', 'Failed to purchase NFT. Please try again.');
    }
  };

  const handleMintNFT = async (params: MintParams) => {
    if (!wallet.address) return;

    const loadingId = addToast('loading', 'Minting your NFT...');
    
    const result = await nft.mintNFT(params, wallet.address);
    
    removeToast(loadingId);
    
    if (result) {
      addToast('success', `Successfully minted "${result.name}"!`);
      handleNavigate('gallery');
    } else {
      addToast('error', nft.error || 'Failed to mint NFT');
    }
  };

  const handleBatchMint = async (items: MintParams[]) => {
    if (!wallet.address) return;

    const loadingId = addToast('loading', `Minting ${items.length} NFTs...`);
    
    const results = await nft.batchMint(items, wallet.address);
    
    removeToast(loadingId);
    
    if (results.length > 0) {
      addToast('success', `Successfully minted ${results.length} NFTs!`);
      handleNavigate('gallery');
    } else {
      addToast('error', nft.error || 'Failed to batch mint NFTs');
    }
  };

  const handleListNFT = async (tokenId: number, price: string) => {
    const loadingId = addToast('loading', 'Listing NFT for sale...');
    
    const success = await nft.listForSale(tokenId, price);
    
    removeToast(loadingId);
    
    if (success) {
      addToast('success', 'NFT listed for sale!');
      setIsDetailModalOpen(false);
    } else {
      addToast('error', 'Failed to list NFT');
    }
  };

  const handleUnlistNFT = async (tokenId: number) => {
    const loadingId = addToast('loading', 'Removing listing...');
    
    const success = await nft.unlistFromSale(tokenId);
    
    removeToast(loadingId);
    
    if (success) {
      addToast('success', 'NFT removed from sale');
      setIsDetailModalOpen(false);
    } else {
      addToast('error', 'Failed to remove listing');
    }
  };

  const handleWalletConnect = async (walletType: string) => {
    const success = await wallet.connect(walletType);
    if (success) {
      setIsWalletModalOpen(false);
      addToast('success', 'Wallet connected successfully!');
    }
  };

  // Check if user owns the selected NFT
  const isOwner = selectedNFT && wallet.address 
    ? selectedNFT.owner.toLowerCase() === wallet.address.toLowerCase()
    : false;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <Header 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
      />

      {/* Main Content */}
      <main>
        {currentPage === 'home' && (
          <HomePage
            featuredNFTs={nft.nfts}
            onNavigate={handleNavigate}
            onViewNFT={handleViewNFT}
            onBuyNFT={handleBuyNFT}
          />
        )}
        
        {currentPage === 'marketplace' && (
          <MarketplacePage
            nfts={nft.nfts}
            isLoading={nft.isLoading}
            onViewNFT={handleViewNFT}
            onBuyNFT={handleBuyNFT}
          />
        )}
        
        {currentPage === 'create' && (
          <CreatePage
            onMint={handleMintNFT}
            onBatchMint={handleBatchMint}
            isMinting={nft.isMinting}
            walletConnected={wallet.isConnected}
            onConnectWallet={() => setIsWalletModalOpen(true)}
          />
        )}
        
        {currentPage === 'gallery' && (
          <GalleryPage
            userNFTs={nft.userNfts}
            isLoading={nft.isLoading}
            walletConnected={wallet.isConnected}
            walletAddress={wallet.address}
            onViewNFT={handleViewNFT}
            onConnectWallet={() => setIsWalletModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0f] border-t border-purple-500/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                NFT Creator Studio
              </h3>
              <p className="text-gray-400 mb-4 max-w-md">
                The ultimate platform for creating, minting, and selling NFTs on the Neura Testnet. 
                Connect your wallet and start your NFT journey today.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Neura Testnet • Chain ID: 267
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => handleNavigate('marketplace')} className="text-gray-400 hover:text-purple-400 transition-colors">
                    Marketplace
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('create')} className="text-gray-400 hover:text-purple-400 transition-colors">
                    Create NFT
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('gallery')} className="text-gray-400 hover:text-purple-400 transition-colors">
                    My Gallery
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://testnet.explorer.neuraprotocol.io/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Block Explorer
                  </a>
                </li>
                <li>
                  <a href="https://www.ankr.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Get ANKR
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-purple-500/10 text-center text-gray-500 text-sm">
            © 2025 NFT Creator Studio. Built on Neura Testnet.
          </div>
        </div>
      </footer>

      {/* NFT Detail Modal */}
      <NFTDetailModal
        nft={selectedNFT}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onBuy={handleBuyNFT}
        onList={handleListNFT}
        onUnlist={handleUnlistNFT}
        isOwner={isOwner}
        isLoading={nft.isLoading}
        walletAddress={wallet.address || undefined}
      />

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
        isConnecting={wallet.isConnecting}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm animate-slide-up ${
              toast.type === 'success' 
                ? 'bg-emerald-500/90 text-white' 
                : toast.type === 'error'
                ? 'bg-red-500/90 text-white'
                : 'bg-purple-500/90 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
            {toast.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(8px); opacity: 0; }
        }
        
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
