import {
  $,
  component$,
  useSignal,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { LokiProjectDeploymentsService } from "~/services/LokiProjectDeploymentsService";
import { AlertService } from "~/services/alertService";
import type { NetworkNames } from "~/services/chainService";
import { ChainService } from "~/services/chainService";
import { LokiProjectService } from "~/services/lokiProjectService";
import styles from "./deploy-request-item.scss?inline";
import Deployer from "./deployer";
import { Abi } from "abitype";

interface DeployRequestItemProps {
  id: string;
  contract: string;
  network: number;
  time: string;
  user: string;
  abi: Abi;
  bytecode: string;
  projectId: number;
  email: string;
  deploymentHappened: { contractAddress: string | null };
}

export const DeployRequestItem = component$((props: DeployRequestItemProps) => {
  const hideElement = useSignal(false);
  useStylesScoped$(styles);
  useVisibleTask$(() => {
    const dialog = document.querySelector(`#review-dialog-${props.id}`);
    const openButton = document.querySelector(`#review-button-${props.id}`);

    const openDialog = async () => {
      (dialog as any)?.show();
    };

    openButton?.addEventListener("click", () => openDialog());

    dialog?.addEventListener("sl-request-close", (event) => {
      if ((event as any).detail.source === "overlay") {
        event.preventDefault();
      }
    });
  });

  useVisibleTask$(() => {
    const dialog = document.querySelector(`#delete-dialog-${props.id}`);
    const openButton = document.querySelector(`#delete-button-${props.id}`);

    const openDialog = async () => {
      (dialog as any)?.show();
    };

    openButton?.addEventListener("click", () => openDialog());

    dialog?.addEventListener("sl-request-close", (event) => {
      if ((event as any).detail.source === "overlay") {
        event.preventDefault();
      }
    });
  });

  const handleReject = $(() => {
    LokiProjectDeploymentsService.deleteDeployRequest(props.id)
      .then(() => {
        hideElement.value = true;
      })
      .catch((error) => {
        console.log(error);
      });
  });

  const onDeploymentSuccess = $(
    async (
      contractAddress: string,
      networkName: NetworkNames,
      chainId: number,
      abi: Abi,
      bytecode: string
    ) => {
      try {
        const compilation: any = await LokiProjectService.saveCompilation(
          props.projectId,
          JSON.stringify(abi),
          bytecode,
          props.contract
        );

        await LokiProjectDeploymentsService.saveDeployment({
          projectId: String(props.projectId),
          address: contractAddress,
          network: networkName,
          compilationId: compilation.data.id,
          deploymentRequestId: props.id,
        });

        // Not to reject since the deploy was successful, but to remove from the deploy request table and hide the element.
        await handleReject().catch((error) => console.error(error));
        props.deploymentHappened.contractAddress = contractAddress;
        const dialog = document.querySelector(`#review-dialog-${props.id}`);
        (dialog as any)?.hide();
      } catch (error) {
        AlertService.notifyError("Failed to save compilation or deployment");
        console.error(error);
      }
    }
  );

  return (
    <div
      class="transaction-container"
      style={{ display: hideElement.value ? "none" : "flex" }}
    >
      <div class="field-section">
        <div class="title">ID</div>
        <div class="value">{props.id}</div>
      </div>
      <div class="field-section">
        <div class="title">Contract</div>
        <div class="value">{props.contract}</div>
      </div>
      <div class="field-section">
        <div class="title">Chain ID</div>
        <div class="value">{props.network}</div>
      </div>
      <div class="field-section">
        <div class="title">Date & Time</div>
        <div class="value">
          {new Date(props.time as any as string).toLocaleString()}
        </div>
      </div>
      <div class="field-section">
        <div class="title">User</div>
        <div class="value">{props.email}</div>
      </div>
      <sl-dialog label="Deployment Review" id={`review-dialog-${props.id}`}>
        <div class="review-dialog">
          <div class="review-id">
            <div class="title">ID</div>
            <div class="value">{props.id}</div>
          </div>
          <div class="review-contract">
            <div class="title">Contract</div>
            <div class="value">{props.contract}</div>
          </div>
          <div class="review-datetime">
            <div class="title">Date & Time</div>
            <div class="value">
              {new Date(props.time as any as string).toLocaleString()}
            </div>
          </div>
          <div class="review-user">
            <div class="title">User</div>
            <div class="value">{props.email}</div>
          </div>
        </div>
        <Deployer
          abi={props.abi}
          bytecode={props.bytecode}
          contractName={props.contract}
          onDeploymentSuccess$={onDeploymentSuccess}
          isBuilbearEnabled={true}
          selectedNetwork={
            ChainService.getNetworkByChainId(props.network)?.name
          }
        ></Deployer>
      </sl-dialog>
      <div class="field-section">
        <sl-button
          class="review-button"
          id={`review-button-${props.id}`}
          variant="primary"
          outline
        >
          <div class="inside-review-button">
            <img title="asd" src="/icons/i-loki-pen-pad.svg" />
            <div class="review-button-text">Review</div>
          </div>
        </sl-button>
        <sl-dialog label="Are you sure?" id={`delete-dialog-${props.id}`}>
          <div>You can't reverse this action.</div>
          <sl-button
            class="delete-btn"
            variant="danger"
            onClick$={handleReject}
          >
            Reject Deployment
          </sl-button>
        </sl-dialog>
        <div class="reject-button" id={`delete-button-${props.id}`}>
          <img title="asd" src="/icons/i-loki-reject.svg" />
          <div class="reject-button-text">Reject Deployment</div>
        </div>
      </div>
    </div>
  );
});
