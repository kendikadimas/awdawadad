<?php

namespace App\Http\Controllers;

use App\Models\Konveksi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class KonveksiController extends Controller
{
    public function index(Request $request)
    {
        $query = Konveksi::query();

        // Search functionality
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Filter by location
        if ($request->filled('location') && $request->location !== 'all') {
            $query->byLocation($request->location);
        }

        // Filter by verification status
        if ($request->filled('verified')) {
            if ($request->verified === 'true') {
                $query->verified();
            }
        }

        // Filter by rating
        if ($request->filled('min_rating')) {
            $query->highRating($request->min_rating);
        }

        // Order by rating desc and verification status
        $konveksis = $query->orderBy('is_verified', 'asc')
                            ->orderBy('rating', 'asc')
                            ->paginate(12)
                            ->withQueryString()
                            ->through(function ($konveksi) {
                                return [
                                    'id' => $konveksi->id,
                                    'name' => $konveksi->name,
                                    'location' => $konveksi->location,
                                    'is_verified' => $konveksi->is_verified,
                                    'rating' => $konveksi->rating,
                                    'no_telp' => $konveksi->no_telp,
                                    'description' => $konveksi->description,
                                    'documentation' => $konveksi->documentation,
                                    'documentation_url' => $konveksi->documentation_url,
                                    'icon' => $konveksi->icon,
                                    'icon_url' => $konveksi->icon_url,
                                ];
                            });

        // Get statistics
        $stats = $this->getStatistics();

        return Inertia::render('User/Konveksi', [
            'konveksis' => $konveksis,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'location' => $request->location,
                'verified' => $request->verified,
                'min_rating' => $request->min_rating,
            ],
            'locations' => $this->getUniqueLocations()
        ]);
    }

    public function show(Konveksi $konveksi)
    {
        return Inertia::render('User/KonveksiDetail', [
            'konveksi' => $konveksi
        ]);
    }

    private function getStatistics()
    {
        return [
            'total_partners' => Konveksi::count(),
            'verified_partners' => Konveksi::verified()->count(),
            'total_locations' => Konveksi::distinct('location')->count(),
            'average_rating' => round(Konveksi::avg('rating'), 1)
        ];
    }

    private function getUniqueLocations()
    {
        return Konveksi::select('location')
                      ->distinct()
                      ->orderBy('location')
                      ->pluck('location')
                      ->map(function ($location) {
                          return [
                              'label' => $location,
                              'value' => strtolower(str_replace(' ', '', $location))
                          ];
                      });
    }

    // API endpoint untuk mendapatkan data konveksi
    public function apiIndex(Request $request)
    {
        $query = Konveksi::query();

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('location')) {
            $query->byLocation($request->location);
        }

        if ($request->filled('verified')) {
            $query->verified();
        }

        $konveksis = $query->orderBy('is_verified', 'asc')
                          ->orderBy('rating', 'asc')
                          ->paginate(12);

        return response()->json([
            'konveksis' => $konveksis,
            'stats' => $this->getStatistics()
        ]);
    }
}