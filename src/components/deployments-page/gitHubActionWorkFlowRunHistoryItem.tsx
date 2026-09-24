import {
  $,
  component$,
  useSignal,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import { LokiProjectDeploymentsService } from "~/services/LokiProjectDeploymentsService";
import { AlertService } from "~/services/alertService";
import type { NetworkNames } from "~/services/chainService";
import { LokiProjectService } from "~/services/lokiProjectService";
import ArtifactList from "./artifactList";
import Deployer from "./deployer";
import styles from "./deployment-history-item.scss?inline";
import HistoryItem from "./historyItem";
import type { WorkFlowRun } from "./models";

interface GitHubActionWorkFlowRunHistoryItemProps {
  workflowRun: WorkFlowRun;
  projectId: string;
}

export default component$<GitHubActionWorkFlowRunHistoryItemProps>((props) => {
  useStylesScoped$(styles);

  const formatDate = (date: Date) => date.toLocaleDateString();
  const abi = useSignal("");
  const bytecode = useSignal("");
  const artifactId = useSignal("");
  const selectedArtifact = useStore<{ artifact: any }>({ artifact: {} });

  const handleSelectedArtifact = $((artifact: any) => {
    abi.value = artifact.abi;
    bytecode.value = artifact.bytecode;
    artifactId.value = artifact.id;
    selectedArtifact.artifact = artifact;
  });

  const onDeploymentSuccess = $(
    async (
      contractAddress: string,
      networkName: NetworkNames,
      chainId: number,
      abi: string,
      bytecode: string,
    ) => {
      try {
        let compilationData;
        await LokiProjectService.saveCompilation(
          Number(props.projectId),
          abi,
          bytecode,
          selectedArtifact.artifact.name,
          props.workflowRun.commit.sha
        )
          .then((res) => {
            compilationData = res.data;
            console.log("Compilation data", compilationData);
          })
          .catch((error) => {
            console.log(error);
          });

        await LokiProjectDeploymentsService.saveDeployment({
          projectId: props.projectId,
          address: contractAddress,
          network: networkName,
          compilationId: compilationData!.id,
          sha: props.workflowRun.commit.sha,
          gitHubWorkFlowRunId: props.workflowRun.id.toString(),
          gitHubArtifactId: artifactId.value,
        }).catch((error) => {
          console.log(error);
        });
      } catch (error) {
        AlertService.notifyError("Failed to save deployment");
      }
    }
  );

  const onDeploymentFailed = $(() => {
    AlertService.notifyError("Failed to deploy contract");
  });

  return (
    <HistoryItem>
      <sl-badge variant="neutral">Workflow Run</sl-badge>
      <div class="flex deployment-history-item">
        <div class="flex-column">
          <div class="flex">
            <sl-icon name="person-circle"></sl-icon>
            <p id="user-name">{props.workflowRun.actor.login}</p>
          </div>
          <div class="flex">
            <sl-icon name="calendar3"></sl-icon>
            <p id="date">
              {new Date(
                props.workflowRun.createdAt as any as string
              ).toLocaleString()}
            </p>
          </div>
          <div class="flex">
            {props.workflowRun.status === "success" && (
              <>
                <div class="flex-column">
                  <div class="flex">
                    <sl-icon name="check2-circle"></sl-icon>
                    <p id="status">Success</p>
                  </div>
                  <ArtifactList
                    projectId={props.projectId}
                    workflowRunId={props.workflowRun.id.toString()}
                    onSelectedArtifact$={handleSelectedArtifact}
                  ></ArtifactList>
                  {selectedArtifact.artifact.id && (
                    <div class="flex-column">
                      <p>Artifact ID: {selectedArtifact.artifact.id}</p>
                      <p>Artifact Name: {selectedArtifact.artifact.name}</p>
                    </div>
                  )}
                </div>
              </>
            )}
            {props.workflowRun.status === "failure" && (
              <>
                <sl-icon name="x-circle"></sl-icon>
                <p id="status">Failure</p>
              </>
            )}
            {props.workflowRun.status === "pending" && (
              <>
                <sl-icon name="clock"></sl-icon>
                <p id="status">Pending</p>
              </>
            )}
          </div>
        </div>
        <div class="flex-column">
          <div class="flex">
            <sl-icon name="person-circle"></sl-icon>
            <p>Commit Author: {props.workflowRun.commit.author.login}</p>
          </div>
          <div class="flex">
            <sl-icon name="calendar3"></sl-icon>
            <p>{formatDate(new Date(props.workflowRun.commit.createdAt))}</p>
          </div>
          <div class="flex">
            <sl-icon name="chat-square-text"></sl-icon>
            <p class="commit-message">
              Commit message: {props.workflowRun.commit.message}
            </p>
          </div>
          <div class="flex">
            <sl-icon name="hash"></sl-icon>
            <p>{props.workflowRun.commit.sha}</p>
          </div>
          <div class="flex">
            <div class="flex">
              <sl-icon name="link"></sl-icon>
              <p>
                <a href={props.workflowRun.commit.url}>Commit URL</a>
              </p>
            </div>
            <div class="flex">
              <sl-icon name="link"></sl-icon>
              <p>
                <a href={props.workflowRun.commit.author.url}>Author URL</a>
              </p>
            </div>
          </div>
        </div>
        {props.workflowRun.status === "success" && (
          <Deployer
            abi={abi.value}
            bytecode={bytecode.value}
            contractName={selectedArtifact.artifact.name}
            onDeploymentSuccess$={onDeploymentSuccess}
            onDeploymentFailure$={onDeploymentFailed}
            isBuilbearEnabled={true}
          ></Deployer>
        )}
        {props.workflowRun.status !== "success" && <div></div>}
      </div>
    </HistoryItem>
  );
});
