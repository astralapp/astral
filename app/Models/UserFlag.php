<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperUserFlag
 */
class UserFlag extends Model
{
    use HasFactory;

    protected $casts = [
        'value' => 'boolean',
    ];

    protected $visible = ['key', 'value'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
