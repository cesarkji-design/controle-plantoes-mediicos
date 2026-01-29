'use client'

import { useState } from 'react'
import { Plantao } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Download,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CarteiraViewProps {
  plantoes: Plantao[]
  stats: {
    totalMes: number
    totalPago: number
    totalPendente: number
    totalPlantoes: number
    horasTrabalhadas: number
    mediaPorPlantao: number
    mediaPorHora: number
    comparacaoMesAnterior: number
  } | null
  demoMode?: boolean
}

type PeriodoFiltro = 'mes' | 'trimestre' | 'semestre' | 'ano' | 'todos'

export default function CarteiraView({ plantoes, stats, demoMode = false }: CarteiraViewProps) {
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>('mes')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getPlantoesFiltrados = () => {
    const now = new Date()
    let dataInicio: Date

    switch (periodoFiltro) {
      case 'mes':
        dataInicio = startOfMonth(now)
        break
      case 'trimestre':
        dataInicio = subMonths(now, 3)
        break
      case 'semestre':
        dataInicio = subMonths(now, 6)
        break
      case 'ano':
        dataInicio = startOfYear(now)
        break
      default:
        dataInicio = new Date(0)
    }

    return plantoes.filter(p => new Date(p.data) >= dataInicio)
  }

  const calcularEstatisticas = () => {
    const plantoesFiltrados = getPlantoesFiltrados()

    // CORREÇÃO: Total geral = soma de TODOS os plantões filtrados
    const totalGeral = plantoesFiltrados.reduce((sum, p) => sum + Number(p.valor), 0)
    
    // CORREÇÃO: Total pago = soma APENAS dos plantões com status 'pago'
    const totalPago = plantoesFiltrados
      .filter(p => p.status_pagamento === 'pago')
      .reduce((sum, p) => sum + Number(p.valor), 0)
    
    // CORREÇÃO: Total pendente = diferença entre total geral e total pago
    const totalPendente = totalGeral - totalPago

    // CORREÇÃO: Calcular horas trabalhadas corretamente
    const horasTrabalhadas = plantoesFiltrados.reduce((sum, p) => {
      const [horaIni, minIni] = p.hora_inicio.split(':').map(Number)
      const [horaFim, minFim] = p.hora_fim.split(':').map(Number)
      
      let horas = horaFim - horaIni
      let minutos = minFim - minIni
      
      if (minutos < 0) {
        horas -= 1
        minutos += 60
      }
      
      if (horas < 0) horas += 24
      
      return sum + horas + (minutos / 60)
    }, 0)

    const mediaPorPlantao = plantoesFiltrados.length > 0 ? totalGeral / plantoesFiltrados.length : 0
    const mediaPorHora = horasTrabalhadas > 0 ? totalGeral / horasTrabalhadas : 0

    return {
      totalGeral,
      totalPago,
      totalPendente,
      totalPlantoes: plantoesFiltrados.length,
      horasTrabalhadas,
      mediaPorPlantao,
      mediaPorHora
    }
  }

  const getGanhosPorInstituicao = () => {
    const plantoesFiltrados = getPlantoesFiltrados()
    const ganhos: { [key: string]: number } = {}

    plantoesFiltrados.forEach(p => {
      const nome = p.instituicao?.nome || 'Sem instituição'
      // CORREÇÃO: Garantir soma correta com Number()
      ganhos[nome] = (ganhos[nome] || 0) + Number(p.valor)
    })

    return Object.entries(ganhos)
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
  }

  const getGanhosPorMes = () => {
    const meses = []
    for (let i = 11; i >= 0; i--) {
      const data = subMonths(new Date(), i)
      const mesAno = format(data, 'MMM/yy', { locale: ptBR })
      const plantoesDoMes = plantoes.filter(p => {
        const plantaoData = new Date(p.data)
        return plantaoData.getMonth() === data.getMonth() && 
               plantaoData.getFullYear() === data.getFullYear()
      })
      // CORREÇÃO: Separar corretamente pago e pendente
      const pago = plantoesDoMes
        .filter(p => p.status_pagamento === 'pago')
        .reduce((sum, p) => sum + Number(p.valor), 0)
      const pendente = plantoesDoMes
        .filter(p => p.status_pagamento !== 'pago')
        .reduce((sum, p) => sum + Number(p.valor), 0)
      meses.push({ mes: mesAno, pago, pendente })
    }
    return meses
  }

  const getDistribuicaoStatus = () => {
    const plantoesFiltrados = getPlantoesFiltrados()
    const distribuicao: { [key: string]: number } = {}

    plantoesFiltrados.forEach(p => {
      const status = p.status_pagamento || 'pendente'
      // CORREÇÃO: Garantir soma correta com Number()
      distribuicao[status] = (distribuicao[status] || 0) + Number(p.valor)
    })

    return Object.entries(distribuicao).map(([status, valor]) => ({ status, valor }))
  }

  const estatisticas = calcularEstatisticas()
  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

  const handleExportarRelatorio = () => {
    // TODO: Implementar exportação para PDF/Excel
    alert('Funcionalidade de exportação em desenvolvimento')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Carteira</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Controle financeiro completo
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={periodoFiltro} onValueChange={(value: PeriodoFiltro) => setPeriodoFiltro(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Este mês</SelectItem>
              <SelectItem value="trimestre">Último trimestre</SelectItem>
              <SelectItem value="semestre">Último semestre</SelectItem>
              <SelectItem value="ano">Este ano</SelectItem>
              <SelectItem value="todos">Todos os períodos</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleExportarRelatorio}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(estatisticas.totalGeral)}</div>
            <p className="text-xs text-blue-100 mt-1">
              {estatisticas.totalPlantoes} plantões
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(estatisticas.totalPago)}</div>
            <p className="text-xs text-green-100 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {estatisticas.totalGeral > 0 ? ((estatisticas.totalPago / estatisticas.totalGeral) * 100).toFixed(0) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">A Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(estatisticas.totalPendente)}</div>
            <p className="text-xs text-orange-100 mt-1">
              <TrendingDown className="w-3 h-3 inline mr-1" />
              {estatisticas.totalGeral > 0 ? ((estatisticas.totalPendente / estatisticas.totalGeral) * 100).toFixed(0) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Média por Hora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(estatisticas.mediaPorHora)}</div>
            <p className="text-xs text-purple-100 mt-1">
              {estatisticas.horasTrabalhadas.toFixed(0)}h trabalhadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ganhos por Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getGanhosPorMes()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="pago" fill="#10b981" name="Pago" />
                <Bar dataKey="pendente" fill="#f59e0b" name="Pendente" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ganhos por Instituição */}
        <Card>
          <CardHeader>
            <CardTitle>Ganhos por Instituição</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getGanhosPorInstituicao()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, percent }) => `${nome} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {getGanhosPorInstituicao().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Instituições */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Instituições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getGanhosPorInstituicao().length > 0 ? (
              getGanhosPorInstituicao().map((item, index) => {
                // CORREÇÃO: Contar plantões corretamente para cada instituição
                const quantidadePlantoes = plantoes.filter(p => p.instituicao?.nome === item.nome).length
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.nome}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {quantidadePlantoes} plantões
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(item.valor)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {estatisticas.totalGeral > 0 ? ((item.valor / estatisticas.totalGeral) * 100).toFixed(1) : 0}% do total
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhum plantão encontrado no período selecionado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Indicadores Detalhados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Média por Plantão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(estatisticas.mediaPorPlantao)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Por plantão realizado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total de Plantões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {estatisticas.totalPlantoes}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No período selecionado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Horas Trabalhadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {estatisticas.horasTrabalhadas.toFixed(0)}h
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total de horas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
