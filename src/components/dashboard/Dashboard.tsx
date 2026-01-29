'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Plantao, Instituicao, Profile } from '@/lib/types'
import { 
  LayoutDashboard, 
  Calendar, 
  Building2, 
  Wallet, 
  LogOut,
  Menu,
  X,
  UserCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import DashboardHome from './DashboardHome'
import PlantoesView from './PlantoesView'
import InstituicoesView from './InstituicoesView'
import CarteiraView from './CarteiraView'
import ContaView from './ContaView'

interface DashboardProps {
  user: User | null
  demoMode?: boolean
}

type View = 'dashboard' | 'plantoes' | 'instituicoes' | 'carteira' | 'conta'

interface DashboardStats {
  totalMes: number
  totalPago: number
  totalPendente: number
  totalPlantoes: number
  horasTrabalhadas: number
  mediaPorPlantao: number
  mediaPorHora: number
  comparacaoMesAnterior: number
}

// Dados de demonstração
const DEMO_INSTITUICOES: Instituicao[] = [
  {
    id: 'demo-1',
    user_id: 'demo',
    nome: 'Hospital São Lucas',
    endereco: 'Av. Principal, 1000',
    telefone: '(11) 3333-4444',
    email: 'contato@saolucas.com.br',
    observacoes: 'Hospital de referência',
    cor: '#3B82F6',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    user_id: 'demo',
    nome: 'Clínica Vida',
    endereco: 'Rua das Flores, 500',
    telefone: '(11) 2222-3333',
    email: 'contato@clinicavida.com.br',
    observacoes: 'Clínica particular',
    cor: '#10B981',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    user_id: 'demo',
    nome: 'UPA Central',
    endereco: 'Av. Central, 2000',
    telefone: '(11) 4444-5555',
    email: 'contato@upacentral.gov.br',
    observacoes: 'Atendimento 24h',
    cor: '#F59E0B',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const DEMO_PLANTOES: Plantao[] = [
  {
    id: 'demo-p1',
    user_id: 'demo',
    instituicao_id: 'demo-1',
    data: new Date(2025, 0, 28).toISOString().split('T')[0],
    hora_inicio: '08:00',
    hora_fim: '20:00',
    valor: 2400.00,
    status_pagamento: 'pago',
    forma_pagamento: 'pix',
    observacoes: 'Plantão diurno',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    instituicao: DEMO_INSTITUICOES[0],
  },
  {
    id: 'demo-p2',
    user_id: 'demo',
    data: new Date(2025, 0, 25).toISOString().split('T')[0],
    instituicao_id: 'demo-2',
    hora_inicio: '19:00',
    hora_fim: '07:00',
    valor: 3200.00,
    status_pagamento: 'pendente',
    observacoes: 'Plantão noturno',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    instituicao: DEMO_INSTITUICOES[1],
  },
  {
    id: 'demo-p3',
    user_id: 'demo',
    instituicao_id: 'demo-3',
    data: new Date(2025, 0, 22).toISOString().split('T')[0],
    hora_inicio: '08:00',
    hora_fim: '14:00',
    valor: 1200.00,
    status_pagamento: 'pago',
    forma_pagamento: 'transferencia',
    observacoes: 'Meio período',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    instituicao: DEMO_INSTITUICOES[2],
  },
  {
    id: 'demo-p4',
    user_id: 'demo',
    instituicao_id: 'demo-1',
    data: new Date(2025, 0, 20).toISOString().split('T')[0],
    hora_inicio: '08:00',
    hora_fim: '20:00',
    valor: 2400.00,
    status_pagamento: 'pago',
    forma_pagamento: 'pix',
    observacoes: 'Plantão diurno',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    instituicao: DEMO_INSTITUICOES[0],
  },
  {
    id: 'demo-p5',
    user_id: 'demo',
    instituicao_id: 'demo-2',
    data: new Date(2025, 0, 18).toISOString().split('T')[0],
    hora_inicio: '14:00',
    hora_fim: '20:00',
    valor: 1600.00,
    status_pagamento: 'pendente',
    observacoes: 'Tarde',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    instituicao: DEMO_INSTITUICOES[1],
  },
]

export default function Dashboard({ user, demoMode = false }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [plantoes, setPlantoes] = useState<Plantao[]>([])
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (demoMode) {
      // Carregar dados de demonstração
      setPlantoes(DEMO_PLANTOES)
      setInstituicoes(DEMO_INSTITUICOES)
      calculateStats(DEMO_PLANTOES)
    } else if (user) {
      loadData()
      loadProfile()
    }
  }, [demoMode, user])

  const loadProfile = async () => {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
    } else {
      // Criar perfil se não existir
      const newProfile = {
        id: user.id,
        nome: user.user_metadata?.full_name || 'Usuário',
        email: user.email || '',
      }
      
      await supabase.from('profiles').insert(newProfile)
      setProfile(newProfile as Profile)
    }
  }

  const loadData = async () => {
    if (!user) return

    console.log('🔄 Carregando dados do usuário:', user.id)

    // Carregar plantões SEM join automático
    const { data: plantoesData, error: plantoesError } = await supabase
      .from('plantoes')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false })

    if (plantoesError) {
      console.error('❌ Erro ao carregar plantões:', plantoesError)
    } else {
      console.log('✅ Plantões carregados:', plantoesData?.length || 0)
    }

    // Carregar instituições
    const { data: instituicoesData, error: instituicoesError } = await supabase
      .from('instituicoes')
      .select('*')
      .eq('user_id', user.id)
      .order('nome')

    if (instituicoesError) {
      console.error('❌ Erro ao carregar instituições:', instituicoesError)
    } else {
      console.log('✅ Instituições carregadas:', instituicoesData?.length || 0)
    }

    // Fazer merge manual dos dados
    if (plantoesData && instituicoesData) {
      const plantoesComInstituicoes = plantoesData.map(plantao => {
        const instituicao = instituicoesData.find(inst => inst.id === plantao.instituicao_id)
        return {
          ...plantao,
          instituicao: instituicao || null
        }
      })
      
      console.log('✅ Plantões com instituições:', plantoesComInstituicoes.length)
      setPlantoes(plantoesComInstituicoes as Plantao[])
      calculateStats(plantoesComInstituicoes as Plantao[])
    }

    if (instituicoesData) {
      setInstituicoes(instituicoesData)
    }
  }

  const calculateStats = (plantoes: Plantao[]) => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Filtrar plantões do mês atual
    const plantoesDoMes = plantoes.filter(p => {
      const data = new Date(p.data)
      return data.getMonth() === currentMonth && data.getFullYear() === currentYear
    })

    // CORREÇÃO: Total do mês = soma de TODOS os plantões do mês
    const totalMes = plantoesDoMes.reduce((sum, p) => sum + Number(p.valor), 0)
    
    // CORREÇÃO: Total pago = soma APENAS dos plantões com status 'pago'
    const totalPago = plantoesDoMes
      .filter(p => p.status_pagamento === 'pago')
      .reduce((sum, p) => sum + Number(p.valor), 0)
    
    // CORREÇÃO: Total pendente = diferença entre total do mês e total pago
    const totalPendente = totalMes - totalPago

    // Calcular horas trabalhadas corretamente
    const horasTrabalhadas = plantoesDoMes.reduce((sum, p) => {
      const [horaIni, minIni] = p.hora_inicio.split(':').map(Number)
      const [horaFim, minFim] = p.hora_fim.split(':').map(Number)
      
      let horas = horaFim - horaIni
      let minutos = minFim - minIni
      
      // Ajustar para plantões que passam da meia-noite
      if (minutos < 0) {
        horas -= 1
        minutos += 60
      }
      
      if (horas < 0) horas += 24
      
      return sum + horas + (minutos / 60)
    }, 0)

    // Calcular médias
    const mediaPorPlantao = plantoesDoMes.length > 0 ? totalMes / plantoesDoMes.length : 0
    const mediaPorHora = horasTrabalhadas > 0 ? totalMes / horasTrabalhadas : 0

    setStats({
      totalMes,
      totalPago,
      totalPendente,
      totalPlantoes: plantoesDoMes.length,
      horasTrabalhadas,
      mediaPorPlantao,
      mediaPorHora,
      comparacaoMesAnterior: 0,
    })
  }

  const handleLogout = async () => {
    if (demoMode) {
      window.location.reload()
    } else {
      await supabase.auth.signOut()
    }
  }

  const menuItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plantoes' as View, label: 'Plantões', icon: Calendar },
    { id: 'instituicoes' as View, label: 'Instituições', icon: Building2 },
    { id: 'carteira' as View, label: 'Carteira', icon: Wallet },
    { id: 'conta' as View, label: 'Conta', icon: UserCircle },
  ]

  const userEmail = demoMode ? 'demo@medbusy.com' : user?.email

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 lg:pb-0">
      {/* Demo Banner */}
      {demoMode && (
        <div className="bg-gradient-to-r from-[#0052CC] via-[#00A3E0] to-[#FF8C00] text-white px-4 py-2 text-center text-sm font-medium">
          🎯 Modo Demonstração - Explore o app com dados de exemplo
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <img 
          src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/e510aaae-af70-4bb4-bb53-e940a85c95f9.png" 
          alt="MedBusy Logo" 
          className="h-30 w-auto"
          style={{ mixBlendMode: 'multiply' }}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white dark:bg-gray-800 w-64 h-full p-4 pt-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* User Info no Mobile Menu */}
            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {userEmail}
              </p>
              {demoMode && (
                <div className="mt-2 px-2 py-1 bg-gradient-to-r from-[#0052CC] to-[#FF8C00] text-white text-xs rounded-md inline-block">
                  Modo Demo
                </div>
              )}
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    currentView === item.id
                      ? 'bg-gradient-to-r from-[#0052CC] to-[#00A3E0] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium truncate">{item.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium truncate">{demoMode ? 'Sair da Demo' : 'Sair'}</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen sticky top-0">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/e510aaae-af70-4bb4-bb53-e940a85c95f9.png" 
              alt="MedBusy Logo" 
              className="h-30 w-auto mb-3"
              style={{ mixBlendMode: 'multiply' }}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {userEmail}
            </p>
            {demoMode && (
              <div className="mt-2 px-2 py-1 bg-gradient-to-r from-[#0052CC] to-[#FF8C00] text-white text-xs rounded-md inline-block">
                Modo Demo
              </div>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-[#0052CC] to-[#00A3E0] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              {demoMode ? 'Sair da Demo' : 'Sair'}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {currentView === 'dashboard' && <DashboardHome stats={stats} plantoes={plantoes} demoMode={demoMode} />}
          {currentView === 'plantoes' && (
            <PlantoesView 
              plantoes={plantoes} 
              instituicoes={instituicoes}
              onUpdate={demoMode ? () => {} : loadData}
              demoMode={demoMode}
              userId={user?.id || 'demo'}
            />
          )}
          {currentView === 'instituicoes' && (
            <InstituicoesView 
              instituicoes={instituicoes}
              onUpdate={demoMode ? () => {} : loadData}
              demoMode={demoMode}
              userId={user?.id || 'demo'}
            />
          )}
          {currentView === 'carteira' && (
            <CarteiraView 
              plantoes={plantoes}
              stats={stats}
              demoMode={demoMode}
            />
          )}
          {currentView === 'conta' && (
            <ContaView 
              user={user}
              profile={profile}
              demoMode={demoMode}
              onUpdate={loadProfile}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-2 z-50 shadow-lg safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all min-w-0 ${
                currentView === item.id
                  ? 'text-[#0052CC] dark:text-[#00A3E0] bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${currentView === item.id ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium truncate max-w-[60px]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
