import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const path = formData.get('path') as string

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tamanho do arquivo (1MB)
    if (file.size > 1048576) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo: 1MB' }, { status: 400 })
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    // Converter File para ArrayBuffer e depois para Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('event-images')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Erro no upload:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Obter URL pública da imagem
    const { data: publicUrlData } = supabase.storage
      .from('event-images')
      .getPublicUrl(path)

    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao fazer upload:', error)
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 })
  }
}
