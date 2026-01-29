'use client'

import { useState } from 'react'
import { Plantao, Instituicao } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon,
  List,
  Table as TableIcon,
  Edit,
  Trash2,
  Copy,
  Clock,
  DollarSign,
  Building2,
  MoreVertical,
  Repeat
} from 'lucide-react'
import { format, addDays, addWeeks, isSaturday, isSunday, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface PlantoesViewProps {
  plantoes: Plantao[]
  instituicoes: Instituicao[]
  onUpdate: () => Promise<void> | void
  demoMode?: boolean
  userId: string
}

type ViewMode = 'lista' | 'tabela'
type TipoRepeticao = 'nao' | 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo' | 'finais_semana' | 'dias_uteis'

export default function PlantoesView({ plantoes, instituicoes, onUpdate, demoMode = false, userId }: PlantoesViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('lista')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlantao, setEditingPlantao] = useState<Plantao | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    data: '',
    hora_inicio: '',
    hora_fim: '',
    instituicao_id: '',
    valor: '',
    status_pagamento: 'pendente' as 'pendente' | 'pago' | 'atrasado',
    forma_pagamento: '' as 'pix' | 'transferencia' | 'dinheiro' | 'cartao' | '',
    data_pagamento: '',
    observacoes: '',
    repetir: 'nao' as TipoRepeticao,
    repetir_ate: '',
    repetir_quantidade: '4'
  })

  // Função auxiliar para obter nome da instituição
  const getInstituicaoNome = (plantao: Plantao): string => {
    if (plantao.instituicao?.nome) {
      return plantao.instituicao.nome
    }
    
    // Buscar instituição na lista
    const instituicao = instituicoes.find(inst => inst.id === plantao.instituicao_id)
    return instituicao?.nome || 'Sem instituição'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (demoMode) {
      toast.info('Modo demonstração - alterações não são salvas')
      setIsDialogOpen(false)
      return
    }

    if (isSubmitting) return
    setIsSubmitting(true)

    const plantaoData = {
      data: formData.data,
      hora_inicio: formData.hora_inicio,
      hora_fim: formData.hora_fim,
      instituicao_id: formData.instituicao_id || null,
      valor: parseFloat(formData.valor),
      status_pagamento: formData.status_pagamento,
      forma_pagamento: formData.forma_pagamento || null,
      data_pagamento: formData.data_pagamento || null,
      observacoes: formData.observacoes,
      user_id: userId
    }

    try {
      if (editingPlantao) {
        const { error } = await supabase
          .from('plantoes')
          .update(plantaoData)
          .eq('id', editingPlantao.id)
          .eq('user_id', userId) // Garantir que só atualiza se for do usuário

        if (error) {
          console.error('Erro ao atualizar plantão:', error)
          toast.error(`Erro ao atualizar plantão: ${error.message}`)
          setIsSubmitting(false)
          return
        }
        
        toast.success('Plantão atualizado com sucesso!')
      } else {
        // Criar plantão(ões)
        const plantoesParaCriar: any[] = []

        if (formData.repetir === 'nao') {
          // Apenas um plantão
          plantoesParaCriar.push(plantaoData)
        } else {
          // Criar múltiplos plantões baseado na repetição
          const dataInicial = new Date(formData.data)
          const quantidade = parseInt(formData.repetir_quantidade) || 4
          
          for (let i = 0; i < quantidade; i++) {
            let proximaData = new Date(dataInicial)
            
            switch (formData.repetir) {
              case 'segunda':
                proximaData = addWeeks(dataInicial, i)
                while (getDay(proximaData) !== 1) proximaData = addDays(proximaData, 1)
                break
              case 'terca':
                proximaData = addWeeks(dataInicial, i)
                while (getDay(proximaData) !== 2) proximaData = addDays(proximaData, 1)
                break
              case 'quarta':
                proximaData = addWeeks(dataInicial, i)
                while (getDay(proximaData) !== 3) proximaData = addDays(proximaData, 1)
                break
              case 'quinta':
                proximaData = addWeeks(dataInicial, i)
                while (getDay(proximaData) !== 4) proximaData = addDays(proximaData, 1)
                break
              case 'sexta':
                proximaData = addWeeks(dataInicial, i)
                while (getDay(proximaData) !== 5) proximaData = addDays(proximaData, 1)
                break
              case 'sabado':
                proximaData = addWeeks(dataInicial, i)
                while (getDay(proximaData) !== 6) proximaData = addDays(proximaData, 1)
                break
              case 'domingo':
                proximaData = addWeeks(dataInicial, i)
                while (getDay(proximaData) !== 0) proximaData = addDays(proximaData, 1)
                break
              case 'finais_semana':
                // Alterna entre sábado e domingo
                const semanas = Math.floor(i / 2)
                proximaData = addWeeks(dataInicial, semanas)
                if (i % 2 === 0) {
                  while (getDay(proximaData) !== 6) proximaData = addDays(proximaData, 1)
                } else {
                  while (getDay(proximaData) !== 0) proximaData = addDays(proximaData, 1)
                }
                break
              case 'dias_uteis':
                // Segunda a sexta
                let diasAdicionados = 0
                proximaData = new Date(dataInicial)
                while (diasAdicionados < i) {
                  proximaData = addDays(proximaData, 1)
                  if (getDay(proximaData) >= 1 && getDay(proximaData) <= 5) {
                    diasAdicionados++
                  }
                }
                break
            }

            plantoesParaCriar.push({
              ...plantaoData,
              data: format(proximaData, 'yyyy-MM-dd')
            })
          }
        }

        console.log('📝 Criando plantões:', plantoesParaCriar)

        const { data, error } = await supabase
          .from('plantoes')
          .insert(plantoesParaCriar)
          .select()

        if (error) {
          console.error('❌ Erro ao criar plantão(ões):', error)
          toast.error(`Erro ao criar plantão: ${error.message}`)
          setIsSubmitting(false)
          return
        }
        
        console.log('✅ Plantões criados com sucesso:', data)
        
        if (plantoesParaCriar.length > 1) {
          toast.success(`${plantoesParaCriar.length} plantões criados com sucesso!`)
        } else {
          toast.success('Plantão criado com sucesso!')
        }
      }

      // Recarregar dados ANTES de fechar o diálogo
      console.log('🔄 Recarregando dados...')
      await onUpdate()
      console.log('✅ Dados recarregados!')

      // Fechar diálogo e resetar form
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('💥 Erro inesperado:', error)
      toast.error('Erro inesperado ao processar plantão')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (plantao: Plantao) => {
    console.log('🖊️ Editando plantão:', plantao.id)
    
    if (demoMode) {
      toast.info('Modo demonstração - visualização apenas')
      return
    }

    setEditingPlantao(plantao)
    setFormData({
      data: plantao.data,
      hora_inicio: plantao.hora_inicio,
      hora_fim: plantao.hora_fim,
      instituicao_id: plantao.instituicao_id || '',
      valor: plantao.valor.toString(),
      status_pagamento: plantao.status_pagamento,
      forma_pagamento: (plantao.forma_pagamento as any) || '',
      data_pagamento: plantao.data_pagamento || '',
      observacoes: plantao.observacoes || '',
      repetir: 'nao',
      repetir_ate: '',
      repetir_quantidade: '4'
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (plantaoId: string) => {
    console.log('🗑️ [INÍCIO] Tentando excluir plantão:', plantaoId)
    
    if (demoMode) {
      toast.info('Modo demonstração - alterações não são salvas')
      return
    }

    // Confirmação ANTES de qualquer operação
    const confirmacao = window.confirm(
      '⚠️ TEM CERTEZA QUE DESEJA EXCLUIR ESTE PLANTÃO?\n\n' +
      'Esta ação NÃO PODE ser desfeita.\n' +
      'O plantão será removido permanentemente do catálogo e dos gráficos.\n\n' +
      'Clique em OK para CONFIRMAR a exclusão.'
    )
    
    if (!confirmacao) {
      console.log('❌ [CANCELADO] Usuário cancelou a exclusão')
      return
    }

    console.log('✅ [CONFIRMADO] Usuário confirmou - iniciando exclusão...')

    try {
      // Executar DELETE no Supabase
      console.log('🔄 [EXECUTANDO] DELETE no Supabase...')
      const { error, data } = await supabase
        .from('plantoes')
        .delete()
        .eq('id', plantaoId)
        .eq('user_id', userId)
        .select()

      if (error) {
        console.error('❌ [ERRO SUPABASE]', error)
        toast.error(`Erro ao excluir: ${error.message}`)
        return
      }

      console.log('✅ [SUCESSO SUPABASE] Plantão excluído:', data)
      
      // Notificar sucesso
      toast.success('✅ Plantão excluído com sucesso!')
      
      // Recarregar dados para atualizar Dashboard e Carteira
      console.log('🔄 [ATUALIZANDO] Recarregando dados do Dashboard e Carteira...')
      await onUpdate()
      console.log('✅ [COMPLETO] Dados atualizados! Dashboard e Carteira sincronizados.')
      
    } catch (error) {
      console.error('💥 [ERRO CRÍTICO]', error)
      toast.error('Erro crítico ao excluir plantão')
    }
  }

  const handleDuplicate = async (plantao: Plantao) => {
    console.log('📋 Tentando duplicar plantão:', plantao.id)
    
    if (demoMode) {
      toast.info('Modo demonstração - alterações não são salvas')
      return
    }

    try {
      console.log('📋 Duplicando plantão:', plantao.id)
      
      // Remover campos que não devem ser duplicados
      const { id, created_at, updated_at, instituicao, ...plantaoData } = plantao
      
      // Criar novo plantão com user_id correto
      const novoDado = {
        ...plantaoData,
        user_id: userId
      }

      console.log('📝 Dados do novo plantão:', novoDado)
      
      const { data, error } = await supabase
        .from('plantoes')
        .insert([novoDado])
        .select()

      if (error) {
        console.error('❌ Erro ao duplicar plantão:', error)
        toast.error(`Erro ao duplicar plantão: ${error.message}`)
        return
      }

      console.log('✅ Plantão duplicado com sucesso:', data)
      toast.success('Plantão duplicado com sucesso!')
      
      // Recarregar dados
      console.log('🔄 Recarregando dados...')
      await onUpdate()
      console.log('✅ Dados recarregados!')
    } catch (error) {
      console.error('💥 Erro inesperado ao duplicar:', error)
      toast.error('Erro inesperado ao duplicar plantão')
    }
  }

  const resetForm = () => {
    setFormData({
      data: '',
      hora_inicio: '',
      hora_fim: '',
      instituicao_id: '',
      valor: '',
      status_pagamento: 'pendente',
      forma_pagamento: '',
      data_pagamento: '',
      observacoes: '',
      repetir: 'nao',
      repetir_ate: '',
      repetir_quantidade: '4'
    })
    setEditingPlantao(null)
  }

  const filteredPlantoes = plantoes.filter(p => {
    const nomeInstituicao = getInstituicaoNome(p)
    const matchesSearch = 
      nomeInstituicao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.observacoes?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'todos' || p.status_pagamento === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    const colors = {
      pago: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pendente: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      atrasado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[status as keyof typeof colors] || colors.pendente
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const calculateHours = (inicio: string, fim: string) => {
    const [horaIni, minIni] = inicio.split(':').map(Number)
    const [horaFim, minFim] = fim.split(':').map(Number)
    
    let horas = horaFim - horaIni
    let minutos = minFim - minIni
    
    if (minutos < 0) {
      horas -= 1
      minutos += 60
    }
    
    if (horas < 0) horas += 24
    
    return `${horas}h${minutos > 0 ? minutos + 'min' : ''}`
  }

  return (
    <div className="space-y-6 relative pb-20 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plantões</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie seus plantões médicos
          </p>
        </div>

        {/* Botão Desktop */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button 
              className="hidden sm:flex bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Plantão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingPlantao ? 'Editar Plantão' : 'Novo Plantão'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seção Principal */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Informações Principais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="instituicao" className="text-base font-medium">
                      Instituição
                    </Label>
                    <Select
                      value={formData.instituicao_id}
                      onValueChange={(value) => setFormData({ ...formData, instituicao_id: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione a instituição..." />
                      </SelectTrigger>
                      <SelectContent>
                        {instituicoes.map(inst => (
                          <SelectItem key={inst.id} value={inst.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              {inst.nome}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="data" className="text-base font-medium">
                      Data *
                    </Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      className="h-11"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="valor" className="text-base font-medium">
                      Valor (R$) *
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.valor}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                        className="h-11 pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção de Horários - Estilo iPhone */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Horários
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hora_inicio" className="text-base font-medium">
                      Início *
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                      <Input
                        id="hora_inicio"
                        type="time"
                        value={formData.hora_inicio}
                        onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                        className="h-11 pl-10 text-center text-lg font-medium tracking-wider [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        style={{
                          fontVariantNumeric: 'tabular-nums'
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="hora_fim" className="text-base font-medium">
                      Término *
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                      <Input
                        id="hora_fim"
                        type="time"
                        value={formData.hora_fim}
                        onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                        className="h-11 pl-10 text-center text-lg font-medium tracking-wider [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        style={{
                          fontVariantNumeric: 'tabular-nums'
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção de Repetição */}
              {!editingPlantao && (
                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Repetir Plantão
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="repetir" className="text-base font-medium">
                        Tipo de Repetição
                      </Label>
                      <Select
                        value={formData.repetir}
                        onValueChange={(value: TipoRepeticao) => setFormData({ ...formData, repetir: value })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nao">Não repetir</SelectItem>
                          <SelectItem value="segunda">🗓️ Toda Segunda-feira</SelectItem>
                          <SelectItem value="terca">🗓️ Toda Terça-feira</SelectItem>
                          <SelectItem value="quarta">🗓️ Toda Quarta-feira</SelectItem>
                          <SelectItem value="quinta">🗓️ Toda Quinta-feira</SelectItem>
                          <SelectItem value="sexta">🗓️ Toda Sexta-feira</SelectItem>
                          <SelectItem value="sabado">🗓️ Todo Sábado</SelectItem>
                          <SelectItem value="domingo">🗓️ Todo Domingo</SelectItem>
                          <SelectItem value="finais_semana">🎉 Todos os Finais de Semana</SelectItem>
                          <SelectItem value="dias_uteis">💼 Todos os Dias Úteis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.repetir !== 'nao' && (
                      <div className="md:col-span-2">
                        <Label htmlFor="repetir_quantidade" className="text-base font-medium">
                          Quantidade de Repetições
                        </Label>
                        <Input
                          id="repetir_quantidade"
                          type="number"
                          min="1"
                          max="52"
                          value={formData.repetir_quantidade}
                          onChange={(e) => setFormData({ ...formData, repetir_quantidade: e.target.value })}
                          className="h-11"
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {formData.repetir === 'finais_semana' 
                            ? `Criará ${parseInt(formData.repetir_quantidade) * 2} plantões (sábado e domingo)`
                            : `Criará ${formData.repetir_quantidade} plantões`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seção de Pagamento */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Informações de Pagamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status_pagamento" className="text-base font-medium">
                      Status de Pagamento *
                    </Label>
                    <Select
                      value={formData.status_pagamento}
                      onValueChange={(value: any) => setFormData({ ...formData, status_pagamento: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">⏳ Pendente</SelectItem>
                        <SelectItem value="pago">✅ Pago</SelectItem>
                        <SelectItem value="atrasado">❌ Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="forma_pagamento" className="text-base font-medium">
                      Forma de Pagamento
                    </Label>
                    <Select
                      value={formData.forma_pagamento}
                      onValueChange={(value: any) => setFormData({ ...formData, forma_pagamento: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="cartao">Cartão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.status_pagamento === 'pago' && (
                    <div>
                      <Label htmlFor="data_pagamento" className="text-base font-medium">
                        Data do Pagamento
                      </Label>
                      <Input
                        id="data_pagamento"
                        type="date"
                        value={formData.data_pagamento}
                        onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Observações (Opcional)
                </h3>
                <div>
                  <Label htmlFor="observacoes" className="text-base font-medium">
                    Observações Gerais
                  </Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Observações adicionais sobre o plantão..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  size="lg"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : (editingPlantao ? 'Atualizar' : 'Criar')} Plantão
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and View Mode */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar plantões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'lista' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('lista')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'tabela' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('tabela')}
          >
            <TableIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Plantões List */}
      {viewMode === 'lista' && (
        <div className="grid grid-cols-1 gap-4">
          {filteredPlantoes.map((plantao) => (
            <Card key={plantao.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {getInstituicaoNome(plantao)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(plantao.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(plantao.status_pagamento)}>
                          {plantao.status_pagamento}
                        </Badge>
                        {/* Menu de 3 pontinhos */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault()
                                handleEdit(plantao)
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar Plantão
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault()
                                handleDuplicate(plantao)
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault()
                                handleDelete(plantao.id)
                              }}
                              className="text-red-600 focus:text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {plantao.hora_inicio} - {plantao.hora_fim} ({calculateHours(plantao.hora_inicio, plantao.hora_fim)})
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(plantao.valor)}
                      </div>
                      {plantao.forma_pagamento && (
                        <div className="flex items-center gap-1">
                          💳 {plantao.forma_pagamento.toUpperCase()}
                        </div>
                      )}
                    </div>

                    {plantao.observacoes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {plantao.observacoes}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPlantoes.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum plantão encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {demoMode ? 'Explore os dados de exemplo' : 'Comece adicionando seu primeiro plantão'}
                </p>
                {!demoMode && (
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Plantão
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'tabela' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Instituição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Horário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredPlantoes.map((plantao) => (
                    <tr key={plantao.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {format(new Date(plantao.data), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {getInstituicaoNome(plantao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {plantao.hora_inicio} - {plantao.hora_fim}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(plantao.valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(plantao.status_pagamento)}>
                          {plantao.status_pagamento}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault()
                                handleEdit(plantao)
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar Plantão
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault()
                                handleDuplicate(plantao)
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault()
                                handleDelete(plantao.id)
                              }}
                              className="text-red-600 focus:text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button (Mobile) - Ajustado para ficar acima da barra de navegação */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogTrigger asChild>
          <Button
            className="sm:hidden fixed bottom-24 right-6 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 z-40 hover:scale-110 transition-transform"
            size="icon"
          >
            <Plus className="w-7 h-7" />
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  )
}
