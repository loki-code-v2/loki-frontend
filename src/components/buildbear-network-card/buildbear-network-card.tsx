import { $, QRL, component$, useStore, useStylesScoped$, useVisibleTask$ } from "@builder.io/qwik";
import { RequestStateEnum } from "~/models/request";
import { BuildBearService, SandboxResponse } from "~/services/buildbearService";
import { ChainService } from "~/services/chainService";
import styles from "./buildbear-network-card.scss?inline";

type BuildbearNetworkCardProps = {
  indexDBid: string;
  isSelected?: boolean;
  onCardClick$?: QRL<(cardId: string) => void>;
};

export default component$<BuildbearNetworkCardProps>(({ indexDBid, isSelected, onCardClick$ }) => {

  useStylesScoped$(styles);

  const getSandBoxRequest = useStore<{ state: RequestStateEnum }>({ state: RequestStateEnum.Undefined });
  const refreshRequest = useStore<{ state: RequestStateEnum }>({ state: RequestStateEnum.Undefined });
  const cardData = useStore<{ data: SandboxResponse | null }>({ data: null });

  const refreshCard = $(() => {
    refreshRequest.state = RequestStateEnum.Loading;
    BuildBearService.sandboxStatus(cardData.data?.sandboxId!, indexDBid).then(async (res) => {
      refreshRequest.state = RequestStateEnum.Success;
      cardData.data = res;
    }).catch((error: any) => {
      refreshRequest.state = RequestStateEnum.Error;
      console.log(error);
    })
  });

  useVisibleTask$(() => {
    getSandBoxRequest.state = RequestStateEnum.Loading;
    BuildBearService.getSandbox(indexDBid).then((res) => {
      getSandBoxRequest.state = RequestStateEnum.Success;
      cardData.data = res;
    }).catch((error: any) => {
      getSandBoxRequest.state = RequestStateEnum.Error;
      console.log(error);
    });
  });
  return (
    <div class={`flex-column buildbear-card ${cardData.data?.status === "live" ? "live" : ""} ${isSelected ? "selected" : ""}`}
      onClick$={(e) => {
        if (cardData.data?.status === "live") {
          if (onCardClick$) {
            onCardClick$(indexDBid);
          }
        }
      }}
    >
      {getSandBoxRequest.state === RequestStateEnum.Success && (
        <>
          {cardData.data?.status === "live" && (
            <>
              <p class="network-name flex card-header">{cardData.data?.sandboxId}
                {
                  refreshRequest.state === RequestStateEnum.Loading ? (
                    <sl-spinner></sl-spinner>
                  ) : (
                    <sl-icon-button name="arrow-clockwise" label="refresh" onClick$={refreshCard}></sl-icon-button>
                  )
                }

              </p>
              <div class="flex-column">
                <div class="flex">
                  <sl-badge variant="success" pill pulse class="pulsating-badge">Live</sl-badge>
                </div>
                <sl-button-group label="Alignment">
                  <sl-button variant="primary" outline onClick$={(event) => {
                    event.stopPropagation();
                    navigator.clipboard.writeText(cardData.data?.rpcUrl!);
                  }}>
                    Copy RPC
                  </sl-button>
                  <sl-button variant="primary" outline onClick$={(event) => {
                    event.stopPropagation();
                    window.open(cardData.data?.faucetUrl!);
                  }}>
                    Open Faucet
                  </sl-button>
                  <sl-button variant="primary" outline onClick$={(event) => {
                    event.stopPropagation();
                    window.open(cardData.data?.explorerUrl!);
                  }}>
                    View Explorer
                  </sl-button>
                </sl-button-group>
                <sl-button variant="primary" onClick$={async (event) => {
                  event.stopPropagation();
                  await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                      {
                        chainId: "0x" + cardData.data?.chainId!.toString(16), // check theh value of this
                        chainName: ChainService.getNetworkByChainId(cardData.data?.forkingDetails.chainId!)!.name! + " Fork",
                        rpcUrls: [cardData.data?.rpcUrl!],
                        blockExplorerUrls: [cardData.data?.explorerUrl!],
                      },
                    ],
                  });
                }}>
                  Add to Metamask
                </sl-button>
              </div>
            </>
          )}
          {cardData.data?.status === "started" && (
            <>
              <p class="network-name flex card-header">{cardData.data?.sandboxId}
                {
                  refreshRequest.state === RequestStateEnum.Loading ? (
                    <sl-spinner></sl-spinner>
                  ) : (
                    <sl-icon-button name="arrow-clockwise" label="refresh" onClick$={refreshCard}></sl-icon-button>
                  )
                }
              </p>
              <div class="flex-column">
                <div class="flex">
                  <sl-badge variant="primary" pill pulse class="pulsating-badge">Forking</sl-badge>
                </div>
              </div>
            </>

          )}
          {cardData.data?.status === "error" && (
            <>
              <p class="network-name">{cardData.data?.sandboxId}</p>
              <div class="flex-column">
                <div class="flex">
                  <sl-badge variant="danger" pill pulse class="pulsating-badge">Failed</sl-badge>
                </div>
              </div>
            </>
          )}
        </>
      )}
      {(getSandBoxRequest.state === RequestStateEnum.Loading || getSandBoxRequest.state === RequestStateEnum.Undefined) && (
        <>
          <sl-spinner></sl-spinner>
        </>
      )}
      {getSandBoxRequest.state === RequestStateEnum.Error && (
        <>
          <sl-icon-button name="arrow-clockwise" label="refresh"></sl-icon-button>
          <div class="flex">
            <sl-badge variant="danger" pill pulse class="pulsating-badge"></sl-badge>
            <p>Failed to get Sandbox</p>
          </div>
        </>
      )}
    </div>
  );
});