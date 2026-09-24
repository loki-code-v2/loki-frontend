import { ApiResponse, LokiClient } from "./httpClient/LokiClient";

export class LokiProjectService {
  // add an array of objects to this class that can be changed
  private static LOKI_PROJECT_PATH = "loki-project";

  static getLokiProject(id: number): Promise<any> {
    return LokiClient.get(`${LokiProjectService.LOKI_PROJECT_PATH}/${id}`);
  }

  static getLokiProjects(): Promise<any> {
    return LokiClient.get(`${LokiProjectService.LOKI_PROJECT_PATH}`);
  }

  static createLokiProject(projectName: string, repositoryName: string) {
    return LokiClient.post(`${LokiProjectService.LOKI_PROJECT_PATH}`, {
      projectName: projectName,
      repositoryName: repositoryName,
    });
  }

  static createLokiOrganizationProject(
    projectName: string,
    repositoryName: string,
    organizationId: number
  ): Promise<any> {
    return LokiClient.post(
      `${LokiProjectService.LOKI_PROJECT_PATH}/organization/${organizationId}`,
      {
        projectName: projectName,
        repositoryName: repositoryName,
        organizationId: organizationId,
      }
    );
  }

  static deleteLokiProject(id: number): Promise<any> {
    return LokiClient.delete(`${LokiProjectService.LOKI_PROJECT_PATH}/${id}`);
  }

  static deleteLokiTemplateProject(cuid: string): Promise<any> {
    return LokiClient.delete(
      `${LokiProjectService.LOKI_PROJECT_PATH}/template/${cuid}`
    );
  }

  public static async compileProjectFile(
    filePath: string,
    commitSHA: string,
    projectId: number,
    branch?: string
  ): Promise<any> {
    return LokiClient.post(`${LokiProjectService.LOKI_PROJECT_PATH}/compile`, {
      filePath: filePath,
      commitSHA: commitSHA,
      projectId: projectId,
      branch: branch,
    });
  }

  public static async saveCompilation(
    projectId: number,
    abi: string,
    bytecode: string,
    contractName?: string,
    sha?: string
  ): Promise<ApiResponse<any>> {
    return LokiClient.post(
      `${LokiProjectService.LOKI_PROJECT_PATH}/save-compilation`,
      {
        projectId: projectId,
        abi: abi,
        bytecode: bytecode,
        contractName: contractName,
        sha: sha,
      }
    );
  }
}
