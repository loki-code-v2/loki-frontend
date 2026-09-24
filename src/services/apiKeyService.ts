import { LokiClient } from "./httpClient/LokiClient";

export class ApiKeyService {
  private static instance: ApiKeyService;
  private static API_KEY_PATH = "api-key";

  public static async fetchKeys(projectId: string): Promise<any> {
    return await LokiClient.get(`${ApiKeyService.API_KEY_PATH}/${projectId}`);
  }

  public static async generateKey(
    tokenName: string,
    projectId: string
  ): Promise<any> {
    return await LokiClient.post(ApiKeyService.API_KEY_PATH, {
      tokenName: tokenName,
      projectId: projectId,
    });
  }

  public static async deleteToken(tokenId: string): Promise<any> {
    return await LokiClient.delete(`${ApiKeyService.API_KEY_PATH}/${tokenId}`);
  }
}
