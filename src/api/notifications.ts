import { request } from './client'

export async function registerDeviceToken(pushToken: string, platform: string): Promise<void> {
  return request<void>('/notifications/register-device', {
    method: 'POST',
    body: { pushToken, platform }
  })
}

export async function unregisterDeviceToken(pushToken: string): Promise<void> {
  return request<void>('/notifications/unregister-device', {
    method: 'POST',
    body: { pushToken }
  })
}
