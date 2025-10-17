import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Image, Filter } from 'lucide-react';
import { useState } from 'react';

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

export default function AdminMotifs({ motifs, categories, stats, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters?.category || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
    const [showModal, setShowModal] = useState(false);
    const [editingMotif, setEditingMotif] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        category: '',
        file: null,
        is_active: true,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin-motifs', { 
            search, 
            category: selectedCategory,
            status: selectedStatus 
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCategoryFilter = (category) => {
        setSelectedCategory(category);
        router.get('/admin-motifs', { 
            search, 
            category,
            status: selectedStatus 
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        router.get('/admin-motifs', { 
            search, 
            category: selectedCategory,
            status 
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const openCreateModal = () => {
        reset();
        setEditingMotif(null);
        setPreviewImage(null);
        setShowModal(true);
    };

    const openEditModal = (motif) => {
        setData({
            name: motif.name,
            description: motif.description || '',
            category: motif.category,
            file: null,
            is_active: motif.is_active,
        });
        setEditingMotif(motif);
        setPreviewImage(motif.image_url);
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('file', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('is_active', data.is_active ? '1' : '0');
        if (data.file) {
            formData.append('file', data.file);
        }

        if (editingMotif) {
            formData.append('_method', 'PUT');
            router.post(`/admin-motifs/${editingMotif.id}`, formData, {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                    setPreviewImage(null);
                }
            });
        } else {
            router.post('/admin-motifs', formData, {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                    setPreviewImage(null);
                }
            });
        }
    };

    const handleToggleStatus = (motifId) => {
        router.put(`/admin-motifs/${motifId}/toggle-status`);
    };

    const handleDelete = (motifId) => {
        if (confirm('Are you sure you want to delete this motif?')) {
            router.delete(`/admin-motifs/${motifId}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Manage Motifs" />
            
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Motif Management</h1>
                        <p className="text-gray-600 mt-1">Manage batik motifs library</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-[#BA682A] text-white px-4 py-2 rounded-lg hover:bg-[#A0522D] transition"
                    >
                        <Plus className="w-5 h-5" />
                        Add Motif
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <p className="text-sm text-gray-600">Total Motifs</p>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total_motifs}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <p className="text-sm text-gray-600">Active Motifs</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">{stats.active_motifs}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <p className="text-sm text-gray-600">Inactive Motifs</p>
                        <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactive_motifs}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <p className="text-sm text-gray-600">Categories</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total_categories}</p>
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
                                placeholder="Search motifs..."
                                className="pl-10 pr-4 py-2 border rounded-lg w-full"
                            />
                        </form>
                        
                        <div className="flex gap-2 flex-wrap">
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryFilter(e.target.value)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                <option value="all">All Status</option>
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Motifs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {motifs?.data && motifs.data.length > 0 ? (
                        motifs.data.map(motif => (
                            <div key={motif.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group">
                                <div className="relative aspect-square bg-gray-100">
                                    <img 
                                        src={motif.image_url || 'https://via.placeholder.com/300'} 
                                        alt={motif.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={() => openEditModal(motif)}
                                            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition"
                                        >
                                            <Edit className="w-4 h-4 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(motif.id)}
                                            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition"
                                        >
                                            {motif.is_active ? (
                                                <EyeOff className="w-4 h-4 text-gray-700" />
                                            ) : (
                                                <Eye className="w-4 h-4 text-gray-700" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(motif.id)}
                                            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                    
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            motif.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                                        }`}>
                                            {motif.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 mb-1 truncate">{motif.name}</h3>
                                    <p className="text-xs text-gray-500 mb-2">{motif.category}</p>
                                    {motif.description && (
                                        <p className="text-xs text-gray-600 line-clamp-2">{motif.description}</p>
                                    )}
                                    {motif.user && (
                                        <p className="text-xs text-gray-400 mt-2">By: {motif.user.name}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No motifs found</p>
                        </div>
                    )}
                </div>

                {motifs?.links && <Pagination links={motifs.links} />}
            </div>

            {/* Modal Create/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {editingMotif ? 'Edit Motif' : 'Create New Motif'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <input
                                        type="text"
                                        value={data.category}
                                        onChange={e => setData('category', e.target.value)}
                                        placeholder="e.g., Geometric, Floral"
                                        className="w-full px-3 py-2 border rounded-lg"
                                        required
                                    />
                                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Optional description..."
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image {!editingMotif && '*'}
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required={!editingMotif}
                                />
                                {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
                                <p className="text-xs text-gray-500 mt-1">Max 5MB. Formats: JPG, PNG, GIF, SVG</p>
                            </div>

                            {previewImage && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                                    <img 
                                        src={previewImage} 
                                        alt="Preview" 
                                        className="w-full h-48 object-cover rounded-lg border"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="rounded"
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-700">
                                    Active (visible to users)
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setPreviewImage(null);
                                    }}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-4 py-2 bg-[#BA682A] text-white rounded-lg hover:bg-[#A0522D] transition disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Motif'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}