'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  QrCode, 
  ArrowLeft, 
  Lock,
  Check,
  Smartphone
} from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'mensal'
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card')
  const [loading, setLoading] = useState(false)
  const [pixGenerated, setPixGenerated] = useState(false)

  // Dados dos planos
  const plans = {
    semanal: { name: 'Semanal', price: 9.99, period: 'semana' },
    mensal: { name: 'Mensal', price: 19.99, period: 'mês' },
    anual: { name: 'Anual', price: 79.99, period: '12 meses' }
  }

  const selectedPlan = plans[plan as keyof typeof plans] || plans.mensal

  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardData({ ...cardData, number: formatted })
  }

  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 4) {
      const formatted = cleaned.replace(/(\d{2})(?=\d)/g, '$1/')
      setCardData({ ...cardData, expiry: formatted })
    }
  }

  const handleSubmitCard = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validações básicas
    if (cardData.number.replace(/\s/g, '').length !== 16) {
      toast.error('Número do cartão inválido')
      setLoading(false)
      return
    }

    if (cardData.cvv.length !== 3) {
      toast.error('CVV inválido')
      setLoading(false)
      return
    }

    // Simular processamento
    setTimeout(() => {
      toast.success('Pagamento processado com sucesso!')
      setLoading(false)
      setTimeout(() => {
        router.push('/')
      }, 1500)
    }, 2000)
  }

  const handleGeneratePix = () => {
    setLoading(true)
    // Simular geração de código PIX
    setTimeout(() => {
      setPixGenerated(true)
      setLoading(false)
      toast.success('Código PIX gerado com sucesso!')
    }, 1500)
  }

  const handleCopyPixCode = () => {
    const pixCode = '00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540579.995802BR5925MEDPLANTAO LTDA6009SAO PAULO62070503***6304ABCD'
    navigator.clipboard.writeText(pixCode)
    toast.success('Código PIX copiado!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Finalizar Assinatura
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete seu pagamento de forma segura
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumo do Pedido */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                  Plano {selectedPlan.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Cobrança por {selectedPlan.period}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-blue-600">
                    R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    /{selectedPlan.period}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Benefícios inclusos:
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Controle ilimitado de plantões
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Gestão financeira completa
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Sincronização em nuvem
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Suporte prioritário
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t">
                <Lock className="w-4 h-4" />
                <span>Pagamento 100% seguro</span>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Pagamento */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Seleção de Método */}
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => {
                  setPaymentMethod(value as 'card' | 'pix')
                  setPixGenerated(false)
                }}
                className="grid grid-cols-2 gap-4 mb-6"
              >
                <div>
                  <RadioGroupItem
                    value="card"
                    id="card"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="card"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-900/20 cursor-pointer transition-all"
                  >
                    <CreditCard className="w-8 h-8 mb-2 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium">Cartão de Crédito</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="pix"
                    id="pix"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="pix"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-900/20 cursor-pointer transition-all"
                  >
                    <QrCode className="w-8 h-8 mb-2 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium">PIX</span>
                  </Label>
                </div>
              </RadioGroup>

              {/* Formulário de Cartão */}
              {paymentMethod === 'card' && (
                <form onSubmit={handleSubmitCard} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input
                      id="cardName"
                      placeholder="NOME COMPLETO"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Validade</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/AA"
                        value={cardData.expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        maxLength={5}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 py-6 text-lg mt-6"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Confirmar Pagamento - R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                    Seus dados estão protegidos com criptografia de ponta a ponta
                  </p>
                </form>
              )}

              {/* Pagamento PIX */}
              {paymentMethod === 'pix' && (
                <div className="space-y-4">
                  {!pixGenerated ? (
                    <>
                      <div className="text-center py-8">
                        <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Pagamento via PIX
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                          Clique no botão abaixo para gerar seu código PIX
                        </p>
                      </div>

                      <Button
                        onClick={handleGeneratePix}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 py-6 text-lg"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Gerando código...
                          </>
                        ) : (
                          <>
                            <QrCode className="w-5 h-5 mr-2" />
                            Gerar Código PIX
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-center py-4">
                        <div className="inline-block p-4 bg-white rounded-lg mb-4">
                          {/* QR Code simulado */}
                          <div className="w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center">
                            <QrCode className="w-32 h-32 text-white" />
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Escaneie o QR Code
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Abra o app do seu banco e escaneie o código
                        </p>

                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <Smartphone className="w-4 h-4" />
                          <span>Ou copie o código PIX abaixo</span>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-mono break-all">
                          00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540579.995802BR5925MEDPLANTAO LTDA6009SAO PAULO62070503***6304ABCD
                        </p>
                      </div>

                      <Button
                        onClick={handleCopyPixCode}
                        variant="outline"
                        className="w-full"
                      >
                        Copiar Código PIX
                      </Button>

                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          ⏱️ O código PIX expira em <strong>30 minutos</strong>
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          Após o pagamento, sua assinatura será ativada automaticamente
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
