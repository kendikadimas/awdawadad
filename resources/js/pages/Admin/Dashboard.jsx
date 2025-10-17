import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Users, Package, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const formatRupiah = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numAmount);
};

export default function AdminDashboard({ stats, recent_users, recent_transactions, revenueTrend }) {
    const statCards = [
        { 
            title: 'Total Users', 
            value: stats.total_users, 
            icon: Users, 
            color: 'bg-blue-500',
            trend: `${stats.general_users} General, ${stats.convection_users} Convection`
        },
        { 
            title: 'Total Motifs', 
            value: stats.total_motifs, 
            icon: Package, 
            color: 'bg-purple-500',
            trend: `${stats.total_designs} Designs created`
        },
        { 
            title: 'Total Transactions', 
            value: stats.total_transactions, 
            icon: ShoppingCart, 
            color: 'bg-green-500',
            trend: `${stats.pending_transactions} Pending`
        },
        { 
            title: 'Total Revenue', 
            value: formatRupiah(stats.total_revenue), 
            icon: DollarSign, 
            color: 'bg-yellow-500',
            trend: 'All time'
        },
    ];

    // Chart data
    const chartData = {
        labels: revenueTrend.map(item => item.date),
        datasets: [
            {
                label: 'Revenue (IDR)',
                data: revenueTrend.map(item => item.total),
                fill: true,
                backgroundColor: 'rgba(186, 104, 42, 0.1)',
                borderColor: '#BA682A',
                tension: 0.4,
                pointBackgroundColor: '#BA682A',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return formatRupiah(context.parsed.y);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return 'Rp ' + (value / 1000) + 'K';
                    }
                }
            }
        }
    };

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />
            
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back, Admin!</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-2">{stat.trend}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Revenue Trend (7 Days)</h2>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div style={{ height: '300px' }}>
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Users</h2>
                        <div className="space-y-4">
                            {recent_users.map(user => (
                                <div key={user.id} className="flex items-center gap-3">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${user.name}&background=BA682A&color=fff`}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        user.role === 'Convection' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {user.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recent_transactions.map(transaction => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{transaction.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{transaction.customer?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{transaction.product?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatRupiah(transaction.total_price)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                transaction.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                transaction.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {transaction.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}