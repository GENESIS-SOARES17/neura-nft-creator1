import { useState, useEffect, useCallback } from 'react';
import { NEURA_TESTNET, WANKR_TOKEN } from '../config/neura';

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  balance: string;
  wankrBalance: string;
}

declare global {
  interface Window {
    ethereum?: any;
    okxwallet?: any;
  }
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isCorrectNetwork: false,
    balance: '0',
    wankrBalance: '0'
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProvider = useCallback(() => {
    if (window.ethereum) return window.ethereum;
    if (window.okxwallet) return window.okxwallet;
    return null;
  }, []);

  const updateBalances = useCallback(async (address: string) => {
    const provider = getProvider();
    if (!provider) return;

    try {
      // Get native ANKR balance
      const balanceHex = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      const balanceWei = BigInt(balanceHex);
      const balanceANKR = Number(balanceWei) / 1e18;

      // Get WANKR balance
      const wankrBalanceData = await provider.request({
        method: 'eth_call',
        params: [{
          to: WANKR_TOKEN.address,
          data: `0x70a08231000000000000000000000000${address.slice(2)}`
        }, 'latest']
      });
      const wankrBalanceWei = BigInt(wankrBalanceData);
      const wankrBalance = Number(wankrBalanceWei) / 1e18;

      setWallet(prev => ({
        ...prev,
        balance: balanceANKR.toFixed(4),
        wankrBalance: wankrBalance.toFixed(4)
      }));
    } catch (err) {
      console.error('Error fetching balances:', err);
    }
  }, [getProvider]);

  const checkNetwork = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return false;

    try {
      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);
      const isCorrect = chainId === NEURA_TESTNET.chainId;
      
      setWallet(prev => ({
        ...prev,
        chainId,
        isCorrectNetwork: isCorrect
      }));
      
      return isCorrect;
    } catch (err) {
      console.error('Error checking network:', err);
      return false;
    }
  }, [getProvider]);

  const switchToNeura = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      setError('No wallet detected');
      return false;
    }

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NEURA_TESTNET.chainIdHex }]
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: NEURA_TESTNET.chainIdHex,
              chainName: NEURA_TESTNET.chainName,
              nativeCurrency: NEURA_TESTNET.nativeCurrency,
              rpcUrls: NEURA_TESTNET.rpcUrls,
              blockExplorerUrls: NEURA_TESTNET.blockExplorerUrls
            }]
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          setError('Failed to add Neura Testnet');
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      setError('Failed to switch network');
      return false;
    }
  }, [getProvider]);

  const addWANKRToken = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return false;

    try {
      await provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: WANKR_TOKEN.address,
            symbol: WANKR_TOKEN.symbol,
            decimals: WANKR_TOKEN.decimals,
            image: WANKR_TOKEN.image
          }
        }
      });
      return true;
    } catch (err) {
      console.error('Error adding WANKR token:', err);
      return false;
    }
  }, [getProvider]);

  const connect = useCallback(async (walletType: string = 'metamask') => {
    setIsConnecting(true);
    setError(null);

    let provider = null;
    
    if (walletType === 'okx' && window.okxwallet) {
      provider = window.okxwallet;
    } else if (window.ethereum) {
      provider = window.ethereum;
    }

    if (!provider) {
      setError('No compatible wallet detected. Please install MetaMask or OKX Wallet.');
      setIsConnecting(false);
      return false;
    }

    try {
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        setError('No accounts found');
        setIsConnecting(false);
        return false;
      }

      const address = accounts[0];
      
      // Check and switch network
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        const switched = await switchToNeura();
        if (!switched) {
          setIsConnecting(false);
          return false;
        }
      }

      setWallet(prev => ({
        ...prev,
        address,
        isConnected: true,
        isCorrectNetwork: true
      }));

      await updateBalances(address);
      setIsConnecting(false);
      return true;
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      setIsConnecting(false);
      return false;
    }
  }, [checkNetwork, switchToNeura, updateBalances]);

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      chainId: null,
      isConnected: false,
      isCorrectNetwork: false,
      balance: '0',
      wankrBalance: '0'
    });
    setError(null);
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setWallet(prev => ({
          ...prev,
          address: accounts[0]
        }));
        updateBalances(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      const isCorrect = chainId === NEURA_TESTNET.chainId;
      setWallet(prev => ({
        ...prev,
        chainId,
        isCorrectNetwork: isCorrect
      }));
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
    };
  }, [getProvider, disconnect, updateBalances]);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      const provider = getProvider();
      if (!provider) return;

      try {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const address = accounts[0];
          await checkNetwork();
          setWallet(prev => ({
            ...prev,
            address,
            isConnected: true
          }));
          await updateBalances(address);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };

    checkConnection();
  }, [getProvider, checkNetwork, updateBalances]);

  return {
    ...wallet,
    isConnecting,
    error,
    connect,
    disconnect,
    switchToNeura,
    addWANKRToken,
    updateBalances: () => wallet.address && updateBalances(wallet.address)
  };
}
