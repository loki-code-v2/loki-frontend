import type { ApiResponse } from "./httpClient/LokiClient";
import { LokiClient } from "./httpClient/LokiClient";

// Interfaces for organization data and updates
export interface OrganizationData {
  id: number;
  name: string;
  description?: string;
  userRole: string;
  userId?: string;
  invitations?: Array<{
    id: number;
    email: string;
    status: string;
  }>;
  members?: Array<{
    userId: string;
    userName: string;
    role: string;
    email?: string;
  }>;
}

export interface OrganizationCreateData {
  name: string;
  description?: string;
}

export interface OrganizationUpdateData {
  name?: string;
  description?: string;
}

export class OrganizationService {
  static getSubscriptionQuantity(id: number) {
    throw new Error("Method not implemented.");
  }
  private static ORGANIZATION_PATH = "organization";

  static listOrganizations(): Promise<ApiResponse<any>> {
    return LokiClient.get(`${this.ORGANIZATION_PATH}`);
  }

  static createOrganization(
    organizationData: OrganizationCreateData
  ): Promise<ApiResponse<OrganizationData>> {
    return LokiClient.post(`${this.ORGANIZATION_PATH}`, organizationData);
  }

  static getOrganization(
    organizationId: string
  ): Promise<ApiResponse<OrganizationData>> {
    return LokiClient.get<OrganizationData>(
      `${this.ORGANIZATION_PATH}/${organizationId}`
    );
  }

  static ownerIsSubscribed(
    organizationId: string
  ): Promise<ApiResponse<OrganizationData>> {
    return LokiClient.get<OrganizationData>(
      `${this.ORGANIZATION_PATH}/${organizationId}/owner`
    );
  }

  static updateOrganization(
    organizationId: string,
    updateData: OrganizationUpdateData
  ): Promise<ApiResponse<OrganizationData>> {
    return LokiClient.patch<OrganizationData>(
      `${this.ORGANIZATION_PATH}/${organizationId}`,
      updateData
    );
  }

  static deleteOrganization(
    orgId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return LokiClient.delete<{ message: string }>(
      `${this.ORGANIZATION_PATH}/${orgId}`
    );
  }

  static inviteMember(
    orgId: number,
    email: string
  ): Promise<ApiResponse<{ message: string }>> {
    return LokiClient.post<{ message: string }>(
      `${this.ORGANIZATION_PATH}/${orgId}/invite`,
      { email }
    );
  }
  static removeMember(
    orgId: number,
    memberId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return LokiClient.delete<{ message: string }>(
      `${this.ORGANIZATION_PATH}/${orgId}/members/${memberId}`
    );
  }

  static leaveOrganization(
    orgId: number,
    memberId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return LokiClient.delete<{ message: string }>(
      `${this.ORGANIZATION_PATH}/${orgId}/leave/${memberId}`
    );
  }

  static async getOrganizationInvitations(
    orgId: number
  ): Promise<ApiResponse<any>> {
    return LokiClient.get<any>(
      `${this.ORGANIZATION_PATH}/${orgId}/invitations`
    );
  }

  static async revokeOrganizationInvitation(
    orgId: number,
    invitationId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return LokiClient.delete<{ message: string }>(
      `${this.ORGANIZATION_PATH}/${orgId}/invitations/${invitationId}`
    );
  }

  static async getOrganizationCapacity(
    orgId: number
  ): Promise<ApiResponse<any>> {
    return LokiClient.get<any>(`${this.ORGANIZATION_PATH}/${orgId}/capacity`);
  }

  static async invitedUser(orgId: number, email: string) {
    return LokiClient.get<any>(
      `${this.ORGANIZATION_PATH}/${orgId}/invited/${email}`
    );
  }
}
