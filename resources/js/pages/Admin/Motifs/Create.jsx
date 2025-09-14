import React from 'react';
import { Head, useForm } from '@inertiajs/react';


export default function Create({ flash }) {
    const { data, setData, post, processing, errors, progress } = useForm({
        name: '',
        category: '',
        motif_file: null,
    });

    function submit(e) {
        e.preventDefault();
        post(route('admin.motifs.store'));
    }

    return (
        <div>
            <Head title="Upload Motif" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            
                            {flash?.message && ( // ✨ Cukup tambahkan tanda tanya di sini
                                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
                                    <p>{flash.message}</p>
                                </div>
                            )}

                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Motif</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    />
                                    {errors.name && <div className="text-red-600 mt-1">{errors.name}</div>}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
                                    <input
                                        id="category"
                                        type="text"
                                        value={data.category}
                                        onChange={e => setData('category', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    />
                                    {errors.category && <div className="text-red-600 mt-1">{errors.category}</div>}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="motif_file" className="block text-sm font-medium text-gray-700">File Motif (SVG, PNG, JPG)</label>
                                    <input
                                        id="motif_file"
                                        type="file"
                                        onChange={e => setData('motif_file', e.target.files[0])}
                                        className="mt-1 block w-full"
                                    />
                                    {progress && (
                                        <progress value={progress.percentage} max="100">
                                            {progress.percentage}%
                                        </progress>
                                    )}
                                    {errors.motif_file && <div className="text-red-600 mt-1">{errors.motif_file}</div>}
                                </div>

                                <div className="flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                    >
                                        Upload
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

