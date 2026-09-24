import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import styles from "./deployment-history-item.scss?inline";
import HistoryItem from "./historyItem";

interface DeploymentImportItemProps {
  deploymentData: any;
  projectId: string;
  deploymentId: string;
}

export default component$<DeploymentImportItemProps>((props) => {
  useStylesScoped$(styles);
  const nav = useNavigate();

  return (
    <HistoryItem>
      <sl-badge variant="neutral">Imported Deployment</sl-badge>
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
          <div class="flex">
            <sl-icon name="code-slash"></sl-icon>
            <p id="filename">{props.deploymentData.contractName}</p>
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
          <div class="flex"></div>
        </div>
        <sl-button
          variant="primary"
          outline
          class="playground-button"
          onClick$={() => {
            nav(
              `/project/${props.projectId}/playground/imported/${props.deploymentId}`
            );
          }}
        >
          Playground
        </sl-button>
      </div>
    </HistoryItem>
  );
});
