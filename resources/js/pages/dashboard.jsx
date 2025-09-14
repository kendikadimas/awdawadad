import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <div className="text-gray-800">
                <h2 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h2>
                <p>This is your dashboard content.</p>
            </div>
        </AuthenticatedLayout>
    );
}
