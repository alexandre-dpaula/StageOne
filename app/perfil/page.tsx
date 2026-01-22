'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { User, Mail, Phone, Upload, Loader2, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchUserData() {
    try {
      const supabase = createClient()
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        router.push('/login?redirect=/perfil')
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError || !userData) {
        setMessage({ type: 'error', text: 'Erro ao carregar dados do usuário' })
        return
      }

      setUser(userData)
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      })
      setAvatarPreview(userData.avatar_url || null)
    } catch (err) {
      console.error('Error fetching user:', err)
      setMessage({ type: 'error', text: 'Erro ao carregar perfil' })
    } finally {
      setLoading(false)
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function uploadAvatar() {
    if (!avatarFile || !user) return null

    try {
      setUploadingAvatar(true)
      const supabase = createClient()
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('Error uploading avatar:', err)
      throw err
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      let avatarUrl = user.avatar_url

      // Upload avatar if changed
      if (avatarFile) {
        avatarUrl = await uploadAvatar()
      }

      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })

      // Refresh user data
      await fetchUserData()
      setAvatarFile(null)
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar perfil' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-placeholder hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Editar Perfil
          </h1>
          <p className="text-placeholder">
            Atualize suas informações pessoais e foto de perfil
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-500'
              : 'bg-red-500/10 border border-red-500/30 text-red-500'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 border border-border/30">
          {/* Avatar Upload */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-foreground mb-4">
              Foto de Perfil
            </label>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar"
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-primary/30 object-cover"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-full bg-primary/10 border-4 border-primary/30 flex items-center justify-center">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-all font-medium text-sm">
                  <Upload className="w-4 h-4" />
                  Escolher Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-placeholder mt-2">
                  JPG, PNG ou GIF (máx. 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-bold text-foreground mb-2">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-placeholder" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 glass rounded-xl border border-border/30 text-foreground placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Seu nome completo"
                required
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-placeholder" />
              <input
                type="email"
                id="email"
                value={formData.email}
                className="w-full pl-12 pr-4 py-3 glass rounded-xl border border-border/30 text-placeholder bg-card cursor-not-allowed"
                disabled
              />
            </div>
            <p className="text-xs text-placeholder mt-2">
              O email não pode ser alterado
            </p>
          </div>

          {/* Phone */}
          <div className="mb-8">
            <label htmlFor="phone" className="block text-sm font-bold text-foreground mb-2">
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-placeholder" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-12 pr-4 py-3 glass rounded-xl border border-border/30 text-foreground placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/"
              className="px-6 py-3 text-placeholder hover:text-foreground transition-colors font-medium"
            >
              Cancelar
            </Link>
            <Button
              type="submit"
              disabled={saving || uploadingAvatar}
              className="min-w-[150px]"
            >
              {saving || uploadingAvatar ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
