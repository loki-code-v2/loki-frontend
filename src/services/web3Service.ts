import { configureChains, createConfig, getAccount } from "@wagmi/core";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/html";
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  linea,
  lineaTestnet,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai,
  sepolia,
} from "viem/chains";
import { campNetwork } from "~/services/chainService";

/**
 * Single shared wagmi + web3modal instance.
 *
 * The original app created a NEW wagmi config + Web3Modal in every route
 * (9+ places). Multiple instances fight over the same injected-provider
 * state and cause crashes like "Cannot read properties of null (reading
 * 'some')" when the modal opens. All components now await this singleton.
 */
class Web3Service {
  private static web3modal: Web3Modal | null = null;
  private static initPromise: Promise<Web3Modal> | null = null;

  public static chains = [
    mainnet,
    sepolia,
    polygon,
    polygonMumbai,
    bsc,
    bscTestnet,
    arbitrum,
    arbitrumSepolia,
    optimism,
    optimismSepolia,
    avalanche,
    avalancheFuji,
    base,
    baseSepolia,
    linea,
    lineaTestnet,
    campNetwork,
  ];

  private static projectId = "8d9ca1226d44d7c3e50ca86f1d86e408";

  public static async getInstance(): Promise<Web3Modal> {
    if (!Web3Service.initPromise) {
      Web3Service.initPromise = (async () => {
        const projectId = Web3Service.projectId;
        const chains = Web3Service.chains;
        const { publicClient } = configureChains(chains, [
          w3mProvider({ projectId }),
        ]);
        const wagmiConfig = createConfig({
          autoConnect: true,
          connectors: w3mConnectors({ projectId, chains }),
          publicClient,
        });
        const ethereumClient = new EthereumClient(wagmiConfig, chains);
        const web3modal = new Web3Modal({ projectId }, ethereumClient);
        return web3modal;
      })();
    }
    return Web3Service.initPromise;
  }

  /**
   * Opens the wallet modal only when no wallet is connected, and only once
   * per page load. Swallows the injected-provider race that crashes
   * web3modal v2 when no wallet extension is present.
   */
  public static async openIfDisconnected(): Promise<void> {
    try {
      const web3modal = await Web3Service.getInstance();
      const account = getAccount();
      if (account.address === undefined) {
        await web3modal.openModal();
      }
    } catch (error) {
      // no injected wallet (or modal race) — do not crash the page
      console.log("Wallet not available yet", error);
    }
  }
}

export default Web3Service;
