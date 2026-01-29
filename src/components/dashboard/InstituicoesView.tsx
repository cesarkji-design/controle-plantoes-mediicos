'use client'

import { useState } from 'react'
import { Instituicao } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Building2, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface InstituicoesViewProps {
  instituicoes: Instituicao[]
  onUpdate: () => void
  demoMode?: boolean
  userId: string
}

export default function InstituicoesView({ instituicoes, onUpdate, demoMode = false, userId }: InstituicoesViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInstituicao, setEditingInstituicao] = useState<Instituicao | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    email: '',
    observacoes: '',
    cor: '#3B82F6'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (demoMode) {
      toast.info('Modo demonstração - alterações não são salvas')
      setIsDialogOpen(false)
      return
    }

    const instituicaoData = {
      ...formData,
      user_id: userId
    }

    if (editingInstituicao) {
      const { error } = await supabase
        .from('instituicoes')
        .update(instituicaoData)
        .eq('id', editingInstituicao.id)

      if (error) {
        toast.error('Erro ao atualizar instituição')
        console.error(error)
        return
      }
      toast.success('Instituição atualizada com sucesso!')
    } else {
      const { error } = await supabase
        .from('instituicoes')
        .insert([instituicaoData])

      if (error) {
        toast.error('Erro ao criar instituição')
        console.error(error)
        return
      }
      toast.success('Instituição criada com sucesso!')
    }

    setIsDialogOpen(false)
    resetForm()
    onUpdate()
  }

  const handleEdit = (instituicao: Instituicao) => {
    if (demoMode) {
      toast.info('Modo demonstração - visualização apenas')
      return
    }

    setEditingInstituicao(instituicao)
    setFormData({
      nome: instituicao.nome,
      endereco: instituicao.endereco || '',
      telefone: instituicao.telefone || '',
      email: instituicao.email || '',
      observacoes: instituicao.observacoes || '',
      cor: instituicao.cor || '#3B82F6'
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    console.log('🗑️ [INÍCIO] Tentando excluir instituição:', id)
    
    if (demoMode) {
      toast.info('Modo demonstração - alterações não são salvas')
      return
    }

    // Confirmação ANTES de qualquer operação
    const confirmacao = window.confirm(
      '⚠️ TEM CERTEZA QUE DESEJA EXCLUIR ESTA INSTITUIÇÃO?\n\n' +
      'Esta ação NÃO PODE ser desfeita.\n' +
      'A instituição será removida permanentemente.\n\n' +
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
        .from('instituicoes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()

      if (error) {
        console.error('❌ [ERRO SUPABASE]', error)
        toast.error(`Erro ao excluir: ${error.message}`)
        return
      }

      console.log('✅ [SUCESSO SUPABASE] Instituição excluída:', data)
      
      // Notificar sucesso
      toast.success('✅ Instituição excluída com sucesso!')
      
      // Recarregar dados para atualizar Dashboard
      console.log('🔄 [ATUALIZANDO] Recarregando dados do Dashboard...')
      await onUpdate()
      console.log('✅ [COMPLETO] Dados atualizados! Dashboard sincronizado.')
      
    } catch (error) {
      console.error('💥 [ERRO CRÍTICO]', error)
      toast.error('Erro crítico ao excluir instituição')
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      endereco: '',
      telefone: '',
      email: '',
      observacoes: '',
      cor: '#3B82F6'
    })
    setEditingInstituicao(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Instituições</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie hospitais e clínicas
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Instituição
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingInstituicao ? 'Editar Instituição' : 'Cadastrar Nova Instituição'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Informações Básicas
                </h3>
                
                <div>
                  <Label htmlFor="nome" className="text-base">Nome da Instituição *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Hospital São Lucas"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="endereco" className="text-base">Endereço Completo</Label>
                  <Input
                    id="endereco"
                    placeholder="Rua, número, bairro, cidade - CEP"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone" className="text-base">Telefone</Label>
                    <Input
                      id="telefone"
                      placeholder="(11) 98765-4321"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-base">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contato@hospital.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cor" className="text-base">Cor de Identificação</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="cor"
                      type="color"
                      value={formData.cor}
                      onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                      className="w-20 h-11"
                    />
                    <Input
                      value={formData.cor}
                      onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                      placeholder="#3B82F6"
                      className="flex-1 h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <Label htmlFor="observacoes" className="text-base">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informações adicionais sobre a instituição..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={3}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} size="lg">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                  size="lg"
                >
                  {editingInstituicao ? 'Atualizar' : 'Cadastrar'} Instituição
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Botão Flutuante Mobile - Ajustado para ficar acima da barra de navegação */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="lg:hidden fixed bottom-24 right-6 z-40 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 hover:scale-110 transition-all"
          >
            <Plus className="w-7 h-7" />
          </Button>
        </DialogTrigger>
      </Dialog>

      {/* Instituições Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instituicoes.map((instituicao) => (
          <Card key={instituicao.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${instituicao.cor}20` }}
                  >
                    <Building2 
                      className="w-5 h-5" 
                      style={{ color: instituicao.cor }}
                    />
                  </div>
                  <CardTitle className="text-lg">{instituicao.nome}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {instituicao.endereco && (
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{instituicao.endereco}</span>
                </div>
              )}

              {instituicao.telefone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{instituicao.telefone}</span>
                </div>
              )}

              {instituicao.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>{instituicao.email}</span>
                </div>
              )}

              {instituicao.observacoes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {instituicao.observacoes}
                </p>
              )}

              {!demoMode && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(instituicao)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(instituicao.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {instituicoes.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma instituição cadastrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {demoMode ? 'Explore os dados de exemplo' : 'Comece adicionando sua primeira instituição'}
              </p>
              {!demoMode && (
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeira Instituição
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
