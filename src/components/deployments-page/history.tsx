import {
  Resource,
  component$,
  useResource$,
  useSignal,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import { LokiProjectDeploymentsService } from "~/services/LokiProjectDeploymentsService";
import { DeployRequestItem } from "./deploy-request-item";
import DeploymentHistoryItem from "./deploymentHistoryItem";
import GitHubActionWorkFlowRunHistoryItem from "./gitHubActionWorkFlowRunHistoryItem";
import styles from "./history.scss?inline";
import LokiFileCompilationHistoryItem from "./lokiFileCompilationHistoryItem";
import RecentEvent from "./recentEvent";
import { DeploymentImport } from "./deployment-import";
import DeploymentImportItem from "./deploymentImportItem";

/**
 * `History`
 * is a Qwik component that renders a list of history items.
 * History items are either deployments, plain text imports,
 * compilations made in the project file view, or GitHub action runs.
 *
 * @component
 * @example
 * // Usage of the History component
 * <History />
 */
interface HistoryProps {
  projectId: string;
}

export default component$<HistoryProps>((props: HistoryProps) => {
  useStylesScoped$(styles);

  const deploymentHappened = useStore<{ contractAddress: string | null }>({
    contractAddress: null,
  });

  const importDeploymentHappened = useSignal(0);

  const deployRequests = useStore({
    value: [],
  });

  const deployments = useResource$(async ({ track }) => {
    track(() => deploymentHappened.contractAddress);
    track(() => importDeploymentHappened.value);

    const normalDeployments =
      await LokiProjectDeploymentsService.fetchDeployments(props.projectId);
    const importedDeployments =
      await LokiProjectDeploymentsService.fetchImportedDeployments(
        props.projectId
      );

    const normalWithType = normalDeployments.data.map((item: any) => ({
      ...item,
      type: "normal",
    }));

    const importedWithType = importedDeployments.data.map((item: any) => ({
      ...item,
      type: "imported",
    }));

    const responseData = [...normalWithType, ...importedWithType];

    return responseData;
  });

  const recentEvents = useResource$(async ({ track }) => {
    track(() => deploymentHappened.contractAddress);
    track(() => importDeploymentHappened.value);
    const responseData = await LokiProjectDeploymentsService.fetchRecentEvents(
      props.projectId
    );

    return responseData.data;
  });

  const compilations = useResource$(async () => {
    const responseData = await LokiProjectDeploymentsService.fetchCompilations(
      props.projectId
    );

    return responseData.data;
  });

  // const workflowRuns = useResource$(async () => {
  //   const responseData = await LokiProjectDeploymentsService.fetchWorkflowRuns(
  //     props.projectId
  //   );

  //   return responseData.data;
  // });

  const deployRequestsResource = useResource$(async () => {
    const responseData =
      await LokiProjectDeploymentsService.fetchDeployRequests(props.projectId);
    // I put the data in a store so the UI updates upon change.
    deployRequests.value = responseData.data;

    return responseData.data;
  });

  return (
    <sl-tab-group>
      <sl-tab slot="nav" panel="recent-events">
        Recent Events
      </sl-tab>
      {/* <sl-tab slot="nav" panel="workflow-runs">
        Workflow Runs
      </sl-tab> */}
      <sl-tab slot="nav" panel="compilations">
        Compilations
      </sl-tab>
      <sl-tab slot="nav" panel="deployments">
        Deployments
      </sl-tab>
      <sl-tab slot="nav" panel="deploy-requests">
        Deploy Requests
      </sl-tab>
      <sl-tab slot="nav" panel="deployment-import">
        Import Deployment
      </sl-tab>
      <sl-tab-panel name="recent-events">
        <div class="history-tab">
          <Resource
            value={recentEvents}
            onPending={() => <sl-spinner />}
            onRejected={(error) => (
              <div>Error loading recent events: {error.message}</div>
            )}
            onResolved={(response) => {
              return (
                <>
                  {response.map((e: any) => (
                    <RecentEvent
                      event={e}
                      key={`recent-${e.id}}`}
                      projectId={props.projectId}
                      deploymentHappened={deploymentHappened}
                    />
                  ))}
                </>
              );
            }}
          />
        </div>
      </sl-tab-panel>
      {/* <sl-tab-panel name="workflow-runs">
        <div class="history-tab">
          <Resource
            value={workflowRuns}
            onPending={() => <sl-spinner />}
            onRejected={(error) => (
              <div>Error loading workflow runs: {error.message}</div>
            )}
            onResolved={(response) => {
              return (
                <>
                  {response.map((e: any) => (
                    <GitHubActionWorkFlowRunHistoryItem
                      projectId={props.projectId}
                      workflowRun={e}
                      key={`workflow-${e.id}}`}
                    />
                  ))}
                </>
              );
            }}
          />
        </div>
      </sl-tab-panel> */}
      <sl-tab-panel name="compilations">
        <div class="history-tab">
          <Resource
            value={compilations}
            onPending={() => <sl-spinner />}
            onRejected={(error) => (
              <div>Error loading compilations: {error.message}</div>
            )}
            onResolved={(response) => {
              return (
                <>
                  {response
                    .sort(
                      (a: any, b: any) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((e: any) => (
                      <LokiFileCompilationHistoryItem
                        projectId={props.projectId}
                        compilationData={e}
                        deploymentHappened={deploymentHappened}
                        key={`compilation-${e.id}}`}
                      />
                    ))}
                </>
              );
            }}
          />
        </div>
      </sl-tab-panel>

      <sl-tab-panel name="deployments">
        <div class="history-tab">
          <Resource
            value={deployments}
            onPending={() => <sl-spinner />}
            onRejected={(error) => (
              <div>Error loading deployments: {error.message}</div>
            )}
            onResolved={(response) => {
              return (
                <>
                  {response
                    .sort(
                      (a: any, b: any) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((e: any) => {
                      return (
                        <>
                          {e.type === "normal" && (
                            <DeploymentHistoryItem
                              deploymentData={e}
                              key={`deployment-${e.id}`}
                              projectId={props.projectId}
                              deploymentId={e.id}
                            />
                          )}
                          {e.type === "imported" && (
                            <DeploymentImportItem
                              deploymentData={e}
                              key={`deployment-${e.id}`}
                              projectId={props.projectId}
                              deploymentId={e.id}
                            />
                          )}
                        </>
                      );
                    })}
                </>
              );
            }}
          />
        </div>
      </sl-tab-panel>

      <sl-tab-panel name="deploy-requests">
        <div class="history-tab">
          <Resource
            value={deployRequestsResource}
            onPending={() => <sl-spinner />}
            onRejected={(error) => (
              <div>Error loading recent events: {error.message}</div>
            )}
            onResolved={() => (
              <div class="transactions-list">
                {deployRequests.value.map((transaction: any) => (
                  <DeployRequestItem
                    id={transaction.id}
                    contract={transaction.contractName}
                    network={transaction.chainId}
                    time={transaction.createdAt}
                    user={transaction.userId}
                    key={`deploy-request-${transaction.id}}`}
                    projectId={transaction.lokiProjectId}
                    abi={transaction.abi}
                    bytecode={transaction.bytecode}
                    email={transaction.email}
                    deploymentHappened={deploymentHappened}
                  />
                ))}
              </div>
            )}
          />
        </div>
      </sl-tab-panel>

      <sl-tab-panel name="deployment-import">
        <div class="history-tab">
          <DeploymentImport
            projectId={props.projectId}
            importDeploymentHappened={importDeploymentHappened}
          />
        </div>
      </sl-tab-panel>
    </sl-tab-group>
  );
});
