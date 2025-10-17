import { Link, usePage } from '@inertiajs/react';
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
                <div className="p-6 border-b border-[#A0522D] flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Larasena Admin</h1>
                        <p className="text-sm text-[#F8F5F2] mt-1">{auth.user.name}</p>
                    </div>
                    <button 
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = url === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                                    isActive 
                                        ? 'bg-[#A0522D] text-white' 
                                        : 'text-[#F8F5F2] hover:bg-[#A0522D]/50'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[#A0522D]">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-[#F8F5F2] hover:bg-[#A0522D]/50 rounded-lg transition"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Ke Dashboard User</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-800">Larasena Admin</h1>
                    <div className="w-6" /> {/* Spacer */}
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}