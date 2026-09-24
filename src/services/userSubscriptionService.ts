import { ApiResponse, LokiClient } from "./httpClient/LokiClient";

interface UserSubscriptionData {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeCurrentPeriodEnd: Date;
  quantity: number;
}

export class UserSubscriptionService {
  static USER_SUBSCRIPTION_PATH = "user-subscription";

  public static hasActiveSubscription(): Promise<
    ApiResponse<UserSubscriptionData>
  > {
    return LokiClient.get<UserSubscriptionData>(
      `${this.USER_SUBSCRIPTION_PATH}/active`
    );
  }
}
