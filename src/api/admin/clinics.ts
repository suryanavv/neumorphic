import { BaseAPI } from "../shared/base"

export interface Clinic {
  id: number
  name: string
  phone_number: string
  logo_url: string | null
  address: string
}

export class AdminClinicsAPI extends BaseAPI {
  /**
   * Get all clinics
   */
  static async getAllClinics(): Promise<Clinic[]> {
    const response = await fetch(`${this.getBaseUrl()}/dashboard/clinics`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    const data = await this.handleResponse<any>(response)

    if (data.clinics && Array.isArray(data.clinics)) {
      return data.clinics
    }

    return []
  }
}
