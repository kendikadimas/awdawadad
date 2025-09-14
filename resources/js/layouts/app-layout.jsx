import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout'

const AppLayout = ({ children, breadcrumbs, ...props }) => (
  <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
    {children}
  </AppLayoutTemplate>
)

export default AppLayout

