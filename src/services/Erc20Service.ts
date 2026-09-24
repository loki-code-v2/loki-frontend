import { LokiClient } from "./httpClient/LokiClient";
import { erc20FormType } from "./templateService";

export class Erc20Service {
  private static instance: Erc20Service;
  private static PATH = "erc20";
  private constructor() {}

  public static getInstance(): Erc20Service {
    if (!Erc20Service.instance) {
      Erc20Service.instance = new Erc20Service();
    }

    return Erc20Service.instance;
  }

  public static async generate(form: erc20FormType): Promise<any> {
    return LokiClient.post(Erc20Service.PATH, form);
  }
}
