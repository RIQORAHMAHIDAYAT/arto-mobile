import type { AccountType } from '@/types'
import { Badge, type Tone } from '@/components/ui/Badge'

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  cash: 'Tunai',
  bank: 'Bank',
  ewallet: 'E-Wallet',
}

const ACCOUNT_TYPE_TONES: Record<AccountType, Tone> = {
  cash: 'info',
  bank: 'success',
  ewallet: 'warning',
}

export function AccountTypePill({ type }: { type: AccountType }) {
  return <Badge tone={ACCOUNT_TYPE_TONES[type]}>{ACCOUNT_TYPE_LABELS[type]}</Badge>
}