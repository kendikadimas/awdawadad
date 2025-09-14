import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Mail, Lock, User, Users, Briefcase, Sparkles, Palette, TrendingUp } from 'lucide-react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'General',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen flex">
            <Head title="Daftar" />

            {/* Form Section - Kiri */}
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
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Buat Akun Baru</h2>
                        <p className="text-gray-600">Bergabung dengan komunitas batik digital Indonesia</p>
                    </div>

                    {/* Register Form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BA682A] focus:border-transparent transition-all"
                                    placeholder="Masukkan nama lengkap"
                                    autoComplete="name"
                                    required
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

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

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Daftar Sebagai
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                    data.role === 'General' 
                                        ? 'border-[#BA682A] bg-[#BA682A]/5' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="General"
                                        checked={data.role === 'General'}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center gap-3">
                                        <Users className={`w-5 h-5 ${
                                            data.role === 'General' ? 'text-[#BA682A]' : 'text-gray-400'
                                        }`} />
                                        <div>
                                            <div className={`font-medium text-sm ${
                                                data.role === 'General' ? 'text-[#BA682A]' : 'text-gray-700'
                                            }`}>
                                                Pengguna
                                            </div>
                                            <div className="text-xs text-gray-500">Biasa</div>
                                        </div>
                                    </div>
                                </label>

                                <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                    data.role === 'Convection' 
                                        ? 'border-[#BA682A] bg-[#BA682A]/5' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="Convection"
                                        checked={data.role === 'Convection'}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center gap-3">
                                        <Briefcase className={`w-5 h-5 ${
                                            data.role === 'Convection' ? 'text-[#BA682A]' : 'text-gray-400'
                                        }`} />
                                        <div>
                                            <div className={`font-medium text-sm ${
                                                data.role === 'Convection' ? 'text-[#BA682A]' : 'text-gray-700'
                                            }`}>
                                                Mitra
                                            </div>
                                            <div className="text-xs text-gray-500">Konveksi</div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            {errors.role && (
                                <p className="mt-2 text-sm text-red-600">{errors.role}</p>
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
                                    autoComplete="new-password"
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

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                Konfirmasi Kata Sandi
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BA682A] focus:border-transparent transition-all"
                                    placeholder="Konfirmasi kata sandi"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-2 text-sm text-red-600">{errors.password_confirmation}</p>
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
                                'Buat Akun'
                            )}
                        </button>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-gray-600">
                                Sudah punya akun?{' '}
                                <Link
                                    href={route('login')}
                                    className="text-[#BA682A] hover:text-[#9d5a24] font-medium transition-colors"
                                >
                                    Masuk di sini
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Background Section - Kanan */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <div 
                    className="w-full bg-cover bg-center bg-no-repeat relative"
                    style={{
                        backgroundImage: "url('/images/bg-auth.png')",
                    }}
                >
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-bl from-[#BA682A]/80 to-[#8B4513]/90"></div>
                    
                    {/* Content overlay */}
                    <div className="relative z-10 flex flex-col justify-center items-center h-full text-white p-12">
                        <div className="max-w-md text-center">
                            <h1 className="text-4xl font-bold mb-6">
                                Larasena
                            </h1>
                            <p className="text-xl mb-8 text-white/90">
                                Bergabung dengan komunitas kreatif yang mengembangkan warisan budaya batik Indonesia
                            </p>
                            
                            {/* Feature Cards */}
                            <div className="space-y-4">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Palette className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-white">Editor AI Batik</h3>
                                            <p className="text-white/80 text-sm">Desain batik dengan teknologi AI terdepan</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-white">Marketplace Konveksi</h3>
                                            <p className="text-white/80 text-sm">Jaringan konveksi terpercaya se-Indonesia</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-white">Sistem Produksi</h3>
                                            <p className="text-white/80 text-sm">Manajemen produksi batik terintegrasi</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}