'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Coupon, CreateCouponFormData } from '@/types/database.types'
import Link from 'next/link'

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<CreateCouponFormData>({
    code: '',
    discount_type: 'PERCENTAGE',
    discount_value: 0,
    valid_from: new Date().toISOString().split('T')[0],
    usage_limit_per_user: 1,
  })

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    try {
      const response = await fetch('/api/coupons')
      const data = await response.json()
      setCoupons(data.coupons || [])
    } catch (error) {
      console.error('Error loading coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Cupom criado com sucesso!')
        setShowForm(false)
        setFormData({
          code: '',
          discount_type: 'PERCENTAGE',
          discount_value: 0,
          valid_from: new Date().toISOString().split('T')[0],
          usage_limit_per_user: 1,
        })
        loadCoupons()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao criar cupom')
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
      alert('Erro ao criar cupom')
    }
  }

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', couponId)

      if (error) throw error

      loadCoupons()
    } catch (error) {
      console.error('Error toggling coupon:', error)
      alert('Erro ao atualizar cupom')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/painel/admin" className="text-2xl text-primary hover:text-glow transition-all">
              <span className="font-bold">St</span>
              <sup className="text-[0.5em] top-[-0.3em] relative ml-0.5">™</sup>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Gerenciar Cupons</h1>
            <Link href="/painel/admin" className="text-sm text-placeholder hover:text-primary transition-colors">
              Voltar
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Cupons de Desconto</h2>
            <p className="text-placeholder">Crie e gerencie cupons promocionais</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary px-6 py-3"
          >
            {showForm ? 'Cancelar' : '+ Novo Cupom'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass rounded-2xl p-6 mb-8 border border-border/30">
            <h3 className="text-xl font-bold text-foreground mb-6">Criar Novo Cupom</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Código */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Código do Cupom *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: PROMO10, BLACKFRIDAY"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Tipo de Desconto */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tipo de Desconto *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="PERCENTAGE">Porcentagem (%)</option>
                    <option value="FIXED_AMOUNT">Valor Fixo (R$)</option>
                  </select>
                </div>

                {/* Valor do Desconto */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Valor do Desconto *
                  </label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                    placeholder={formData.discount_type === 'PERCENTAGE' ? '10' : '50'}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-placeholder mt-1">
                    {formData.discount_type === 'PERCENTAGE' ? 'Ex: 10 = 10% de desconto' : 'Ex: 50 = R$ 50 de desconto'}
                  </p>
                </div>

                {/* Desconto Máximo (para %) */}
                {formData.discount_type === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Desconto Máximo (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.max_discount_amount || ''}
                      onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="Opcional"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-placeholder mt-1">Ex: 100 = desconto máximo de R$ 100</p>
                  </div>
                )}

                {/* Data Início */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Válido a partir de *
                  </label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Data Fim */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Válido até
                  </label>
                  <input
                    type="date"
                    value={formData.valid_until || ''}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value || undefined })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-placeholder mt-1">Deixe em branco para sem data de expiração</p>
                </div>

                {/* Limite de Uso Total */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Limite de Uso Total
                  </label>
                  <input
                    type="number"
                    value={formData.usage_limit || ''}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Ilimitado"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="1"
                  />
                  <p className="text-xs text-placeholder mt-1">Deixe em branco para ilimitado</p>
                </div>

                {/* Limite por Usuário */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Limite por Usuário *
                  </label>
                  <input
                    type="number"
                    value={formData.usage_limit_per_user}
                    onChange={(e) => setFormData({ ...formData, usage_limit_per_user: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    min="1"
                  />
                </div>

                {/* Valor Mínimo */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Valor Mínimo de Compra (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.minimum_purchase_amount || ''}
                    onChange={(e) => setFormData({ ...formData, minimum_purchase_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Sem mínimo"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Tracking Source */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Origem do Cupom
                  </label>
                  <input
                    type="text"
                    value={formData.tracking_source || ''}
                    onChange={(e) => setFormData({ ...formData, tracking_source: e.target.value })}
                    placeholder="Ex: instagram, email_campaign, afiliado_joao"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição interna do cupom"
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <button type="submit" className="btn-primary w-full py-3">
                Criar Cupom
              </button>
            </form>
          </div>
        )}

        {/* Lista de Cupons */}
        {coupons.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-border/30">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-foreground font-medium mb-2">Nenhum cupom criado ainda</p>
            <p className="text-placeholder text-sm">Clique em &ldquo;Novo Cupom&rdquo; para criar seu primeiro cupom de desconto</p>
          </div>
        ) : (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="glass rounded-2xl p-6 border border-border/30 hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-primary font-mono">{coupon.code}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        coupon.is_active
                          ? 'bg-primary/10 text-primary border border-primary/30'
                          : 'bg-placeholder/10 text-placeholder border border-placeholder/30'
                      }`}>
                        {coupon.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent-blue/10 text-accent-blue border border-accent-blue/30">
                        {coupon.discount_type === 'PERCENTAGE'
                          ? `${coupon.discount_value}% OFF`
                          : `R$ ${coupon.discount_value.toFixed(2)} OFF`}
                      </span>
                    </div>

                    {coupon.description && (
                      <p className="text-placeholder text-sm mb-4">{coupon.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-placeholder mb-1">Usado</p>
                        <p className="text-foreground font-bold">
                          {coupon.usage_count}
                          {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-placeholder mb-1">Validade</p>
                        <p className="text-foreground font-bold">
                          {coupon.valid_until
                            ? new Date(coupon.valid_until).toLocaleDateString('pt-BR')
                            : 'Sem expiração'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-placeholder mb-1">Por Usuário</p>
                        <p className="text-foreground font-bold">{coupon.usage_limit_per_user || 'Ilimitado'}</p>
                      </div>
                      {coupon.tracking_source && (
                        <div>
                          <p className="text-placeholder mb-1">Origem</p>
                          <p className="text-foreground font-bold">{coupon.tracking_source}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                    className={`ml-4 px-4 py-2 rounded-lg font-medium transition-all ${
                      coupon.is_active
                        ? 'bg-placeholder/10 text-placeholder hover:bg-placeholder/20'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {coupon.is_active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
