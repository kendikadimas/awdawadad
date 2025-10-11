<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Konveksi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KonveksiController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $location = $request->query('location');

        $konveksiQuery = Konveksi::query()
            ->with('preview3dModel')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($location && $location !== 'all', function ($query, $location) {
                $query->where('location', $location);
            })
            ->orderByDesc('updated_at');

        $konveksis = $konveksiQuery->get();

        $stats = [
            'total_partners'   => $konveksis->count(),
            'verified_partners'=> $konveksis->where('is_verified', true)->count(),
            'total_locations'  => $konveksis->pluck('location')->filter()->unique()->count(),
            'average_rating'   => round($konveksis->avg('rating') ?? 0, 1),
        ];

        $locations = Konveksi::query()
            ->select('location')
            ->whereNotNull('location')
            ->distinct()
            ->orderBy('location')
            ->pluck('location')
            ->values();

        return Inertia::render('User/Konveksi', [
            'konveksis' => $konveksis,
            'stats'     => $stats,
            'filters'   => [
                'search'   => $search,
                'location' => $location ?? 'all',
            ],
            'locations' => $locations,
        ]);
    }
}