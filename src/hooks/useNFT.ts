import { useState, useCallback } from 'react';
import { PLATFORM_CONFIG } from '../config/neura';

export interface NFTMetadata {
  id: string;
  tokenId: number;
  name: string;
  description: string;
  imageURI: string;
  mediaType: 'image' | 'video' | 'audio';
  royaltyPercentage: number;
  creator: string;
  owner: string;
  price: string;
  isListed: boolean;
  createdAt: number;
  attributes?: { trait_type: string; value: string }[];
}

export interface MintParams {
  name: string;
  description: string;
  imageURI: string;
  mediaType: 'image' | 'video' | 'audio';
  royaltyPercentage: number;
  attributes?: { trait_type: string; value: string }[];
}

// Mock NFT data for demonstration
const MOCK_NFTS: NFTMetadata[] = [
  {
    id: '1',
    tokenId: 1,
    name: 'Cosmic Dreamer #001',
    description: 'A mesmerizing journey through the cosmos, capturing the essence of infinite possibilities.',
    imageURI: 'https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=800',
    mediaType: 'image',
    royaltyPercentage: 500,
    creator: '0x1234567890123456789012345678901234567890',
    owner: '0x1234567890123456789012345678901234567890',
    price: '0.5',
    isListed: true,
    createdAt: Date.now() - 86400000,
    attributes: [
      { trait_type: 'Background', value: 'Cosmic' },
      { trait_type: 'Rarity', value: 'Legendary' }
    ]
  },
  {
    id: '2',
    tokenId: 2,
    name: 'Digital Genesis',
    description: 'The birth of a new digital era, where art meets blockchain technology.',
    imageURI: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    mediaType: 'image',
    royaltyPercentage: 750,
    creator: '0x2345678901234567890123456789012345678901',
    owner: '0x2345678901234567890123456789012345678901',
    price: '1.2',
    isListed: true,
    createdAt: Date.now() - 172800000,
    attributes: [
      { trait_type: 'Style', value: 'Abstract' },
      { trait_type: 'Edition', value: '1 of 1' }
    ]
  },
  {
    id: '3',
    tokenId: 3,
    name: 'Neon Pulse',
    description: 'Vibrant neon energy captured in digital form, pulsating with life.',
    imageURI: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    mediaType: 'image',
    royaltyPercentage: 1000,
    creator: '0x3456789012345678901234567890123456789012',
    owner: '0x3456789012345678901234567890123456789012',
    price: '0.8',
    isListed: true,
    createdAt: Date.now() - 259200000,
    attributes: [
      { trait_type: 'Color', value: 'Neon' },
      { trait_type: 'Animation', value: 'Static' }
    ]
  },
  {
    id: '4',
    tokenId: 4,
    name: 'Ethereal Waves',
    description: 'Flowing digital waves that transcend the boundaries of reality.',
    imageURI: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800',
    mediaType: 'image',
    royaltyPercentage: 500,
    creator: '0x4567890123456789012345678901234567890123',
    owner: '0x4567890123456789012345678901234567890123',
    price: '2.5',
    isListed: true,
    createdAt: Date.now() - 345600000,
    attributes: [
      { trait_type: 'Theme', value: 'Ocean' },
      { trait_type: 'Mood', value: 'Calm' }
    ]
  },
  {
    id: '5',
    tokenId: 5,
    name: 'Crypto Punk Revival',
    description: 'A modern interpretation of the iconic crypto art movement.',
    imageURI: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=800',
    mediaType: 'image',
    royaltyPercentage: 1500,
    creator: '0x5678901234567890123456789012345678901234',
    owner: '0x5678901234567890123456789012345678901234',
    price: '5.0',
    isListed: true,
    createdAt: Date.now() - 432000000,
    attributes: [
      { trait_type: 'Collection', value: 'Revival' },
      { trait_type: 'Rarity', value: 'Epic' }
    ]
  },
  {
    id: '6',
    tokenId: 6,
    name: 'Quantum Fragments',
    description: 'Pieces of quantum reality assembled into digital art.',
    imageURI: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800',
    mediaType: 'image',
    royaltyPercentage: 800,
    creator: '0x6789012345678901234567890123456789012345',
    owner: '0x6789012345678901234567890123456789012345',
    price: '1.8',
    isListed: false,
    createdAt: Date.now() - 518400000,
    attributes: [
      { trait_type: 'Dimension', value: 'Quantum' },
      { trait_type: 'Complexity', value: 'High' }
    ]
  }
];

