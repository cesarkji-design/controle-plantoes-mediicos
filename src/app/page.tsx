'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { User } from '@supabase/supabase-js'
import Dashboard from '@/components/dashboard/Dashboard'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleDemoMode = () => {
    setDemoMode(true)
  }

  const handleShowAuth = () => {
    setShowAuth(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052CC]"></div>
      </div>
    )
  }

  if (!user && !demoMode) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            {/* Header com Logo */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <img 
                  src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/e510aaae-af70-4bb4-bb53-e940a85c95f9.png" 
                  alt="MedBusy Logo" 
                  className="h-48 sm:h-56 w-auto"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
              <p className="text-gray-700 text-lg font-medium">
                Controle completo dos seus plantões e finanças
              </p>
            </div>

            {!showAuth ? (
              <>
                {/* Login Button - Prioridade Principal */}
                <div className="mb-6">
                  <Button
                    onClick={handleShowAuth}
                    className="w-full bg-gradient-to-r from-[#0052CC] via-[#00A3E0] to-[#FF8C00] hover:opacity-90 text-white font-bold py-8 text-lg rounded-xl shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    Fazer Login / Criar Conta
                  </Button>
                </div>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-600 font-medium">
                      ou
                    </span>
                  </div>
                </div>

                {/* Demo Button - Secundário */}
                <div className="mb-6">
                  <Button
                    onClick={handleDemoMode}
                    variant="outline"
                    className="w-full border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 py-6 rounded-xl transition-all duration-300"
                  >
                    🚀 Explorar App Completo (Demo)
                  </Button>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Acesso instantâneo • Sem cadastro necessário
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Botão Voltar */}
                <Button
                  onClick={() => setShowAuth(false)}
                  variant="ghost"
                  className="mb-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  ← Voltar
                </Button>

                {/* Auth Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                  <Auth
                    supabaseClient={supabase}
                    appearance={{
                      theme: ThemeSupa,
                      variables: {
                        default: {
                          colors: {
                            brand: '#0052CC',
                            brandAccent: '#00A3E0',
                          },
                        },
                      },
                      className: {
                        container: 'w-full',
                        button: 'rounded-lg font-medium transition-all duration-200',
                        input: 'rounded-lg',
                      },
                    }}
                    providers={[]}
                    localization={{
                      variables: {
                        sign_in: {
                          email_label: 'E-mail',
                          password_label: 'Senha',
                          button_label: 'Entrar',
                          loading_button_label: 'Entrando...',
                          link_text: 'Já tem uma conta? Entre',
                        },
                        sign_up: {
                          email_label: 'E-mail',
                          password_label: 'Senha',
                          button_label: 'Criar conta',
                          loading_button_label: 'Criando conta...',
                          link_text: 'Não tem uma conta? Cadastre-se',
                        },
                      },
                    }}
                  />
                </div>

                {/* Aviso de Configuração */}
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <p className="text-sm text-orange-800 text-center">
                    ⚠️ Para usar autenticação real, configure o Supabase nas integrações do projeto
                  </p>
                </div>
              </>
            )}

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-2xl mb-1">📊</div>
                <p className="text-sm text-gray-700 font-medium">Dashboard completo</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-2xl mb-1">💰</div>
                <p className="text-sm text-gray-700 font-medium">Controle financeiro</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-2xl mb-1">📅</div>
                <p className="text-sm text-gray-700 font-medium">Agenda organizada</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-2xl mb-1">☁️</div>
                <p className="text-sm text-gray-700 font-medium">Sincronização nuvem</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <Dashboard user={user} demoMode={demoMode} />
}
