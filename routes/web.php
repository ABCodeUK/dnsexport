<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DNSController;
use App\Http\Controllers\DownloadController;
use App\Http\Controllers\UserPreferencesController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Routes
Route::get('/', [UserPreferencesController::class, 'index']);

// DNS Lookup
Route::controller(DNSController::class)->group(function () {
    Route::post('/dnslookup', 'lookup');
});

// User Preferences
Route::middleware(['auth'])->group(function () {
    Route::post('/api/preferences', [UserPreferencesController::class, 'update']);
});

// Download Files
Route::controller(DownloadController::class)->group(function () {
    Route::get('/download', 'download');
});

// Authenticated User Dashboard
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard Route (accessible to all authenticated users)
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin-Only Routes
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin', function () {
        return Inertia::render('AdminDashboard');
    })->name('admin.dashboard');
});

// Include Auth Routes
require __DIR__.'/auth.php';