import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Mail, Lock, Sparkles, Users, Factory } from 'lucide-react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex">
            <Head title="Masuk" />

            {/* Background Section - Kiri */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <div 
                    className="w-full bg-cover bg-center bg-no-repeat relative"
                    style={{
                        backgroundImage: "url('/images/bg-auth.png')",
                    }}
                >
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#BA682A]/80 to-[#8B4513]/90"></div>
                    
                    {/* Content overlay */}
                    <div className="relative z-10 flex flex-col justify-center items-center h-full text-white p-12">
                        <div className="max-w-md text-center">
                            <h1 className="text-4xl font-bold mb-6">
                                Larasena
                            </h1>
                            <p className="text-xl mb-8 text-white/90">
                                Bergabunglah dengan komunitas batik digital terdepan di Indonesia
                            </p>
                            
                            {/* Feature Cards */}
                            <div className="space-y-4">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-white">Editor Batik AI</h3>
                                            <p className="text-white/80 text-sm">Buat desain batik dengan teknologi AI</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-white">Kolaborasi Mitra</h3>
                                            <p className="text-white/80 text-sm">Terhubung dengan konveksi terpercaya</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Factory className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-white">Kelola Produksi</h3>
                                            <p className="text-white/80 text-sm">Sistem produksi batik terintegrasi</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section - Kanan */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                   {/* Logo/Brand */}
                    <div className="text-center mb-8">
                        <div className="mb-4">
                            <div className="w-16 h-16 mx-auto mb-4 overflow-hidde">
                                <img 
                                    src="/images/lolares.png" 
                                    alt="Larasena Logo" 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Masuk ke Akun</h2>
                        <p className="text-gray-600">Masukkan kredensial Anda untuk melanjutkan</p>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                            {status}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Alamat Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BA682A] focus:border-transparent transition-all"
                                    placeholder="masukkan@email.com"
                                    autoComplete="username"
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BA682A] focus:border-transparent transition-all"
                                    placeholder="Masukkan kata sandi"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 text-[#BA682A] border-gray-300 rounded focus:ring-[#BA682A] focus:ring-2"
                                />
                                <span className="ml-2 text-sm text-gray-600">Ingat saya</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-[#BA682A] hover:text-[#9d5a24] font-medium transition-colors"
                                >
                                    Lupa kata sandi?
                                </Link>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-[#BA682A] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#9d5a24] focus:outline-none focus:ring-2 focus:ring-[#BA682A] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Memproses...
                                </div>
                            ) : (
                                'Masuk'
                            )}
                        </button>

                        {/* Register Link */}
                        <div className="text-center">
                            <p className="text-gray-600">
                                Belum punya akun?{' '}
                                <Link
                                    href={route('register')}
                                    className="text-[#BA682A] hover:text-[#9d5a24] font-medium transition-colors"
                                >
                                    Daftar sekarang
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}