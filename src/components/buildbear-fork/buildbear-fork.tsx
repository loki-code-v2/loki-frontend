import { $, QRL, component$, useStore } from "@builder.io/qwik";
import { RequestStateEnum } from "~/models/request";
import { AlertService } from "~/services/alertService";
import { BuildBearService } from "~/services/buildbearService";
import { ChainService, NetworkNames } from "~/services/chainService";
import { Network } from "../deployments-page/models";
import { NetworkSelect } from "../network-selector/network-selector";

type BuildbearForkProps = {
  onCreatedFork$?: QRL<(forkedData: any) => void>;
};

export default component$<BuildbearForkProps>(({ onCreatedFork$ }) => {

  const createSandboxApiRequest = useStore<{ state: RequestStateEnum }>({ state: RequestStateEnum.Undefined });
  const selectedNetwork = useStore<{ value: NetworkNames | null }>({
    value: null,
  });

  const handleNetworkselect = $((e: Network | NetworkNames) => {
    if (typeof e === "string") {
      selectedNetwork.value = e;
      return;
    }
    else if (typeof e === "object") {
      selectedNetwork.value = e.name as NetworkNames;
      return;
    }
  });

  const createTestnet = $(async () => {
    createSandboxApiRequest.state = RequestStateEnum.Loading;
    BuildBearService.createSanboxAPI(ChainService.getChainId(selectedNetwork.value!)!).then((res) => {
      AlertService.notify("Once your testnet is created, you will need to add it to metamask before being able to use it and deploy your contract.");
      createSandboxApiRequest.state = RequestStateEnum.Success;
      if (onCreatedFork$) {
        onCreatedFork$(res);
      }
    }).catch((error) => {
      console.log(error);
      AlertService.notifyError("There was an error creating the testnet.");
      createSandboxApiRequest.state = RequestStateEnum.Error;
    });
  });
  return (
    <>
      <NetworkSelect onNetworkChange$={handleNetworkselect} ></NetworkSelect>
      <sl-button variant="primary"
        disabled={selectedNetwork.value === null || createSandboxApiRequest.state === RequestStateEnum.Loading}
        onClick$={createTestnet}
        loading={createSandboxApiRequest.state === RequestStateEnum.Loading}
      >
        Create Buildbear Testnet
      </sl-button>
    </>
  );
});