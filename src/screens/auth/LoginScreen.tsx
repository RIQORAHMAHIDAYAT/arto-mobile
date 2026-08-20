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

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export function LoginScreen({ navigation }: Props) {
  const colors = useAppColors()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await login({ email: email.trim(), password })
    } catch (err) {
      setError(getErrorMessage(err, 'Email atau password salah.'))
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await login({ email: 'demo@arto.id', password: 'demopass123' })
    } catch (err) {
      setError(getErrorMessage(err, 'Akun demo tidak tersedia.'))
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
        <View style={styles.brand}>
          <Text style={[styles.logo, { color: colors.primary }]}>ARTO</Text>
          <Text style={[styles.tagline, { color: colors.muted }]}>
            Pantau keuangan pribadimu, kendalikan pengeluaran harianmu.
          </Text>
        </View>

        <Card>
          <Text style={[styles.title, { color: colors.foreground }]}>Masuk</Text>
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
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
          />
          {error ? (
            <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>
              {error}
            </Text>
          ) : null}
          <Button loading={loading} onPress={() => void handleSubmit()}>
            Masuk
          </Button>
          <Button variant="ghost" loading={loading} onPress={() => void handleDemoLogin()}>
            Coba akun demo
          </Button>
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>Belum punya akun?</Text>
          <Text style={[styles.link, { color: colors.primary }]} onPress={() => navigation.navigate('Register')}>
            Daftar sekarang
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
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
    maxWidth: 280,
  },
  title: {
    fontSize: fontSizes.xl,
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