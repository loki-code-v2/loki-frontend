import { component$ } from "@builder.io/qwik";
import DeploymentHistoryItem from "./deploymentHistoryItem";
import GitHubActionWorkFlowRunHistoryItem from "./gitHubActionWorkFlowRunHistoryItem";
import LokiFileCompilationHistoryItem from "./lokiFileCompilationHistoryItem";
import DeploymentImportItem from "./deploymentImportItem";
import { DeployRequestItem } from "./deploy-request-item";

interface RecentEventProps {
  event: any; // You might want to replace 'any' with a more specific type that represents your event.
  projectId: string;
  deploymentHappened: { contractAddress: string | null };
}

export default component$<RecentEventProps>((props) => {
  return (
    <>
      {props.event.type === "Deployment" && (
        <DeploymentHistoryItem
          deploymentData={props.event}
          projectId={props.projectId}
          deploymentId={props.event.id}
        />
      )}
      {props.event.type === "ImportedDeployment" && (
        <DeploymentImportItem
          deploymentData={props.event}
          projectId={props.projectId}
          deploymentId={props.event.id}
        />
      )}
      {props.event.type === "ImportedContract" && (
        <LokiFileCompilationHistoryItem
          projectId={props.projectId}
          compilationData={props.event}
          deploymentHappened={props.deploymentHappened}
        />
      )}
      {props.event.type === "WorkflowRun" && (
        <GitHubActionWorkFlowRunHistoryItem
          workflowRun={props.event}
          projectId={props.projectId}
        />
      )}
      {props.event.type === "DeployRequest" && (
        <DeployRequestItem
          id={props.event.id}
          contract={props.event.contractName}
          network={props.event.chainId}
          time={props.event.createdAt}
          user={props.event.userId}
          projectId={props.event.lokiProjectId}
          abi={props.event.abi}
          bytecode={props.event.bytecode}
          email={props.event.email}
          deploymentHappened={props.deploymentHappened}
        />
      )}
    </>
  );
});
