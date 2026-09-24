import {
  component$,
  useSignal,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import type { SlPopup } from "@shoelace-style/shoelace";
import styles from "./deployment-history-item.scss?inline";
import HistoryItem from "./historyItem";

interface DeploymentHistoryItemProps {
  deploymentData: any;
  projectId: string;
  deploymentId: string;
}
/**
 * `DeploymentHistoryItem`
 * is a Qwik component that renders a deployment history item.
 * It takes in the Following props:
 * - `deploymentData` - The deployment data
 * it provides the following information:
 * - `Date`
 * - `Transaction Hash`
 * - `Contract Name`
 * - `Contract Address`
 * - `Network`
 * - `Deployer Wallet`
 * - `User`
 * - `Trigger` - The method that triggered the deployment
 *
 * @component
 * @example
 * // Usage of the DeploymentHistoryItem component
 * <DeploymentHistoryItem />
 */
export default component$<DeploymentHistoryItemProps>((props) => {
  useStylesScoped$(styles);

  const isMouseOverPopup = useSignal(false);
  const isMouseOverAnchor = useSignal(false);
  const nav = useNavigate();

  // useVisibleTask$(({ track }) => {
  //   track(() => isMouseOverPopup.value);
  //   track(() => isMouseOverAnchor.value);

  //   if (
  //     !isMouseOverPopup.value &&
  //     !isMouseOverAnchor.value &&
  //     props.deploymentData.trigger
  //   ) {
  //     const popup = document.getElementById(
  //       `triggered-by-popup-${props.deploymentData.id}`
  //     ) as SlPopup;
  //     const animation = popup.popup.animate(
  //       { opacity: [1, 0] },
  //       { duration: 200, easing: "ease-out" }
  //     );
  //     animation.onfinish = () => {
  //       popup.active = false;
  //     };
  //   }
  // });

  return (
    <HistoryItem>
      <sl-badge variant="neutral">Deployment</sl-badge>
      <div class="flex deployment-history-item">
        <div class="flex-column">
          <div class="flex">
            <sl-icon name="person-circle"></sl-icon>
            <p id="user-name">{props.deploymentData.user.email}</p>
          </div>
          <div class="flex">
            <sl-icon name="calendar3"></sl-icon>
            <p id="date">
              {new Date(
                props.deploymentData.createdAt as any as string
              ).toLocaleString()}
            </p>
          </div>
          {props.deploymentData.compilation.fileName && (
            <div class="flex">
              <sl-icon name="file-earmark-code"></sl-icon>
              <p id="filename">{props.deploymentData.compilation.fileName}</p>
            </div>
          )}
          <div class="flex">
            <sl-icon name="code-slash"></sl-icon>
            <p id="filename">{props.deploymentData.compilation.contractName}</p>
          </div>
          <div class="flex">
            {/* {props.deploymentData.trigger && (
              <>
                <p>Triggered by:</p>
                <sl-popup
                  id={`triggered-by-popup-${props.deploymentData.id}`}
                  flip
                  flip-fallback-placements="right bottom"
                  flip-fallback-strategy="initial"
                >
                  <p
                    slot="anchor"
                    id="trigger"
                    class="trigger-kind"
                    onMouseEnter$={async () => {
                      const popup = document.getElementById(
                        `triggered-by-popup-${props.deploymentData.id}`
                      ) as SlPopup;
                      popup.active = true;
                      await popup.popup.animate(
                        { opacity: [0, 1] },
                        { duration: 200, easing: "ease-in" }
                      );
                      isMouseOverAnchor.value = true;
                    }}
                    onMouseLeave$={async () => {
                      isMouseOverAnchor.value = false;
                    }}
                  >
                    {props.deploymentData.trigger.kind}
                  </p>
                  <div
                    class="popup-container2"
                    onMouseEnter$={() => {
                      isMouseOverPopup.value = true;
                    }}
                    onMouseLeave$={() => {
                      isMouseOverPopup.value = false;
                    }}
                  >
                    {props.deploymentData.trigger.kind === "WorkFlowRun" && (
                      <>
                        <div class="flex-column">
                          <p> Workflow Run</p>
                          <p class="popup-data">
                            Commit:{" "}
                            {props.deploymentData.trigger.data.commitSHA}
                          </p>
                          <p class="popup-data">
                            Date:{" "}
                            {new Date(
                              props.deploymentData.trigger.data.createdAt
                            ).toLocaleString()}
                          </p>
                        </div>
                      </>
                    )}
                    {props.deploymentData.trigger.kind === "compilation" && (
                      <>
                        <div class="flex-column">
                          <p> Compilation</p>
                          <p class="popup-data">
                            Commit:{" "}
                            {props.deploymentData.trigger.data.commitSHA}
                          </p>
                          <p class="popup-data">
                            Date:{" "}
                            {new Date(
                              props.deploymentData.trigger.data.createdAt
                            ).toLocaleString()}
                          </p>
                          <p class="popup-data">
                            <a href={props.deploymentData.trigger.data.url}>
                              View on Github
                            </a>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </sl-popup>
              </>
            )} */}
          </div>
        </div>
        <div id="transaction" class="flex-column">
          <div class="flex">
            <sl-icon name="house-door"></sl-icon>
            <p>{props.deploymentData.address}</p>
          </div>
          <div class="flex">
            <sl-icon name="link"></sl-icon>
            <p id="network">{props.deploymentData.network.toString()}</p>
          </div>
          <div class="flex">
            {/* <p>Sender Address: {props.deploymentData.transaction.senderAddress}</p> */}
          </div>
        </div>
        <sl-button
          variant="primary"
          outline
          class="playground-button"
          onClick$={() => {
            nav(`/project/${props.projectId}/playground/${props.deploymentId}`);
          }}
        >
          Playground
        </sl-button>
      </div>
    </HistoryItem>
  );
});
