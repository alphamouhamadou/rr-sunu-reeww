'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CreditCard, Save, Loader2, CheckCircle, AlertTriangle, Eye, EyeOff, 
  TestTube, Settings, ExternalLink, Shield
} from 'lucide-react'

interface PayTechSettings {
  paytech_api_key: string
  paytech_secret_key: string
  paytech_mode: 'test' | 'prod'
  app_url: string
}

export function PayTechSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  
  const [settings, setSettings] = useState<PayTechSettings>({
    paytech_api_key: '',
    paytech_secret_key: '',
    paytech_mode: 'test',
    app_url: '',
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      
      if (data.settings) {
        setSettings({
          paytech_api_key: data.settings['paytech_api_key'] || '',
          paytech_secret_key: data.settings['paytech_secret_key'] || '',
          paytech_mode: (data.settings['paytech_mode'] as 'test' | 'prod') || 'test',
          app_url: data.settings['app_url'] || '',
        })
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      setError('Erreur lors du chargement des paramètres')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)
    setTestResult(null)

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Erreur de connexion au serveur')
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    if (!settings.paytech_api_key || !settings.paytech_secret_key) {
      setTestResult({ success: false, message: 'Veuillez d\'abord remplir les clés API' })
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      // Try to initiate a test payment (will fail but confirms API keys are valid)
      const res = await fetch('/api/paytech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100,
          type: 'test',
          itemName: 'Test de connexion',
          customerEmail: 'test@example.com',
          customerPhone: '+221770000000',
        })
      })

      const data = await res.json()

      if (data.code === 'PAYTECH_NOT_CONFIGURED') {
        setTestResult({ success: false, message: 'Configuration manquante. Sauvegardez d\'abord vos paramètres.' })
      } else if (data.redirectUrl || data.token) {
        setTestResult({ success: true, message: 'Connexion réussie ! Les clés API sont valides.' })
      } else {
        setTestResult({ success: false, message: data.error || 'Erreur de connexion à PayTech' })
      }
    } catch (err) {
      console.error('Test error:', err)
      setTestResult({ success: false, message: 'Erreur de connexion au serveur' })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#008751]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-[#008751]/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#008751]/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#008751]" />
            </div>
            <div>
              <CardTitle className="text-[#008751]">Configuration PayTech</CardTitle>
              <CardDescription>
                Configurez vos clés API PayTech pour activer les paiements en ligne
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Success/Error Alerts */}
      {success && (
        <Alert className="bg-[#008751]/10 border-[#008751]">
          <CheckCircle className="w-4 h-4 text-[#008751]" />
          <AlertDescription className="text-[#008751]">
            Paramètres sauvegardés avec succès !
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-[#CE1126]/10 border-[#CE1126]">
          <AlertTriangle className="w-4 h-4 text-[#CE1126]" />
          <AlertDescription className="text-[#CE1126]">{error}</AlertDescription>
        </Alert>
      )}

      {/* PayTech Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#008751]" />
            Informations PayTech
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div>
              <p className="font-medium">Plateforme de paiement sénégalaise</p>
              <p className="text-sm text-gray-500 mt-1">
                PayTech permet d'accepter les paiements par Wave, Orange Money et cartes bancaires
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open('https://paytech.sn', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Obtenir mes clés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clés API</CardTitle>
          <CardDescription>
            Trouvez vos clés dans votre compte PayTech : Tableau de bord → Paramètres → API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key */}
          <div>
            <Label htmlFor="api_key" className="flex items-center gap-2">
              Clé API (API_KEY)
              <Badge variant="outline" className="text-xs">Obligatoire</Badge>
            </Label>
            <div className="relative mt-2">
              <Input
                id="api_key"
                type={showApiKey ? 'text' : 'password'}
                value={settings.paytech_api_key}
                onChange={(e) => setSettings(prev => ({ ...prev, paytech_api_key: e.target.value }))}
                placeholder="Ex: 5f8a9b2c3d4e5f6a7b8c9d0e"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Secret Key */}
          <div>
            <Label htmlFor="secret_key" className="flex items-center gap-2">
              Clé Secrète (API_SECRET)
              <Badge variant="outline" className="text-xs">Obligatoire</Badge>
            </Label>
            <div className="relative mt-2">
              <Input
                id="secret_key"
                type={showSecretKey ? 'text' : 'password'}
                value={settings.paytech_secret_key}
                onChange={(e) => setSettings(prev => ({ ...prev, paytech_secret_key: e.target.value }))}
                placeholder="Ex: 1a2b3c4d5e6f7a8b9c0d1e2f"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mode */}
          <div>
            <Label htmlFor="mode">Mode de fonctionnement</Label>
            <Select
              value={settings.paytech_mode}
              onValueChange={(v) => setSettings(prev => ({ ...prev, paytech_mode: v as 'test' | 'prod' }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test">
                  <div className="flex items-center gap-2">
                    <TestTube className="w-4 h-4 text-yellow-500" />
                    <span>Mode Test</span>
                    <span className="text-xs text-gray-500">- Pour les développements</span>
                  </div>
                </SelectItem>
                <SelectItem value="prod">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Mode Production</span>
                    <span className="text-xs text-gray-500">- Paiements réels</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              En mode Test, les paiements sont simulés. Passez en Production pour accepter de vrais paiements.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Application URL */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">URL de l'application</CardTitle>
          <CardDescription>
            URL publique de votre site (nécessaire pour les webhooks PayTech)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={settings.app_url}
            onChange={(e) => setSettings(prev => ({ ...prev, app_url: e.target.value }))}
            placeholder="Ex: https://rrsunureew.sn"
          />
          <p className="text-xs text-gray-500 mt-2">
            Sur Vercel, utilisez l'URL de votre déploiement : https://votre-projet.vercel.app
          </p>
        </CardContent>
      </Card>

      {/* Test Result */}
      {testResult && (
        <Alert className={testResult.success ? 'bg-[#008751]/10 border-[#008751]' : 'bg-[#CE1126]/10 border-[#CE1126]'}>
          {testResult.success ? (
            <CheckCircle className="w-4 h-4 text-[#008751]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#CE1126]" />
          )}
          <AlertDescription className={testResult.success ? 'text-[#008751]' : 'text-[#CE1126]'}>
            {testResult.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={testConnection}
          disabled={testing || saving}
          className="flex-1"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4 mr-2" />
              Tester la connexion
            </>
          )}
        </Button>
        <Button
          className="flex-1 bg-[#008751] hover:bg-[#006b40]"
          onClick={handleSave}
          disabled={saving || testing}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder les paramètres
            </>
          )}
        </Button>
      </div>

      {/* Help */}
      <Card className="bg-[#FFD100]/5 border-[#FFD100]/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-[#FFD100] mt-0.5" />
            <div>
              <p className="font-medium text-[#008751]">Besoin d'aide ?</p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>• Créez un compte sur <a href="https://paytech.sn" target="_blank" rel="noopener noreferrer" className="text-[#008751] underline">paytech.sn</a></li>
                <li>• Allez dans Paramètres → API pour obtenir vos clés</li>
                <li>• Configurez l'URL de webhook : <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">/api/paytech/webhook</code></li>
                <li>• Testez d'abord en mode Test avant de passer en Production</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
