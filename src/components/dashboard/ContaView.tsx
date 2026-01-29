'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  UserCircle, 
  Mail, 
  Calendar, 
  Edit, 
  Save,
  X,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface ContaViewProps {
  user: User | null
  profile: Profile | null
  demoMode?: boolean
  onUpdate: () => void
}

export default function ContaView({ user, profile, demoMode = false, onUpdate }: ContaViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nome: demoMode ? 'Dr. João Silva' : profile?.nome || '',
    idade: demoMode ? '35' : profile?.idade?.toString() || '',
    email: demoMode ? 'demo@medbusy.com' : user?.email || '',
    crm: demoMode ? 'CRM/SP 123456' : profile?.crm || '',
  })

  const handleSave = async () => {
    if (demoMode) {
      toast.info('Modo demonstração - alterações não são salvas')
      setIsEditing(false)
      return
    }

    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        nome: formData.nome,
        idade: formData.idade ? parseInt(formData.idade) : null,
        crm: formData.crm,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Erro ao atualizar dados')
      console.error(error)
    } else {
      toast.success('Dados atualizados com sucesso!')
      setIsEditing(false)
      onUpdate()
    }
  }

  const handleCancel = () => {
    setFormData({
      nome: demoMode ? 'Dr. João Silva' : profile?.nome || '',
      idade: demoMode ? '35' : profile?.idade?.toString() || '',
      email: demoMode ? 'demo@medbusy.com' : user?.email || '',
      crm: demoMode ? 'CRM/SP 123456' : profile?.crm || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minha Conta</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie suas informações pessoais
          </p>
        </div>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Digite seu nome completo"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="idade">Idade</Label>
                    <Input
                      id="idade"
                      type="number"
                      value={formData.idade}
                      onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                      placeholder="Digite sua idade"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="mt-1"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      O e-mail não pode ser alterado
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="crm">CRM</Label>
                    <Input
                      id="crm"
                      value={formData.crm}
                      onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                      placeholder="Ex: CRM/SP 123456"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <UserCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {formData.nome || 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Idade</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {formData.idade ? `${formData.idade} anos` : 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">E-mail</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {formData.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">CRM</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {formData.crm || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
