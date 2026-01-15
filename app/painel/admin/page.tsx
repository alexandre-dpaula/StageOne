import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  // Redirecionar para o painel unificado
  redirect('/painel/palestrante')
}
