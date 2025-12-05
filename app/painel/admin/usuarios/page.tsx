import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'

export default async function UsuariosAdminPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase.from('users').select('*').eq('id', authUser.id).single()

  if (!user || user.role !== 'ADMIN') redirect('/')

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  const totalUsers = users?.length || 0
  const admins = users?.filter(u => u.role === 'ADMIN').length || 0
  const palestrantes = users?.filter(u => u.role === 'PALESTRANTE').length || 0
  const participantes = users?.filter(u => u.role === 'PARTICIPANTE').length || 0

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/painel/admin" className="text-xl font-bold text-primary">
              ← Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Gerenciar Usuários</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6">
            <p className="text-placeholder text-sm">Total de Usuários</p>
            <p className="text-4xl font-bold text-foreground mt-2">{totalUsers}</p>
          </div>
          <div className="bg-card rounded-lg p-6">
            <p className="text-placeholder text-sm">Admins</p>
            <p className="text-4xl font-bold text-primary mt-2">{admins}</p>
          </div>
          <div className="bg-card rounded-lg p-6">
            <p className="text-placeholder text-sm">Palestrantes</p>
            <p className="text-4xl font-bold text-blue-500 mt-2">{palestrantes}</p>
          </div>
          <div className="bg-card rounded-lg p-6">
            <p className="text-placeholder text-sm">Participantes</p>
            <p className="text-4xl font-bold text-green-500 mt-2">{participantes}</p>
          </div>
        </div>

        {/* Users Table */}
        {users && users.length > 0 ? (
          <div className="bg-card rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-card">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-placeholder uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-placeholder uppercase tracking-wider">
                      E-mail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-placeholder uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-placeholder uppercase tracking-wider">
                      Cadastro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-card/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.name}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-foreground font-bold mr-3">
                              {u.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <span className="text-foreground font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-foreground">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            u.role === 'ADMIN'
                              ? 'bg-primary/20 text-primary'
                              : u.role === 'PALESTRANTE'
                              ? 'bg-blue-500/20 text-blue-500'
                              : 'bg-green-500/20 text-green-500'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-placeholder text-sm">
                        {formatDateTime(u.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg p-12 text-center">
            <p className="text-placeholder">Nenhum usuário encontrado</p>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500 rounded-lg p-6">
          <h3 className="text-blue-400 font-bold mb-2">ℹ️ Gerenciamento de Roles</h3>
          <p className="text-blue-300 text-sm mb-2">
            Para alterar o role de um usuário, use o SQL Editor do Supabase:
          </p>
          <div className="bg-background/30 rounded p-4 mt-2">
            <code className="text-foreground text-sm">
              UPDATE public.users SET role = 'PALESTRANTE' WHERE id = 'user-id-aqui';
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
