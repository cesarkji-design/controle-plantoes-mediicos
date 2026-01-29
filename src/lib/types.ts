export interface Profile {
  id: string
  nome: string
  email: string
  idade?: number
  crm?: string
  plano: 'free' | 'semanal' | 'mensal' | 'anual'
  plano_expira_em?: string
  created_at: string
  updated_at: string
}

export interface Instituicao {
  id: string
  user_id: string
  nome: string
  endereco?: string
  telefone?: string
  email?: string
  observacoes?: string
  cor: string
  created_at: string
  updated_at: string
}

export interface Plantao {
  id: string
  user_id: string
  instituicao_id?: string
  data: string
  hora_inicio: string
  hora_fim: string
  valor: number
  status_pagamento: 'pendente' | 'pago' | 'atrasado'
  forma_pagamento?: 'pix' | 'transferencia' | 'dinheiro' | 'cartao'
  data_pagamento?: string
  observacoes?: string
  created_at: string
  updated_at: string
  instituicao?: Instituicao
}

// Tipos legados mantidos para compatibilidade com componentes existentes
export type PlantaoStatus = 'confirmado' | 'realizado' | 'cancelado' | 'pago' | 'pendente'
export type PlantaoTipo = 'porta' | 'uti' | 'enfermaria' | 'sobreaviso' | 'personalizado'
export type ViewMode = 'lista' | 'tabela' | 'calendario'
