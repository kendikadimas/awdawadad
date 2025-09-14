import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

const AuthLayout = ({ children, title, description, ...props }) => (
    <AuthLayoutTemplate title={title} description={description} {...props}>
        {children}
    </AuthLayoutTemplate>
);

export default AuthLayout;

