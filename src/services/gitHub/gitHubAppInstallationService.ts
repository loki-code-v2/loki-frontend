import { LokiClient } from "../httpClient/LokiClient";

export class GitHubAppInstallationService {
  private static GITHUB_APP_INSTALLATION_PATH = "github-app-installation";

  public static async getGitHubAppInstallationToken(): Promise<any> {
    return LokiClient.get(`${this.GITHUB_APP_INSTALLATION_PATH}/token`);
  }

  public static async postGitHubAppInstallation(queryParameters: {
    code?: string | null;
    installationId: string;
    state: string;
    setup_action: string;
  }): Promise<any> {
    return await LokiClient.post(
      `${this.GITHUB_APP_INSTALLATION_PATH}`,
      queryParameters
    );
  }

  public static async gitHubAppInstallationRedirectUrl(queryParameters: {
    state: string;
  }): Promise<any> {
    return LokiClient.post(
      `${this.GITHUB_APP_INSTALLATION_PATH}/redirect`,
      queryParameters
    );
  }

  public static async disconnectGitHubApp() {
    return LokiClient.delete(`${this.GITHUB_APP_INSTALLATION_PATH}/disconnect`);
  }

  static getUserGitHubAppInstallation() {
    return LokiClient.get(
      `${this.GITHUB_APP_INSTALLATION_PATH}/user/installation`
    );
  }
}
