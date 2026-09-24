import { ApiResponse, LokiClient } from "../httpClient/LokiClient";

export class GitHubActionsService {
  private static GITHUB_APP_PATH = "github-actions";

  public static getArtifacts(projectId: string, workflowRunId: string) {
    return LokiClient.get(
      `${GitHubActionsService.GITHUB_APP_PATH}/repo/${projectId}/artifacts/${workflowRunId}`
    );
  }

  public static getWorkflowRunArtifactsServer(
    projectId: string,
    workflowRunId: string
  ): Promise<ApiResponse<any>> {
    return LokiClient.get(
      `${GitHubActionsService.GITHUB_APP_PATH}/repo/${projectId}/artifacts-workflowrun/${workflowRunId}`
    );
  }

  public static getArtifactAbiAndBytecode(
    projectId: string,
    artifactId: string
  ) {
    return LokiClient.get(
      `${this.GITHUB_APP_PATH}/repo/${projectId}/artifacts/${artifactId}`
    );
  }
}
