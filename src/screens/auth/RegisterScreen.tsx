import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'
import { getErrorMessage } from '@/lib/errorMessage'
import { fontSizes, spacing, useAppColors } from '@/theme'

import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>

export function RegisterScreen({ navigation }: Props) {
  const colors = useAppColors()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const cleanedName = name.trim()
    if (!cleanedName) {
      setError('Nama lengkap wajib diisi.')
      return
    }
    if (!email.trim()) {
      setError('Email wajib diisi.')
      return
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await register({ name: cleanedName, email: email.trim(), password })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <Text style={[styles.title, { color: colors.foreground }]}>Daftar Akun Baru</Text>
          <Input label="Nama Lengkap" placeholder="contoh: Budi Santoso" value={name} onChangeText={setName} />
          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="nama@contoh.com"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            secureTextEntry
            placeholder="Minimal 8 karakter"
            value={password}
            onChangeText={setPassword}
            hint="Gunakan kombinasi huruf dan angka."
          />
          <Input
            label="Konfirmasi Password"
            secureTextEntry
            placeholder="Ulangi password"
            value={confirm}
            onChangeText={setConfirm}
          />
          {error ? (
            <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>
              {error}
            </Text>
          ) : null}
          <Button loading={loading} onPress={() => void handleSubmit()}>
            Daftar
          </Button>
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>Sudah punya akun?</Text>
          <Text style={[styles.link, { color: colors.primary }]} onPress={() => navigation.goBack()}>
            Masuk
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  error: {
    fontSize: fontSizes.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: fontSizes.sm,
  },
  link: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
})