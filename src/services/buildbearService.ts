import BuildBearClient from "./httpClient/BuildBearClient";
import { IndexedDBService } from "./indexedDBService";

interface buildbearResDataType {
  sandboxId: string | undefined;
  chainId: number | undefined;
  blockNumber: string | undefined;
  rpcUrl: string | undefined;
  explorerUrl: string | undefined;
  faucetUrl: string | undefined;
}

interface ForkingDetails {
  chainId: number;
  blockNumber: number;
}

export interface SandboxResponse {
  status: string;
  sandboxId: string;
  forkingDetails: ForkingDetails;
  chainId: number;
  mnemonic: string;
  rpcUrl: string;
  explorerUrl: string;
  faucetUrl: string;
  verificationUrl: string;
}
export class BuildBearService {
  static createSanboxAPI(chainId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      BuildBearClient.post("", {
        chainId: chainId,
      })
        .then((createSanboxAPIresponse) => {
          this.sandboxStatus(createSanboxAPIresponse.data.sandboxId)
            .then((sandboxStatusResponse) => {
              this.saveSandbox({
                ...createSanboxAPIresponse.data,
                ...sandboxStatusResponse.data,
              })
                .then((saveSandboxResponse) => {
                  this.getSandbox(saveSandboxResponse).then((sandbox) => {
                    resolve(sandbox);
                  });
                })
                .catch((error) => {
                  reject(error);
                });
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static async sandboxStatus(
    sandboxId: string,
    indexDbId?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      BuildBearClient.get(`/${sandboxId}`)
        .then(async (sandboxStatusResponse) => {
          if (indexDbId) {
            const currentSandbox = await this.getSandbox(indexDbId);
            await this.updateSandbox({
              ...sandboxStatusResponse.data,
              indexDBCreatedAt: currentSandbox.indexDBCreatedAt,
              id: indexDbId,
            });
            const updated = await this.getSandbox(indexDbId);
            resolve(updated);
          } else {
            resolve(sandboxStatusResponse);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static async updateSandbox(data: any): Promise<any> {
    return await IndexedDBService.update(data);
  }

  static async deleteSandbox(sandboxId: string): Promise<any> {}

  static async getSandboxes(): Promise<any> {
    return await IndexedDBService.getAll();
  }

  static async getSandbox(sandboxId: string): Promise<any> {
    return await IndexedDBService.get(sandboxId);
  }

  static async saveSandbox(networkData: SandboxResponse): Promise<any> {
    try {
      return IndexedDBService.insert(networkData);
    } catch (error) {
      console.error("Error saving network data:", error);
    }
  }
}
