import React from 'react';
import { AlertCircle, Wallet } from 'lucide-react';
import CreateNFTForm from '../components/CreateNFTForm';
import { MintParams } from '../hooks/useNFT';

interface CreatePageProps {
  onMint: (params: MintParams) => Promise<void>;
  onBatchMint: (items: MintParams[]) => Promise<void>;
  isMinting: boolean;
  walletConnected: boolean;
  onConnectWallet: () => void;
}

export default function CreatePage({ 
  onMint, 
  onBatchMint, 
  isMinting, 
  walletConnected,
  onConnectWallet 
}: CreatePageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Create Your NFT
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Upload your digital art, set royalties, and mint it as a unique NFT on the Neura network.
          </p>
        </div>

        {/* Wallet Connection Warning */}
        {!walletConnected && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-amber-400 mb-2">
                    Wallet Not Connected
                  </h3>
                  <p className="text-amber-200/80 mb-4">
                    You need to connect your wallet to create and mint NFTs. Make sure you're connected to the Neura Testnet.
                  </p>
                  <button
                    onClick={onConnectWallet}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium rounded-xl transition-colors"
                  >
                    <Wallet className="w-5 h-5" />
                    Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Network Info */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">
                Creating on <span className="text-purple-400 font-medium">Neura Testnet</span> • 
                Gas fees paid in <span className="text-purple-400 font-medium">ANKR</span>
              </span>
            </div>
          </div>
        </div>

        {/* Create Form */}
        <CreateNFTForm
          onMint={onMint}
          onBatchMint={onBatchMint}
          isMinting={isMinting}
          walletConnected={walletConnected}
        />
      </div>
    </div>
  );
}
