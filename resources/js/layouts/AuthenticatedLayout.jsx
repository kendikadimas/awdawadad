import React from 'react';

export default function AuthenticatedLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-4 font-bold text-lg border-b">
                    My App
                </div>
                <nav className="p-4 space-y-2">
                    <a href="/dashboard" className="block text-gray-700 hover:text-blue-500">Dashboard</a>
                    <a href="#" className="block text-gray-700 hover:text-blue-500">Settings</a>
                </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 flex flex-col">
                {/* Navbar */}
                <header className="bg-white shadow p-4">
                    <h1 className="text-xl font-semibold">Dashboard</h1>
                </header>

                {/* Main */}
                <main className="p-4">
                    {children}
                </main>
            </div>
        </div>
    );
}
