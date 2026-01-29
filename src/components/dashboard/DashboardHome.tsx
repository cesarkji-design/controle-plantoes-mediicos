'use client'

import { DashboardStats, Plantao } from '@/lib/types'
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  DollarSign,
  Activity,
  Building2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DashboardHomeProps {
  stats: DashboardStats | null
  plantoes: Plantao[]
  demoMode?: boolean
}

export default function DashboardHome({ stats, plantoes, demoMode = false }: DashboardHomeProps) {
  // Dados para gráfico de faturamento mensal
  const getFaturamentoMensal = () => {
    const meses = []
    for (let i = 5; i >= 0; i--) {
      const data = subMonths(new Date(), i)
      const mesAno = format(data, 'MMM/yy', { locale: ptBR })
      const plantoesDoMes = plantoes.filter(p => {
        const plantaoData = new Date(p.data)
        return plantaoData.getMonth() === data.getMonth() && 
               plantaoData.getFullYear() === data.getFullYear()
      })
      // CORREÇÃO: Somar corretamente usando Number() para garantir tipo numérico
      const total = plantoesDoMes.reduce((sum, p) => sum + Number(p.valor), 0)
      meses.push({ mes: mesAno, valor: total })
    }
    return meses
  }

  // Dados para gráfico de distribuição por instituição
  const getDistribuicaoPorInstituicao = () => {
    const distribuicao: { [key: string]: number } = {}
    plantoes.forEach(p => {
      const nome = p.instituicao?.nome || 'Sem instituição'
      // CORREÇÃO: Garantir soma correta com Number()
      distribuicao[nome] = (distribuicao[nome] || 0) + Number(p.valor)
    })
    return Object.entries(distribuicao).map(([nome, valor]) => ({ nome, valor }))
  }

  // Dados para gráfico de plantões por mês
  const getPlantoesPorMes = () => {
    const meses = []
    for (let i = 5; i >= 0; i--) {
      const data = subMonths(new Date(), i)
      const mesAno = format(data, 'MMM/yy', { locale: ptBR })
      const quantidade = plantoes.filter(p => {
        const plantaoData = new Date(p.data)
        return plantaoData.getMonth() === data.getMonth() && 
               plantaoData.getFullYear() === data.getFullYear()
      }).length
      meses.push({ mes: mesAno, quantidade })
    }
    return meses
  }

  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Visão geral dos seus plantões e finanças
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalMes || 0)}</div>
            <p className="text-xs text-blue-100 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {stats?.totalPlantoes || 0} plantões
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalPago || 0)}</div>
            <p className="text-xs text-green-100 mt-1">
              <DollarSign className="w-3 h-3 inline mr-1" />
              {stats?.totalMes && stats?.totalMes > 0 ? ((stats.totalPago / stats.totalMes) * 100).toFixed(0) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">A Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalPendente || 0)}</div>
            <p className="text-xs text-orange-100 mt-1">
              <Activity className="w-3 h-3 inline mr-1" />
              {stats?.totalMes && stats?.totalMes > 0 ? ((stats.totalPendente / stats.totalMes) * 100).toFixed(0) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Horas Trabalhadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.horasTrabalhadas.toFixed(0) || 0}h</div>
            <p className="text-xs text-purple-100 mt-1">
              <Clock className="w-3 h-3 inline mr-1" />
              {formatCurrency(stats?.mediaPorHora || 0)}/hora
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturamento Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getFaturamentoMensal()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Instituição */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Instituição</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getDistribuicaoPorInstituicao()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, percent }) => `${nome} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {getDistribuicaoPorInstituicao().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plantões por Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Plantões por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getPlantoesPorMes()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Indicadores */}
        <Card>
          <CardHeader>
            <CardTitle>Indicadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Média por Plantão</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats?.mediaPorPlantao || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Média por Hora</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats?.mediaPorHora || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Plantões</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats?.totalPlantoes || 0}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
