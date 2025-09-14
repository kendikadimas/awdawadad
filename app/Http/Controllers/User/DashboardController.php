<?php
// app/Http/Controllers/User/DashboardController.php
namespace App\Http\Controllers\User;

use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController
{
    public function index()
    {
        return Inertia::render('User/Dashboard');
    }
}
