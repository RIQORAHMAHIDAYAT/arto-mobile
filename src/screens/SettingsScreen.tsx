import { useState } from 'react'
import { Alert, StyleSheet, Text } from 'react-native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { changePassword } from '@/api/auth'
import { Screen } from '@/components/Screen'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { getErrorMessage } from '@/lib/errorMessage'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { MainTabParamList, RootStackParamList } from '@/navigation/types'
import { fontSizes, spacing, useAppColors } from '@/theme'
import type { ThemePreference } from '@/types'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: 'system', label: '🌓 Ikuti Sistem' },
  { value: 'light', label: '☀️ Terang' },
  { value: 'dark', label: '🌙 Gelap' },
]

export function SettingsScreen(props: Props) {
  const colors = useAppColors()
  const { user, logout, updateTheme } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleThemeChange = async (next: ThemePreference) => {
    setTheme(next)
    try {
      await updateTheme(next)
    } catch {
      Alert.alert('Gagal', 'Tema tersimpan lokal, tetapi gagal disinkronkan ke server.')
    }
  }

  const handleChangePassword = async () => {
    setPasswordSuccess(false)
    setPasswordError(null)
    if (!currentPassword) {
      setPasswordError('Password saat ini wajib diisi.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password baru minimal 8 karakter.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password baru tidak cocok.')
      return
    }
    setSavingPassword(true)
    try {
      await changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess(true)
    } catch (err) {
      setPasswordError(getErrorMessage(err))
    } finally {
      setSavingPassword(false)
    }
  }

  const confirmLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => void logout() },
    ])
  }

  const displayTheme = theme

  return (
    <Screen title="Pengaturan" subtitle={resolvedTheme === 'dark' ? 'Mode gelap aktif' : 'Mode terang aktif'}>
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Profil</Text>
        <Text style={[styles.name, { color: colors.foreground }]}>{user?.name ?? '-'}</Text>
        <Text style={[styles.email, { color: colors.muted }]}>{user?.email ?? '-'}</Text>
      </Card>

      <Card title="Tampilan">
        <Text style={[styles.help, { color: colors.muted }]}>Pilih tema yang nyaman untuk perangkatmu.</Text>
        <Select
          label="Tema"
          value={displayTheme}
          onChange={(value) => void handleThemeChange(value as ThemePreference)}
          options={THEME_OPTIONS}
        />
      </Card>

      <Card title="Otomatisasi">
        <Text style={[styles.help, { color: colors.muted }]}>Atur transaksi yang berjalan secara otomatis (berulang).</Text>
        <Button variant="secondary" onPress={() => props.navigation.navigate('RecurringTransactions')}>
          Kelola Transaksi Rutin
        </Button>
      </Card>

      <Card title="Keamanan">
        <Text style={[styles.help, { color: colors.muted }]}>Perbarui password akun secara berkala.</Text>
        <Input
          label="Password Saat Ini"
          secureTextEntry
          placeholder="••••••••"
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <Input
          label="Password Baru"
          secureTextEntry
          placeholder="Minimal 8 karakter"
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <Input
          label="Konfirmasi Password Baru"
          secureTextEntry
          placeholder="Ulangi password baru"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        {passwordError ? (
          <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>
            {passwordError}
          </Text>
        ) : null}
        {passwordSuccess ? (
          <Text accessibilityLiveRegion="polite" style={[styles.success, { color: colors.success }]}>
            Password berhasil diperbarui.
          </Text>
        ) : null}
        <Button variant="secondary" loading={savingPassword} onPress={() => void handleChangePassword()}>
          Perbarui Password
        </Button>
      </Card>

      <Card>
        <Text style={[styles.appName, { color: colors.muted }]}>ARTO Mobile v1.0.0</Text>
      </Card>

      <Button variant="danger" onPress={confirmLogout}>
        Keluar dari Akun
      </Button>
    </Screen>
  )
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  name: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  email: {
    fontSize: fontSizes.sm,
  },
  help: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
  },
  error: {
    fontSize: fontSizes.sm,
  },
  success: {
    fontSize: fontSizes.sm,
  },
  appName: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
})