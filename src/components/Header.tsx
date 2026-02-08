import React, { useState } from 'react';
import { 
  Wallet, 
  Menu, 
  X, 
  ChevronDown, 
  ExternalLink,
  Copy,
  Check,
  LogOut,
  Sparkles,
  Zap
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { NEURA_TESTNET, SUPPORTED_WALLETS } from '../config/neura';
import WalletModal from './WalletModal';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const { 
    address, 
    isConnected, 
    isCorrectNetwork, 
    balance, 
    wankrBalance,
    isConnecting,
    connect,
    disconnect,
    switchToNeura,
    addWANKRToken
  } = useWallet();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'create', label: 'Create' },
    { id: 'gallery', label: 'My Gallery' }
  ];

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWalletConnect = async (walletType: string) => {
    await connect(walletType);
    setIsWalletModalOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onNavigate('home')}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  NFT Creator Studio
                </h1>
                <p className="text-xs text-gray-500">Powered by Neura</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentPage === item.id
                      ? 'bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Wallet Section */}
            <div className="flex items-center gap-3">
              {/* Network Indicator */}
              {isConnected && (
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  isCorrectNetwork 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400 cursor-pointer hover:bg-red-500/30'
                }`}
                onClick={!isCorrectNetwork ? switchToNeura : undefined}
                >
                  <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                  {isCorrectNetwork ? 'Neura Testnet' : 'Wrong Network'}
                </div>
              )}

              {/* Wallet Button */}
              {isConnected && address ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all duration-300"
                  >
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-white">{formatAddress(address)}</span>
                      <span className="text-xs text-gray-400">{balance} ANKR</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-[#12121a] border border-purple-500/20 rounded-xl shadow-2xl shadow-purple-500/10 overflow-hidden">
                      <div className="p-4 border-b border-purple-500/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-400">Connected Wallet</span>
                          <button
                            onClick={copyAddress}
                            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                          >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-sm font-mono text-white break-all">{address}</p>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">ANKR Balance</span>
                          <span className="text-sm font-medium text-white">{balance} ANKR</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">WANKR Balance</span>
                          <span className="text-sm font-medium text-white">{wankrBalance} WANKR</span>
                        </div>
                      </div>

                      <div className="p-2 border-t border-purple-500/10 space-y-1">
                        <button
                          onClick={addWANKRToken}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                        >
                          <Zap className="w-4 h-4" />
                          Add WANKR to Wallet
                        </button>
                        <a
                          href={`${NEURA_TESTNET.blockExplorerUrls[0]}address/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on Explorer
                        </a>
                        <button
                          onClick={() => {
                            disconnect();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  disabled={isConnecting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wallet className="w-5 h-5" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-purple-500/20">
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium text-left transition-all ${
                    currentPage === item.id
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
        isConnecting={isConnecting}
      />

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  );
}
