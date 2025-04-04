<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;

class UserPreferencesController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if ($user) {
            $user->load(['preferences', 'roles']);
            
            \Log::info('User data:', [
                'user_id' => $user->id,
                'preferences' => $user->preferences
            ]);
            
            return Inertia::render('Home', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
                'auth' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'roles' => $user->roles,
                        'preferences' => $user->preferences
                    ]
                ]
            ]);
        }
        
        return Inertia::render('Home', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'auth' => null
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'subdomain_preferences' => 'required|array',
        ]);

        try {
            \Log::info('Updating preferences:', $validated);
            
            $preference = $request->user()->preferences()->updateOrCreate(
                ['user_id' => $request->user()->id],
                ['subdomain_preferences' => $validated['subdomain_preferences']]
            );

            return response()->json(['message' => 'Preferences updated successfully']);
        } catch (\Exception $e) {
            \Log::error('Preference update failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to update preferences'], 500);
        }
    }
}