import type { ApiResponse } from "./httpClient/LokiClient";
import { LokiClient } from "./httpClient/LokiClient";

export interface ContractData {
  abi: any;
  bytecode: string;
  contractName: string;
  constructorArgs?: string[];
}

interface DeploymentParams {
  projectId: string;
  address: string;
  network: string;
  compilationId: string;
  sha?: string;
  gitHubWorkFlowRunId?: string;
  gitHubArtifactId?: string;
  deploymentRequestId?: string;
}

export interface DeployOptions {
  projectId: string;
  chainId: number;
  timeout?: Date;
}

export class LokiProjectDeploymentsService {
  private static LOKI_PROJECT_DEPLOYMENTS_PATH = "loki-project-deployments";

  static fetchDeployment(
    projectId: string,
    deploymentId: string
  ): Promise<ApiResponse<any>> {
    return LokiClient.get(
      `${LokiProjectDeploymentsService.LOKI_PROJECT_DEPLOYMENTS_PATH}/deployments/${projectId}/${deploymentId}`
    );
  }

  static fetchDeploymentPublic(
    projectId: string,
    deploymentId: string
  ): Promise<ApiResponse<any>> {
    return LokiClient.get(
      `${LokiProjectDeploymentsService.LOKI_PROJECT_DEPLOYMENTS_PATH}/deployments/public/${projectId}/${deploymentId}`
    );
  }

  static async fetchDeployments(projectId: string): Promise<ApiResponse<any>> {
    return LokiClient.get(
      `${this.LOKI_PROJECT_DEPLOYMENTS_PATH}/deployments/${projectId}`
    );
  }

  static async fetchRecentEvents(projectId: string): Promise<ApiResponse<any>> {
    return LokiClient.get(
      `${this.LOKI_PROJECT_DEPLOYMENTS_PATH}/recent-events/${projectId}`
    );
  }

  static async fetchImportedContracts(
    projectId: string
  ): Promise<ApiResponse<any>> {
    return LokiClient.get(
      `${this.LOKI_PROJECT_DEPLOYMENTS_PATH}/imported-contracts/${projectId}`
    );
  }

  static async fetchCompilations(projectId: string): Promise<ApiResponse<any>> {
    return LokiClient.get(
      `${this.LOKI_PROJECT_DEPLOYMENTS_PATH}/compilations/${projectId}`
    );
  }

  // static async fetchWorkflowRuns(projectId: string): Promise<ApiResponse<any>> {
  //   return LokiClient.get(
  //     `${this.LOKI_PROJECT_DEPLOYMENTS_PATH}/workflow-runs/${projectId}`
  //   );
  // }

  static async saveDeployment(
    params: DeploymentParams
  ): Promise<ApiResponse<any>> {
    return LokiClient.post(
      `${this.LOKI_PROJECT_DEPLOYMENTS_PATH}/deployments/${params.projectId}`,
      {
        address: params.address,
        sha: params.sha,
        network: params.network,
        compilationId: params.compilationId,
        gitHubWorkFlowRunId: params.gitHubWorkFlowRunId,
        gitHubArtifactId: params.gitHubArtifactId,
        deploymentRequestId: params.deploymentRequestId,
      }
    );
  }

  static async fetchDeployRequests(
    projectId: string
  ): Promise<ApiResponse<any>> {
    return LokiClient.get(
      `${this.LOKI_PROJECT_DEPLOYMENTS_PATH}/deploy-requests/${projectId}`
    );
  }

  static async saveDeployRequest(
    contractData: ContractData,
    deployOptions: DeployOptions
  ): Promise<ApiResponse<any>> {
    return LokiClient.post(
      `${this.LOKI_PROJECT_DEPLOYMENTS_PATH}/deploy-requests/save-contract`,
      { contractData, deployOptions }
    );
  }

  static async deleteDeployRequest(
    deployRequestId: string
  ): Promise<ApiResponse<any>> {
    return LokiClient.delete(
      `${this.LOKI_PROJECT_DEPLOYMENTS_PATH}/deploy-requests/${deployRequestId}`
    );
  }

  static fetchImportedDeployment(
    projectId: string,
    deploymentId: string
  ): Promise<ApiResponse<any>> {
    return LokiClient.get(
      `${LokiProjectDeploymentsService.LOKI_PROJECT_DEPLOYMENTS_PATH}/imported-deployments/${projectId}/${deploymentId}`
    );
  }

  static fetchImportedDeploymentPublic(
    projectId: string,
    deploymentId: string
  ): Promise<ApiResponse<any>> {
    return LokiClient.get(
      `${LokiProjectDeploymentsService.LOKI_PROJECT_DEPLOYMENTS_PATH}/imported-deployments/public/${projectId}/${deploymentId}`
    );
  }

  static async fetchImportedDeployments(
    projectId: string
  ): Promise<ApiResponse<any>> {
    return LokiClient.get(
      `${this.LOKI_PROJECT_DEPLOYMENTS_PATH}/imported-deployments/${projectId}`
    );
  }

  static async saveImportedDeployment(
    projectId: string,
    contractName: string,
    network: string,
    address: string,
    abi: any
  ): Promise<ApiResponse<any>> {
    return LokiClient.post(
      `${this.LOKI_PROJECT_DEPLOYMENTS_PATH}/imported-deployments/save-contract/${projectId}`,
      { contractName, network, address, abi }
    );
  }
}
