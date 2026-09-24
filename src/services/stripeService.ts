import { ApiResponse, LokiClient } from "./httpClient/LokiClient";

export class StripeService {
  private static PRICING_PATH = "stripe";

  public static getSession(): Promise<ApiResponse<any>> {
    return LokiClient.get(`${StripeService.PRICING_PATH}`);
  }

  public static checkSubscription(): Promise<ApiResponse<any>> {
    return LokiClient.get<ApiResponse<any>>(
      `${StripeService.PRICING_PATH}/check-subscription`
    );
  }
}
