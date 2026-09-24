import { $, QRL, component$, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { SlDialog } from "@shoelace-style/shoelace";
import { RequestStateEnum } from "~/models/request";
import { BuildBearService } from "~/services/buildbearService";
import BuildbearFork from "../buildbear-fork/buildbear-fork";
import BuildbearNetworkCard from "../buildbear-network-card/buildbear-network-card";



type BuildbearButtonProps = {
  onSelectedSandbox$?: QRL<(sandboxData: any) => void>;
};

export default component$<BuildbearButtonProps>(({ onSelectedSandbox$ }) => {

  const uuid = useSignal("xxxxxxx".replace(/[x]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    return r.toString(16);
  }));

  const sandboxes = useStore<{ sandboxes: any[] }>({ sandboxes: [] });
  const refreshingRequest = useStore<{ state: RequestStateEnum }>({ state: RequestStateEnum.Undefined });
  const selectedCard = useStore<{ indexDBid: string | undefined }>({ indexDBid: undefined });

  const fetchAndSortSandboxes = $(async () => {
    try {
      const res = await BuildBearService.getSandboxes();
      const result = res.sort((a: any, b: any) => new Date(b.indexDBCreatedAt).getTime() - new Date(a.indexDBCreatedAt).getTime());
      return res.sort((a: any, b: any) => new Date(b.indexDBCreatedAt).getTime() - new Date(a.indexDBCreatedAt).getTime());
    } catch (error) {
      console.log(error);
    }
  });

  const updateSandboxes = $(async (s: any[]) => {
    for (const sandbox of s) {
      await BuildBearService.sandboxStatus(sandbox.sandboxId, sandbox.id);
    }
  });

  const refresh = $(async () => {
    //updateSandboxes(sandboxes.sandboxes);
    refreshingRequest.state = RequestStateEnum.Loading;
    try {
      sandboxes.sandboxes = [];
      sandboxes.sandboxes = await fetchAndSortSandboxes();
      refreshingRequest.state = RequestStateEnum.Success;
    } catch (error) {
      refreshingRequest.state = RequestStateEnum.Error;
    }
  });


  const handleCardClick = $((cardId: any) => {
    selectedCard.indexDBid = cardId;
    onSelectedSandbox$?.(sandboxes.sandboxes.find((s) => s.id === cardId));
  });


  useVisibleTask$(async () => {
    const sortedSandboxes = await fetchAndSortSandboxes();
    sandboxes.sandboxes = sortedSandboxes;
    updateSandboxes(sortedSandboxes);
  });

  return (<>
    <sl-button slot="anchor"
      onClick$={() => {
        const dialog = document.getElementById(`buildbear-dialog-${uuid.value}`) as SlDialog;
        dialog.show();
      }}
    >Buildbear</sl-button>

    <sl-dialog id={`buildbear-dialog-${uuid.value}`} class="loki-dialog"
      label={sandboxes.sandboxes.length === 0 ? "Create a Buildbear Testnet" : "Select a Buildbear Testnet"}
    >
      <div class="new-popup-container2">
        <div class="flex-column">
          {
            selectedCard.indexDBid !== undefined && (
              <sl-tag>
                Selected: {sandboxes.sandboxes.find((s) => s.id === selectedCard.indexDBid)?.sandboxId}
              </sl-tag>
            )
          }
          <BuildbearFork
            onCreatedFork$={refresh}
          >

          </BuildbearFork>
          {
            refreshingRequest.state === RequestStateEnum.Loading ? (
              <sl-spinner></sl-spinner>
            ) : (
              sandboxes.sandboxes
                .map(async (sandbox, index) =>
                  <BuildbearNetworkCard
                    key={index}
                    indexDBid={sandbox.id}
                    isSelected={sandbox.id === selectedCard.indexDBid}
                    onCardClick$={handleCardClick}></BuildbearNetworkCard>
                )
            )
          }
        </div>
      </div>
    </sl-dialog>
  </>);
});