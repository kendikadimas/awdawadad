<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  // Menerima satu atau lebih peran
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Jika pengguna tidak login atau tidak punya peran, tolak akses.
        if (!Auth::check() || !Auth::user()->role) {
            abort(403, 'AKSI TIDAK DIIZINKAN.');
        }

        // Ambil peran pengguna yang sedang login
        $userRole = Auth::user()->role;

        // Cek apakah peran pengguna ada di dalam daftar peran yang diizinkan
        if (in_array($userRole, $roles)) {
            // Jika cocok, lanjutkan request
            return $next($request);
        }

        // Jika tidak cocok, tolak akses
        abort(403, 'AKSI TIDAK DIIZINKAN.');
    }
}