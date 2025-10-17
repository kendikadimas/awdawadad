import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Search, DollarSign, TrendingUp, ShoppingCart, Clock } from 'lucide-react';
import { useState } from 'react';
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

const ProductionStatusBadge = ({ status }) => {
    const statusMap = {
        'pending': { text: 'Pending', color: 'bg-gray-100 text-gray-700' },
        'diproses': { text: 'Processing', color: 'bg-blue-100 text-blue-700' },
        'dikirim': { text: 'Shipped', color: 'bg-purple-100 text-purple-700' },
        'diterima_selesai': { text: 'Completed', color: 'bg-green-100 text-green-700' },
        'ditolak': { text: 'Rejected', color: 'bg-red-100 text-red-700' },
    };
    const { text, color } = statusMap[status] || statusMap['pending'];
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>{text}</span>;
};

const PaymentStatusBadge = ({ status }) => {
    const statusMap = {
        'paid': { text: 'Paid', color: 'bg-green-100 text-green-700' },
        'pending': { text: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
        'failed': { text: 'Failed', color: 'bg-red-100 text-red-700' },
    };
    const { text, color } = statusMap[status] || statusMap['pending'];
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>{text}</span>;
};

const Pagination = ({ links }) => {
    if (!links || links.length === 0) return null;
    
    return (
        <div className="flex items-center justify-center mt-6">
            {links.map((link, index) => {
                if (!link.url) {
                    return (
                        <div
                            key={index}
                            className="px-4 py-2 mx-1 text-sm rounded-md text-gray-400"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }
                return (
                    <Link
                        key={index}
                        href={link.url}
                        className={`px-4 py-2 mx-1 text-sm rounded-md transition-colors ${
                            link.active ? 'bg-[#BA682A] text-white' : 'bg-white hover:bg-gray-100'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
};

export default function AdminTransactions({ transactions, stats, revenueChart, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(filters?.payment_status || 'all');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin-transactions', { 
            search, 
            status: selectedStatus,
            payment_status: selectedPaymentStatus 
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        router.get('/admin-transactions', { 
            search, 
            status,
            payment_status: selectedPaymentStatus 
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePaymentStatusFilter = (paymentStatus) => {
        setSelectedPaymentStatus(paymentStatus);
        router.get('/admin-transactions', { 
            search, 
            status: selectedStatus,
            payment_status: paymentStatus 
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Chart data
    const chartData = {
        labels: revenueChart.map(item => item.month),
        datasets: [
            {
                label: 'Revenue (IDR)',
                data: revenueChart.map(item => item.total),
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
                        return 'Rp ' + (value / 1000000) + 'M';
                    }
                }
            }
        }
    };

    return (
        <AdminLayout>
            <Head title="Manage Transactions" />
            
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Transaction Management</h1>
                    <p className="text-gray-600 mt-1">Monitor and manage all transactions</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Total Transactions</p>
                            <ShoppingCart className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{stats.total_transactions}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{formatRupiah(stats.total_revenue)}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Pending Payment</p>
                            <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pending_payment}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Completed Orders</p>
                            <TrendingUp className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-bold text-green-600">{stats.completed_orders}</p>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend (6 Months)</h2>
                    <div style={{ height: '300px' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by ID or customer..."
                                className="pl-10 pr-4 py-2 border rounded-lg w-full"
                            />
                        </form>
                        
                        <div className="flex gap-2 flex-wrap">
                            <select
                                value={selectedStatus}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="diproses">Processing</option>
                                <option value="dikirim">Shipped</option>
                                <option value="diterima_selesai">Completed</option>
                                <option value="ditolak">Rejected</option>
                            </select>

                            <select
                                value={selectedPaymentStatus}
                                onChange={(e) => handlePaymentStatusFilter(e.target.value)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                <option value="all">All Payment</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Convection</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {transactions?.data && transactions.data.length > 0 ? (
                                    transactions.data.map(transaction => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">#{transaction.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{transaction.customer?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{transaction.convection?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{transaction.product?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{transaction.quantity || 0}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatRupiah(transaction.total_price)}</td>
                                            <td className="px-6 py-4">
                                                <ProductionStatusBadge status={transaction.production_status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <PaymentStatusBadge status={transaction.payment_status} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                                            No transactions found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {transactions?.links && <Pagination links={transactions.links} />}
                </div>
            </div>
        </AdminLayout>
    );
}