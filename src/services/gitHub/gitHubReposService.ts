import { ApiResponse, LokiClient } from "../httpClient/LokiClient";

export class GitHubReposService {
  private static GITHUB_REPOS_PATH = "github-repository";
  public static getRepoContents(
    projectId: number,
    branch: string | null = null
  ): Promise<ApiResponse<any>> {
    return LokiClient.get(
      `${this.GITHUB_REPOS_PATH}/repo/${projectId}${
        branch ? `?branch=${branch}` : ""
      }`
    );
  }

  public static getBranches(projectId: number): Promise<ApiResponse<any>> {
    return LokiClient.get(
      `${this.GITHUB_REPOS_PATH}/repo/${projectId}/branches`
    );
  }

  public static getFileContents(
    projectId: number,
    filePath: string,
    branch: string | null = null
  ): Promise<ApiResponse<any>> {
    return LokiClient.post(
      `${this.GITHUB_REPOS_PATH}/repo/${projectId}/file/${
        branch ? `?branch=${branch}` : ""
      }`,
      {
        filePath: filePath,
      }
    );
  }
}
