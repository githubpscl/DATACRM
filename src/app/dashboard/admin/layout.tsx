import SuperAdminGuard from '@/components/admin/super-admin-guard'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SuperAdminGuard>
      {children}
    </SuperAdminGuard>
  )
}
