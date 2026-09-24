import { ApiResponse, LokiClient } from "./httpClient/LokiClient";

export class ContractService {
  private static FILES_PATH = "contract";

  public static async createContract(contract: any): Promise<ApiResponse<any>> {
    return LokiClient.put(ContractService.FILES_PATH, contract);
  }
  public static async getContracts(): Promise<ApiResponse<any>> {
    return LokiClient.get(ContractService.FILES_PATH);
  }
  public static async getContract(id: string): Promise<ApiResponse<any>> {
    return LokiClient.get(`${ContractService.FILES_PATH}/${id}`);
  }
  public static async getAddress(id: string): Promise<ApiResponse<any>> {
    return LokiClient.get(`${ContractService.FILES_PATH}/address/${id}`);
  }

  public static async getNetwork(id: string): Promise<ApiResponse<any>> {
    return LokiClient.get(`${ContractService.FILES_PATH}/network/${id}`);
  }

  public static async deleteContract(id: string): Promise<ApiResponse<any>> {
    return LokiClient.delete(`${ContractService.FILES_PATH}/${id}`);
  }
}
