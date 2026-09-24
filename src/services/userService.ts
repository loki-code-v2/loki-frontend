import { LokiClient } from "./httpClient/LokiClient";

export class UserService {
  private static USER_PATH = "users";

  private constructor() {}
  public async getUser() {
    return LokiClient.get(UserService.USER_PATH);
  }

  public static async userLoginOrSignup() {
    return LokiClient.post(UserService.USER_PATH + "/loginorsignup");
  }
  public static async me() {
    return LokiClient.get("users/me");
  }
  public static async checkUserSubscription() {
    return LokiClient.get(UserService.USER_PATH + "/subscription");
  }

  public static async userSession() {
    return LokiClient.get(UserService.USER_PATH + "/session");
  }
}
