import React from 'react';
import { X, ExternalLink, AlertCircle } from 'lucide-react';
import { SUPPORTED_WALLETS } from '../config/neura';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: string) => void;
  isConnecting: boolean;
}

export default function WalletModal({ isOpen, onClose, onConnect, isConnecting }: WalletModalProps) {
  if (!isOpen) return null;

  const detectWallet = (walletId: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    switch (walletId) {
      case 'metamask':
        return !!(window.ethereum?.isMetaMask);
      case 'okx':
        return !!(window.okxwallet);
      case 'rabby':
        return !!(window.ethereum?.isRabby);
      case 'coinbase':
        return !!(window.ethereum?.isCoinbaseWallet);
      case 'trust':
        return !!(window.ethereum?.isTrust);
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#12121a] border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/10">
          <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network Info */}
        <div className="px-6 py-4 bg-purple-500/5 border-b border-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Neura Testnet</p>
              <p className="text-xs text-gray-400">Chain ID: 267</p>
            </div>
          </div>
        </div>

        {/* Wallet Options */}
        <div className="p-6 space-y-3">
          {SUPPORTED_WALLETS.map((wallet) => {
            const isDetected = detectWallet(wallet.id);
            
            return (
              <button
                key={wallet.id}
                onClick={() => isDetected ? onConnect(wallet.id) : window.open(wallet.downloadUrl, '_blank')}
                disabled={isConnecting}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={wallet.icon} 
                    alt={wallet.name}
                    className="w-10 h-10 rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=' + wallet.name[0];
                    }}
                  />
                  <div className="text-left">
                    <p className="font-medium text-white group-hover:text-purple-400 transition-colors">
                      {wallet.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isDetected ? 'Detected' : 'Not installed'}
                    </p>
                  </div>
                </div>
                
                {isDetected ? (
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ) : (
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-amber-500/5 border-t border-amber-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/80">
              By connecting your wallet, you agree to our Terms of Service and acknowledge that you are using the Neura Testnet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
