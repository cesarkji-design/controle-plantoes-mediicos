import { supabase } from './supabase'

export interface UserSubscription {
  id: string
  user_id: string
  plan_type: 'free_trial' | 'semanal' | 'mensal' | 'anual'
  status: 'active' | 'expired' | 'cancelled'
  trial_start_date?: string
  trial_end_date?: string
  subscription_start_date?: string
  subscription_end_date?: string
  payment_link?: string
  created_at: string
  updated_at: string
}

// Verificar se usuário tem trial ativo ou assinatura válida
export async function checkUserSubscription(userId: string): Promise<{
  hasAccess: boolean
  subscription: UserSubscription | null
  daysRemaining: number
  isTrialExpired: boolean
}> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar assinatura:', error)
      return { hasAccess: false, subscription: null, daysRemaining: 0, isTrialExpired: false }
    }

    // Se não tem registro, criar trial de 7 dias
    if (!data) {
      const trialStartDate = new Date()
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 7)

      // Usar upsert para evitar erro de duplicação
      const { data: newSubscription, error: insertError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          plan_type: 'free_trial',
          status: 'active',
          trial_start_date: trialStartDate.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (insertError) {
        console.error('Erro ao criar trial:', insertError)
        
        // Se ainda assim falhar, tentar buscar o registro existente
        const { data: existingData } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (existingData) {
          // Retornar o registro existente
          const now = new Date()
          const endDate = existingData.trial_end_date ? new Date(existingData.trial_end_date) : null
          const daysRemaining = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
          
          return {
            hasAccess: existingData.status === 'active' && daysRemaining > 0,
            subscription: existingData,
            daysRemaining: Math.max(0, daysRemaining),
            isTrialExpired: daysRemaining <= 0,
          }
        }
        
        return { hasAccess: false, subscription: null, daysRemaining: 0, isTrialExpired: false }
      }

      return {
        hasAccess: true,
        subscription: newSubscription,
        daysRemaining: 7,
        isTrialExpired: false,
      }
    }

    // Verificar se trial expirou
    if (data.plan_type === 'free_trial' && data.trial_end_date) {
      const now = new Date()
      const endDate = new Date(data.trial_end_date)
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysRemaining <= 0) {
        // Trial expirado - atualizar status
        await supabase
          .from('user_subscriptions')
          .update({ status: 'expired' })
          .eq('user_id', userId)

        return {
          hasAccess: false,
          subscription: { ...data, status: 'expired' },
          daysRemaining: 0,
          isTrialExpired: true,
        }
      }

      return {
        hasAccess: true,
        subscription: data,
        daysRemaining,
        isTrialExpired: false,
      }
    }

    // Verificar se assinatura paga está ativa
    if (data.subscription_end_date) {
      const now = new Date()
      const endDate = new Date(data.subscription_end_date)
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysRemaining <= 0) {
        // Assinatura expirada
        await supabase
          .from('user_subscriptions')
          .update({ status: 'expired' })
          .eq('user_id', userId)

        return {
          hasAccess: false,
          subscription: { ...data, status: 'expired' },
          daysRemaining: 0,
          isTrialExpired: false,
        }
      }

      return {
        hasAccess: true,
        subscription: data,
        daysRemaining,
        isTrialExpired: false,
      }
    }

    return {
      hasAccess: data.status === 'active',
      subscription: data,
      daysRemaining: 0,
      isTrialExpired: false,
    }
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error)
    return { hasAccess: false, subscription: null, daysRemaining: 0, isTrialExpired: false }
  }
}

// Atualizar assinatura quando usuário escolher um plano
export async function updateSubscriptionPlan(
  userId: string,
  planType: 'semanal' | 'mensal' | 'anual',
  paymentLink: string
): Promise<boolean> {
  try {
    const startDate = new Date()
    const endDate = new Date()

    // Calcular data de término baseado no plano
    switch (planType) {
      case 'semanal':
        endDate.setDate(endDate.getDate() + 7)
        break
      case 'mensal':
        endDate.setMonth(endDate.getMonth() + 1)
        break
      case 'anual':
        endDate.setFullYear(endDate.getFullYear() + 1)
        break
    }

    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        plan_type: planType,
        status: 'active',
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
        payment_link: paymentLink,
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao atualizar assinatura:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error)
    return false
  }
}
