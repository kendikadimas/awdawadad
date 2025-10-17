import { Link, usePage, router } from '@inertiajs/react';
import { LayoutDashboard, Users, Package, DollarSign, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({ children }) {
    const { url } = usePage();
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/admin-dashboard', icon: LayoutDashboard },
        { name: 'Users', href: '/admin-users', icon: Users },
        { name: 'Motifs', href: '/admin-motifs', icon: Package },
        { name: 'Transactions', href: '/admin-transactions', icon: DollarSign },
    ];

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            router.post('/logout');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-30
                w-64 bg-[#BA682A] text-white flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo Section */}
                {/* <div className="p-6 border-b border-[#A0522D] flex items-center justify-between"> */}
                    {/* <div className="flex items-center gap-3">
                        <img 
                            src="/images/LARASENA.png" 
                            alt="Larasena Logo" 
                            className="h-10 w-auto"
                        /> */}
                        {/* <div>
                            <h1 className="text-xl font-bold">Larasena</h1>
                            <p className="text-xs text-[#F8F5F2]">Admin Panel</p>
                        </div> */}
                    {/* </div> */}
                    {/* <button 
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden text-white"
                    > */}
                        {/* <X className="w-6 h-6" />
                    </button>
                </div> */}

                {/* User Info */}
                <div className="px-6 py-4 border-b border-[#A0522D] bg-[#A0522D]/30">
                    <div className="flex items-center gap-3">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${auth.user.name}&background=F8F5F2&color=BA682A`}
                            alt={auth.user.name}
                            className="w-10 h-10 rounded-full border-2 border-white"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{auth.user.name}</p>
                            <p className="text-xs text-[#F8F5F2] truncate">{auth.user.email}</p>
                        </div>
                    </div>
                </div>
                
                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = url === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                                    isActive 
                                        ? 'bg-white text-[#BA682A] shadow-sm' 
                                        : 'text-[#F8F5F2] hover:bg-[#A0522D]/50'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-[#A0522D]">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[#F8F5F2] hover:bg-red-600 rounded-lg transition"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-2">
                        <img 
                            src="/images/logo.png" 
                            alt="Larasena" 
                            className="h-8 w-auto"
                        />
                        <h1 className="text-lg font-bold text-gray-800">Larasena</h1>
                    </div>
                    <button onClick={handleLogout} className="p-2">
                        <LogOut className="w-5 h-5 text-gray-600" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}