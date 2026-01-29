'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Check, 
  ArrowLeft,
  Zap,
  TrendingUp,
  Crown
} from 'lucide-react'

export default function PlansPage() {
  const router = useRouter()

  const plans = [
    {
      id: 'semanal',
      name: 'Semanal',
      price: 9.99,
      period: 'semana',
      icon: Zap,
      color: 'from-green-500 to-emerald-600',
      description: 'Ideal para testar',
      features: [
        'Controle ilimitado de plantões',
        'Gestão financeira completa',
        'Sincronização em nuvem',
        'Suporte por e-mail'
      ]
    },
    {
      id: 'mensal',
      name: 'Mensal',
      price: 19.99,
      period: 'mês',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-600',
      popular: true,
      description: 'Mais escolhido',
      features: [
        'Controle ilimitado de plantões',
        'Gestão financeira completa',
        'Sincronização em nuvem',
        'Suporte prioritário',
        'Relatórios avançados'
      ]
    },
    {
      id: 'anual',
      name: 'Anual',
      price: 79.99,
      period: '12 meses',
      icon: Crown,
      color: 'from-purple-500 to-pink-600',
      description: 'Melhor custo-benefício',
      savings: 'Economize R$ 160/ano',
      features: [
        'Controle ilimitado de plantões',
        'Gestão financeira completa',
        'Sincronização em nuvem',
        'Suporte VIP 24/7',
        'Relatórios avançados',
        'Backup automático',
        'Acesso antecipado a novidades'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Escolha Seu Plano
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Selecione o plano ideal para gerenciar seus plantões com eficiência
            </p>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card 
                key={plan.id}
                className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-xl scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-1">
                      MAIS POPULAR
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="text-center py-4">
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        R$ {plan.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        /{plan.period}
                      </span>
                    </div>
                    {plan.savings && (
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {plan.savings}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => router.push(`/payment?plan=${plan.id}`)}
                    className={`w-full py-6 text-lg ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700' 
                        : 'bg-gradient-to-r ' + plan.color + ' hover:opacity-90'
                    }`}
                  >
                    Assinar Agora
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Trust Badges */}
        <div className="text-center space-y-4 py-8 border-t">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            🔒 Pagamento 100% seguro • ✓ Cancele quando quiser • 💳 Aceita cartão e PIX
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Seus dados estão protegidos com criptografia de ponta a ponta
          </p>
        </div>
      </div>
    </div>
  )
}
