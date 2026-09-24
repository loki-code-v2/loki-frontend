import { $, component$, useStylesScoped$ } from "@builder.io/qwik";
import { LokiProjectDeploymentsService } from "~/services/LokiProjectDeploymentsService";
import { AlertService } from "~/services/alertService";
import type { NetworkNames } from "~/services/chainService";
import Deployer from "./deployer";
import styles from "./deployment-history-item.scss?inline";
import HistoryItem from "./historyItem";
import type { compilation } from "./models";

interface LokiFileCompilationHistoryItemProps {
  compilationData: compilation;
  projectId: string;
  deploymentHappened: { contractAddress: string | null };
}

export default component$((props: LokiFileCompilationHistoryItemProps) => {
  useStylesScoped$(styles);
  const formatDate = (date: Date) => date.toLocaleDateString();

  const onDeploymentSuccess = $(
    async (contractAddress: string, networkName: NetworkNames) => {
      try {
        let deploymentData: any = {
          projectId: props.projectId,
          address: contractAddress,
          network: networkName,
          compilationId: String(props.compilationData!.id),
        };

        if (props.compilationData.commit?.sha) {
          deploymentData = {
            ...deploymentData,
            sha: props.compilationData.commit.sha,
          };
        }

        await LokiProjectDeploymentsService.saveDeployment(deploymentData);
        props.deploymentHappened.contractAddress = contractAddress;
      } catch (error) {
        console.log("Compilation Failed");
      }
    }
  );

  return (
    <HistoryItem>
      <sl-badge variant="neutral">Compilation</sl-badge>
      <div class="flex deployment-history-item">
        <div class="flex-column">
          <div class="flex">
            <sl-icon name="person-circle"></sl-icon>
            <p id="user-name">{props.compilationData.user.email}</p>
          </div>
          <div class="flex">
            <sl-icon name="calendar3"></sl-icon>
            <p id="date">
              {new Date(
                props.compilationData.createdAt as any as string
              ).toLocaleString()}
            </p>
          </div>
          {props.compilationData.name && (
            <div class="flex">
              <sl-icon name="file-earmark-code"></sl-icon>
              <span>{props.compilationData.name.replace(/\s+/g, "-")}</span>
            </div>
          )}
          <div class="flex">
            <sl-icon name="code-slash"></sl-icon>
            <span id="contract-name">{props.compilationData.contractName}</span>
          </div>
          <div class="flex">
            <div>
              <span>ABI</span>
              <sl-copy-button
                value={JSON.stringify(props.compilationData.abi)}
                feedback-duration="250"
              >
                ABI
              </sl-copy-button>
            </div>
            <div>
              <span>Bytecode</span>
              <sl-copy-button
                value={props.compilationData.bytecode}
                feedback-duration="250"
              ></sl-copy-button>
            </div>
          </div>
        </div>
        {props.compilationData.commit && (
          <div class="flex-column">
            <div class="flex">
              <sl-icon name="person-check"></sl-icon>
              <p>Commit Author: {props.compilationData.commit.author.login}</p>
            </div>
            <div class="flex">
              <sl-icon name="calendar-check"></sl-icon>
              <p>
                Commit Date:{" "}
                {formatDate(new Date(props.compilationData.commit.createdAt))}
              </p>
            </div>
            <div class="flex">
              <sl-icon name="chat-square-text"></sl-icon>
              <p class="commit-message">
                Commit Message: {props.compilationData.commit.message}
              </p>
            </div>
            <div class="flex">
              <sl-icon name="hash"></sl-icon>
              <p> Commit SHA: {props.compilationData.commit.sha}</p>
            </div>
            <div class="flex">
              <div class="flex">
                <sl-icon name="link"></sl-icon>
                <p>
                  <a href={props.compilationData.commit.url}>Commit URL</a>
                </p>
              </div>
              <div class="flex">
                <sl-icon name="link"></sl-icon>
                <p>
                  <a href={props.compilationData.commit.author.url}>
                    Author URL
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        <Deployer
          abi={props.compilationData.abi}
          bytecode={props.compilationData.bytecode}
          contractName={props.compilationData.name}
          onDeploymentSuccess$={onDeploymentSuccess}
          isBuilbearEnabled={true}
        ></Deployer>
      </div>
    </HistoryItem>
  );
});
