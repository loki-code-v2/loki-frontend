import {
  $,
  NoSerialize,
  component$,
  noSerialize,
  useSignal,
  useStore,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { RequestState, RequestStateEnum } from "~/models/request";
import { AlertService } from "~/services/alertService";
import { BuildBearService } from "~/services/buildbearService";
import { ChainService, Network, NetworkNames } from "~/services/chainService";
import { NetworkSelect } from "../network-selector/network-selector";
import styles from "./buildbear-menu.scss?inline";

interface buildbearResDataType {
  sandboxId: string | undefined;
  chainId: number | undefined;
  blockNumber: string | undefined;
  rpcUrl: string | undefined;
  explorerUrl: string | undefined;
  faucetUrl: string | undefined;
}

export default component$<{ onFinishedFork$?: () => void }>(({ onFinishedFork$ }) => {
  const buildBearMenuStore = useStore<{
    createTestnetRequest: RequestState<any>;
    testNetStatus: "live" | "started" | "error" | undefined;
    sandboxStatusIntervalId: NoSerialize<NodeJS.Timeout> | undefined;
  }>({
    createTestnetRequest: { state: RequestStateEnum.Undefined },
    testNetStatus: undefined,
    sandboxStatusIntervalId: undefined,
  });
  const buildbearResData = useStore<buildbearResDataType>({
    sandboxId: undefined,
    chainId: undefined,
    blockNumber: undefined,
    rpcUrl: undefined,
    explorerUrl: undefined,
    faucetUrl: undefined,
  });

  const selectedNetwork = useStore<{ value: NetworkNames }>({
    value: NetworkNames.Ethereum,
  });
  const testnetCreated = useSignal(false);
  useStylesScoped$(styles);

  const handleNetworkselect = $((e: Network | NetworkNames) => {
    if (typeof e === "string") {
      selectedNetwork.value = e;
      return;
    }
    else if (typeof e === "object") {
      selectedNetwork.value = e.name;
      return;
    }

  });

  // Look at the following link or Ethereum website to edit code to switch to network if it already exists.
  // https://stackoverflow.com/questions/69147280/how-to-make-a-custom-chain-connect-button-with-ethers-js
  const addNetwork = $(async () => {
    BuildBearService.sandboxStatus(buildbearResData.sandboxId!).then(async (res) => {
      // adds network to metamask if it is live
      if (res.data.status === "live") {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x" + buildbearResData.chainId!.toString(16), // check theh value of this
              chainName: selectedNetwork.value! + " Fork",
              rpcUrls: [buildbearResData.rpcUrl!],
              blockExplorerUrls: [buildbearResData.explorerUrl!],
            },
          ],
        }).then(() => {
          if (onFinishedFork$) {
            onFinishedFork$();
          }
        });
      } else {
        AlertService.notifyError(
          "Your forked network is not yet live. Please try again in a few minutes."
        );
      }
    }).catch((error) => {
      AlertService.notifyError("Error getting status or switching network.");
      console.log(error);
    });

  });

  const checkSandboxStatus = $(async () => {
    BuildBearService.sandboxStatus(buildbearResData.sandboxId!).then((res) => {
      buildBearMenuStore.testNetStatus = res.data.status;
    }).catch((error) => {
      AlertService.notifyError("Error getting BuildBear forked network status.");
      console.log(error);
    });
  });

  const createTestnet = $(async () => {
    AlertService.notify("Once your testnet is created, you will need to add it to metamask before being able to use it and deploy your contract.");
    buildBearMenuStore.createTestnetRequest.state = RequestStateEnum.Loading;
    BuildBearService.createSanboxAPI(ChainService.getChainId(selectedNetwork.value!)!).then((res) => {
      buildbearResData.sandboxId = res.data.sandboxId;
      buildbearResData.chainId = res.data.chainId;
      buildbearResData.blockNumber = res.data.forkingDetails.blockNumber;
      buildbearResData.rpcUrl = res.data.rpcUrl;
      buildbearResData.explorerUrl = res.data.explorerUrl;
      buildbearResData.faucetUrl = res.data.faucetUrl;
      testnetCreated.value = true;
      buildBearMenuStore.createTestnetRequest.state = RequestStateEnum.Success;
      const intervalId = setInterval(async () => {
        await checkSandboxStatus();
      }, 1000);
      buildBearMenuStore.sandboxStatusIntervalId = noSerialize(intervalId);
    }).catch((error) => {
      console.log(error);
      buildBearMenuStore.createTestnetRequest.state = RequestStateEnum.Error;
    });
  });





  useVisibleTask$(({ track }) => {
    track(() => buildBearMenuStore.testNetStatus);
    if (buildBearMenuStore.testNetStatus === "live" || buildBearMenuStore.testNetStatus === "error") {
      clearInterval(buildBearMenuStore.sandboxStatusIntervalId!);
    }

  });



  return (
    <>
      <div class="buildbear-menu_header flex">
        <h4>Buildbear Config</h4>
        {testnetCreated.value === true && (
          <sl-dropdown>
            <sl-icon-button slot="trigger" name="three-dots-vertical" label="three-dots-vertical"></sl-icon-button>
            <sl-menu>
              <sl-menu-item value="cut">Delete</sl-menu-item>
              <sl-menu-item value="AddToMetamask" onClick$={addNetwork}>Add Forked Network to Metamask</sl-menu-item>
            </sl-menu>
          </sl-dropdown>
        )}
      </div>
      {testnetCreated.value === false ? (
        <>
          <NetworkSelect onNetworkChange$={handleNetworkselect} ></NetworkSelect>
          <sl-button variant="primary" onClick$={createTestnet} loading={buildBearMenuStore.createTestnetRequest.state === "loading"}>
            Create Buildbear Testnet
          </sl-button>
        </>
      ) : (
        <div class="flex-column">
          <div class="flex build-bear_fork-status">
            <div>
              <p>{selectedNetwork.value}</p>
              <p class="label">Block {buildbearResData.blockNumber}</p>
            </div>
            {
              buildBearMenuStore.testNetStatus === "started" ? (
                <div class="flex">
                  <sl-badge pill>Forking network</sl-badge>
                  <sl-spinner></sl-spinner>
                </div>
              ) : buildBearMenuStore.testNetStatus === "live" ? (
                <sl-badge variant="success" pill>Success</sl-badge>
              ) : buildBearMenuStore.testNetStatus === "error" ? (
                <sl-badge variant="danger" pill>Error</sl-badge>
              ) : (
                <div class="flex">
                  <sl-badge pill>Forking network</sl-badge>
                  <sl-spinner></sl-spinner>
                </div>
              )
            }

          </div>
          <div>
            <sl-button-group label="Alignment">
              <sl-button disabled={buildBearMenuStore.testNetStatus !== "live"} variant="primary" outline onClick$={() => {
                navigator.clipboard.writeText(buildbearResData.rpcUrl!);
              }}>
                Copy RPC
              </sl-button>
              <sl-button disabled={buildBearMenuStore.testNetStatus !== "live"} variant="primary" outline onClick$={() => {
                window.open(buildbearResData.faucetUrl!);
              }}>
                Open Faucet
              </sl-button>
              <sl-button disabled={buildBearMenuStore.testNetStatus !== "live"} variant="primary" outline onClick$={() => {
                window.open(buildbearResData.explorerUrl!);
              }}>
                View Explorer
              </sl-button>
              <sl-button disabled={buildBearMenuStore.testNetStatus !== "live"} variant="primary" onClick$={addNetwork}>
                Add to Metamask
              </sl-button>
            </sl-button-group>
          </div>
        </div>
      )}
    </>
  );
});