export function useNFT() {
  const [nfts, setNfts] = useState<NFTMetadata[]>(MOCK_NFTS);
  const [userNfts, setUserNfts] = useState<NFTMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketplaceNFTs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNfts(MOCK_NFTS.filter(nft => nft.isListed));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch NFTs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserNFTs = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Filter NFTs by owner (mock)
      const owned = MOCK_NFTS.filter(nft => 
        nft.owner.toLowerCase() === address.toLowerCase() ||
        nft.creator.toLowerCase() === address.toLowerCase()
      );
      setUserNfts(owned);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user NFTs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mintNFT = useCallback(async (params: MintParams, address: string): Promise<NFTMetadata | null> => {
    setIsMinting(true);
    setError(null);

    try {
      // Validate params
      if (!params.name.trim()) throw new Error('Name is required');
      if (!params.imageURI.trim()) throw new Error('Image URI is required');
      if (params.royaltyPercentage > PLATFORM_CONFIG.maxRoyalty) {
        throw new Error(`Royalty cannot exceed ${PLATFORM_CONFIG.maxRoyalty / 100}%`);
      }

      // Simulate minting transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newNFT: NFTMetadata = {
        id: `${Date.now()}`,
        tokenId: nfts.length + 1,
        name: params.name,
        description: params.description,
        imageURI: params.imageURI,
        mediaType: params.mediaType,
        royaltyPercentage: params.royaltyPercentage,
        creator: address,
        owner: address,
        price: '0',
        isListed: false,
        createdAt: Date.now(),
        attributes: params.attributes
      };

      setNfts(prev => [...prev, newNFT]);
      setUserNfts(prev => [...prev, newNFT]);
      
      return newNFT;
    } catch (err: any) {
      setError(err.message || 'Failed to mint NFT');
      return null;
    } finally {
      setIsMinting(false);
    }
  }, [nfts.length]);

  const batchMint = useCallback(async (items: MintParams[], address: string): Promise<NFTMetadata[]> => {
    setIsMinting(true);
    setError(null);

    try {
      if (items.length > PLATFORM_CONFIG.maxBatchSize) {
        throw new Error(`Maximum batch size is ${PLATFORM_CONFIG.maxBatchSize}`);
      }

      // Simulate batch minting
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newNFTs: NFTMetadata[] = items.map((params, index) => ({
        id: `${Date.now()}-${index}`,
        tokenId: nfts.length + index + 1,
        name: params.name,
        description: params.description,
        imageURI: params.imageURI,
        mediaType: params.mediaType,
        royaltyPercentage: params.royaltyPercentage,
        creator: address,
        owner: address,
        price: '0',
        isListed: false,
        createdAt: Date.now(),
        attributes: params.attributes
      }));

      setNfts(prev => [...prev, ...newNFTs]);
      setUserNfts(prev => [...prev, ...newNFTs]);
      
      return newNFTs;
    } catch (err: any) {
      setError(err.message || 'Failed to batch mint NFTs');
      return [];
    } finally {
      setIsMinting(false);
    }
  }, [nfts.length]);

  const listForSale = useCallback(async (tokenId: number, price: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (parseFloat(price) <= 0) throw new Error('Price must be greater than 0');

      // Simulate listing transaction
      await new Promise(resolve => setTimeout(resolve, 1500));

      setNfts(prev => prev.map(nft => 
        nft.tokenId === tokenId 
          ? { ...nft, price, isListed: true }
          : nft
      ));
      setUserNfts(prev => prev.map(nft => 
        nft.tokenId === tokenId 
          ? { ...nft, price, isListed: true }
          : nft
      ));

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to list NFT');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unlistFromSale = useCallback(async (tokenId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate unlisting transaction
      await new Promise(resolve => setTimeout(resolve, 1500));

      setNfts(prev => prev.map(nft => 
        nft.tokenId === tokenId 
          ? { ...nft, isListed: false }
          : nft
      ));
      setUserNfts(prev => prev.map(nft => 
        nft.tokenId === tokenId 
          ? { ...nft, isListed: false }
          : nft
      ));

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to unlist NFT');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const buyNFT = useCallback(async (tokenId: number, buyerAddress: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate purchase transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      setNfts(prev => prev.map(nft => 
        nft.tokenId === tokenId 
          ? { ...nft, owner: buyerAddress, isListed: false }
          : nft
      ));

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to buy NFT');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    nfts,
    userNfts,
    isLoading,
    isMinting,
    error,
    fetchMarketplaceNFTs,
    fetchUserNFTs,
    mintNFT,
    batchMint,
    listForSale,
    unlistFromSale,
    buyNFT
  };
}
