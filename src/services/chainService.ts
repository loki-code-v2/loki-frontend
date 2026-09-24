import type { WalletClient } from "@wagmi/core";
import { getNetwork, getWalletClient, switchNetwork } from "@wagmi/core";
import type { ethers } from "ethers";
import { ContractFactory, providers } from "ethers";
import { AlertService } from "./alertService";
import { type Chain } from "viem";

export enum NetworkNames {
  Ethereum = "Ethereum",
  Sepolia = "Sepolia",
  Polygon = "Polygon",
  Mumbai = "Mumbai",
  BinanceSmartChain = "BinanceSmartChain",
  BinanceSmartChainTestnet = "BinanceSmartChainTestnet",
  Arbitrum = "Arbitrum",
  ArbitrumSepolia = "ArbitrumSepolia",
  Optimism = "Optimism",
  OptimismSepolia = "OptimismSepolia",
  CampNetwork = "CampNetwork",
  Avalanche = "Avalanche",
  AvalancheFuji = "AvalancheFuji",
  Base = "Base",
  BaseSepolia = "BaseSepolia",
  Linea = "Linea",
  LineaTestnet = "LineaTestnet",
  Buildbear = "Buildbear",
}

// define a type for the network object
export interface Network {
  name: NetworkNames;
  displayName: string;
  chainId: number;
  address: string;
  isTestnet: boolean;
}

const networks: Network[] = [
  {
    name: NetworkNames.Ethereum,
    displayName: "Ethereum",
    chainId: 1,
    address: "0x1",
    isTestnet: false,
  },
  {
    name: NetworkNames.Sepolia,
    displayName: "Sepolia",
    chainId: 11155111,
    address: "0xaa36a7",
    isTestnet: true,
  },
  {
    name: NetworkNames.Polygon,
    displayName: "Polygon",
    chainId: 137,
    address: "0x89",
    isTestnet: false,
  },
  {
    name: NetworkNames.Mumbai,
    displayName: "Mumbai",
    chainId: 80001,
    address: "0x13881",
    isTestnet: true,
  },
  {
    name: NetworkNames.BinanceSmartChain,
    displayName: "Binance Smart Chain",
    chainId: 56,
    address: "0x38",
    isTestnet: false,
  },
  {
    name: NetworkNames.BinanceSmartChainTestnet,
    displayName: "Binance Smart Chain Testnet",
    chainId: 97,
    address: "0x61",
    isTestnet: true,
  },
  {
    name: NetworkNames.Arbitrum,
    displayName: "Arbitrum",
    chainId: 42161,
    address: "0xa4b1",
    isTestnet: false,
  },
  {
    name: NetworkNames.ArbitrumSepolia,
    displayName: "Arbitrum Sepolia",
    chainId: 421614,
    address: "0x66eee",
    isTestnet: true,
  },
  {
    name: NetworkNames.Optimism,
    displayName: "Optimism",
    chainId: 10,
    address: "0xa",
    isTestnet: false,
  },
  {
    name: NetworkNames.OptimismSepolia,
    displayName: "Optimism Sepolia",
    chainId: 11155420,
    address: "0xaa37dc",
    isTestnet: true,
  },
  {
    name: NetworkNames.CampNetwork,
    displayName: "Camp Network",
    chainId: 325000,
    address: "0x4f588",
    isTestnet: true,
  },
  {
    name: NetworkNames.Avalanche,
    displayName: "Avalanche",
    chainId: 43114,
    address: "0xa86a",
    isTestnet: false,
  },
  {
    name: NetworkNames.AvalancheFuji,
    displayName: "Avalanche Fuji",
    chainId: 43113,
    address: "0xa869",
    isTestnet: true,
  },
  {
    name: NetworkNames.Base,
    displayName: "Base",
    chainId: 8453,
    address: "0x2105",
    isTestnet: false,
  },
  {
    name: NetworkNames.BaseSepolia,
    displayName: "Base Sepolia",
    chainId: 84532,
    address: "0x14a34",
    isTestnet: true,
  },
  {
    name: NetworkNames.Linea,
    displayName: "Linea",
    chainId: 59144,
    address: "0xe708",
    isTestnet: false,
  },
  {
    name: NetworkNames.LineaTestnet,
    displayName: "Linea Testnet",
    chainId: 59140,
    address: "0xe704",
    isTestnet: true,
  },
];

export const campNetwork = {
  id: 325000,
  name: "Camp Network Testnet V2",
  network: "Camp Network Testnet V2",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        "https://holy-newest-rain.camp-sepolia.quiknode.pro/38c20c60dc4c17f3a31861ea65a95456edecb89f/",
      ],
    },
    public: {
      http: [
        "https://holy-newest-rain.camp-sepolia.quiknode.pro/38c20c60dc4c17f3a31861ea65a95456edecb89f/",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Camp Network Block Explorer",
      url: "https://camp-network-testnet.blockscout.com",
    },
  },
} as const satisfies Chain;

export class ChainService {
  static getNetworkByName(name: NetworkNames): Network | undefined {
    return networks.find((network) => network.name === name);
  }

  static getChainId(name: NetworkNames): number | undefined {
    const network = this.getNetworkByName(name);
    return network ? network.chainId : undefined;
  }

  static getNetworkByChainId(chainId: number): Network | undefined {
    return networks.find((network) => network.chainId === chainId);
  }

  static getNetworkByAddress(address: string): Network | undefined {
    return networks.find((network) => network.address === address);
  }

  static isTestnet(name: NetworkNames): boolean | null {
    const network = this.getNetworkByName(name);
    return network ? network.isTestnet : null;
  }

  static getDisplayName(name: NetworkNames): string | null {
    const network = this.getNetworkByName(name);
    return network ? network.displayName : null;
  }
  static getAllNetworks(): any[] {
    return networks;
  }

  static getAllMainnets(): any[] {
    return networks.filter((network) => !network.isTestnet);
  }

  static getAllTestnets(): any[] {
    return networks.filter((network) => network.isTestnet);
  }

  static async deployWithWalletConnect(
    abi: any,
    bytecode: any,
    network: NetworkNames
  ): Promise<ethers.Contract> {
    try {
      const { chain } = getNetwork();

      if (chain!.id !== ChainService.getChainId(network)) {
        await switchNetwork({
          chainId: ChainService.getChainId(network)!,
        });
      }

      const signer = getEthersSigner({
        chainId: ChainService.getChainId(network),
      });

      const factory = new ContractFactory(abi, bytecode, await signer);
      return factory.deploy();
    } catch (error) {
      AlertService.notifyError("Error During deployment");
      throw error;
    }
  }
}

export interface abiFuncProps {
  name: string;
  type: string;
  inputs: [{ name: string; type: string; internalType: string }];
  outputs: [];
  stateMutability: string;
}

// Sets up the Web3Modal signer so that we can use ethers.js
export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Action to convert a viem Wallet Client to an ethers.js Signer. */
export async function getEthersSigner({ chainId }: { chainId?: number } = {}) {
  const walletClient = await getWalletClient({ chainId });
  if (!walletClient) return undefined;
  return walletClientToSigner(walletClient);
}
