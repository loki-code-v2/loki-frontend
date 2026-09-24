import { LokiClient } from "./httpClient/LokiClient";

export class LokiProjectUserService {
  private static LOKI_PROJECT_USER_PATH = "loki-project-user";

  public static async createInvitation(
    projectId: number,
    email: string
  ): Promise<any> {
    return LokiClient.post(
      LokiProjectUserService.LOKI_PROJECT_USER_PATH +
        "/invite-user/" +
        projectId,
      {
        email: email,
      }
    );
  }

  public static async verifyInvitation(token: string): Promise<any> {
    return LokiClient.post(
      LokiProjectUserService.LOKI_PROJECT_USER_PATH + "/invitation/verify",
      {
        token: token,
      }
    );
  }

  public static async getProjectUsers(projectId: number): Promise<any> {
    return LokiClient.get(
      LokiProjectUserService.LOKI_PROJECT_USER_PATH + "/project/" + projectId
    );
  }
  public static async getProjectInvitations(projectId: number): Promise<any> {
    return LokiClient.get(
      LokiProjectUserService.LOKI_PROJECT_USER_PATH +
        "/project/" +
        projectId +
        "/invitations"
    );
  }
}
