import type { NoSerialize } from "@builder.io/qwik";
import type { NetworkNames } from "./chainService";
import type { ApiResponse } from "./httpClient/LokiClient";
import { LokiClient } from "./httpClient/LokiClient";

export type erc20FormType = {
  name: string;
  ticker: string;
  supply: number;
  isMintable: boolean;
  isBurnable: boolean;
  network: NetworkNames | null;
};
export type erc721FormType = {
  image: NoSerialize<File> | null;
  name: string;
  ticker: string;
  description: string;
  supply: number;
  price: number;
  revenue: string;
  network: NetworkNames | null;
};

// generate templateService class
export class TemplateService {
  private static instance: TemplateService;
  private static FILES_PATH = "/templates";
  private static ERC20_PATH = "/erc20";
  private static ERC721_PATH = "/erc721";

  public static async compileERC20(
    erc20Form: erc20FormType
  ): Promise<ApiResponse<any>> {
    return LokiClient.post(
      TemplateService.FILES_PATH + TemplateService.ERC20_PATH + "/compile",
      erc20Form
    );
  }
  public static async createERC20(body: {
    erc20Form: erc20FormType;
    contract: any;
  }): Promise<ApiResponse<any>> {
    return LokiClient.post(
      TemplateService.FILES_PATH + TemplateService.ERC20_PATH,
      body
    );
  }
  public static async getERC20(id: string): Promise<ApiResponse<any>> {
    return LokiClient.get(
      TemplateService.FILES_PATH + TemplateService.ERC20_PATH + "/" + id
    );
  }

  public static async compileERC721(
    erc721Form: erc721FormType
  ): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append("image", erc721Form.image as File);
    formData.append("form", JSON.stringify(erc721Form));

    return LokiClient.postWithFile(
      TemplateService.FILES_PATH + TemplateService.ERC721_PATH + "/compile",
      formData
    );
  }
  public static async createERC721(body: {
    erc721Form: erc721FormType;
    ipfsUrl: string;
    contract: any;
  }): Promise<ApiResponse<any>> {
    return LokiClient.post(
      TemplateService.FILES_PATH + TemplateService.ERC721_PATH,
      body
    );
  }
  public static async getERC721(id: string): Promise<ApiResponse<any>> {
    return LokiClient.get(
      TemplateService.FILES_PATH + TemplateService.ERC721_PATH + "/" + id
    );
  }
  public static async getERC721Public(id: string): Promise<ApiResponse<any>> {
    return LokiClient.get(
      TemplateService.FILES_PATH + TemplateService.ERC721_PATH + "/public/" + id
    );
  }
}
