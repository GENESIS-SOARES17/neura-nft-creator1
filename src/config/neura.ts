// Neura Testnet Configuration
export const NEURA_TESTNET = {
  chainId: 267,
  chainIdHex: '0x10B',
  chainName: 'Neura Testnet',
  nativeCurrency: {
    name: 'ANKR',
    symbol: 'ANKR',
    decimals: 18
  },
  rpcUrls: ['https://rpc.ankr.com/neura_testnet'],
  blockExplorerUrls: ['https://testnet.explorer.neuraprotocol.io/'],
  iconUrls: ['https://cryptologos.cc/logos/ankr-ankr-logo.png']
};

// WANKR Token Configuration
export const WANKR_TOKEN = {
  address: '0x422F5Eae5fEE0227FB31F149E690a73C4aD02dB8',
  symbol: 'WANKR',
  name: 'Wrapped ANKR',
  decimals: 18,
  image: 'https://cryptologos.cc/logos/ankr-ankr-logo.png'
};

// Contract Addresses (Mock for demo - would be deployed addresses)
export const CONTRACT_ADDRESSES = {
  NFT: '0x0000000000000000000000000000000000000001', // Replace with deployed address
  MARKETPLACE: '0x0000000000000000000000000000000000000002' // Replace with deployed address
};

// Platform Configuration
export const PLATFORM_CONFIG = {
  name: 'NFT Creator Studio',
  platformFee: 250, // 2.5% in basis points
  maxRoyalty: 2000, // 20% max
  maxBatchSize: 50,
  supportedMediaTypes: ['image', 'video', 'audio'],
  supportedImageFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  supportedVideoFormats: ['video/mp4', 'video/webm'],
  supportedAudioFormats: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  maxFileSize: 100 * 1024 * 1024, // 100MB
};

// Supported Wallets
export const SUPPORTED_WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
    downloadUrl: 'https://metamask.io/download/'
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    icon: 'https://static.okx.com/cdn/assets/imgs/221/C5E9F1D1E1F8B8B8.png',
    downloadUrl: 'https://www.okx.com/web3'
  },
  {
    id: 'rabby',
    name: 'Rabby Wallet',
    icon: 'https://rabby.io/assets/images/logo-rabby.svg',
    downloadUrl: 'https://rabby.io/'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: 'https://www.coinbase.com/img/favicon/favicon-256.png',
    downloadUrl: 'https://www.coinbase.com/wallet'
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: 'https://trustwallet.com/assets/images/favicon.png',
    downloadUrl: 'https://trustwallet.com/'
  }
];

// ABI for WANKR Token (ERC20)
export const WANKR_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  }
];

// NFT Contract ABI (simplified)
export const NFT_ABI = [
  {
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'imageURI', type: 'string' },
      { name: 'mediaType', type: 'string' },
      { name: 'royaltyPercentage', type: 'uint256' },
      { name: 'tokenURI_', type: 'string' }
    ],
    name: 'mintNFT',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'names', type: 'string[]' },
      { name: 'descriptions', type: 'string[]' },
      { name: 'imageURIs', type: 'string[]' },
      { name: 'mediaTypes', type: 'string[]' },
      { name: 'royaltyPercentages', type: 'uint256[]' },
      { name: 'tokenURIs', type: 'string[]' }
    ],
    name: 'batchMint',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'price', type: 'uint256' }
    ],
    name: 'listForSale',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'buyNFT',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getNFTDetails',
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'imageURI', type: 'string' },
      { name: 'mediaType', type: 'string' },
      { name: 'royaltyPercentage', type: 'uint256' },
      { name: 'creator', type: 'address' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'currentOwner', type: 'address' },
      { name: 'price', type: 'uint256' },
      { name: 'isListed', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'creator', type: 'address' }],
    name: 'getCreatorTokens',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getListedNFTs',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  }
];
