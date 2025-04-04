<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Preference extends Model
{
    protected $fillable = ['user_id', 'subdomain_preferences'];

    protected $casts = [
        'subdomain_preferences' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
