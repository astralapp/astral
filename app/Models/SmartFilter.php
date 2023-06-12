<?php

namespace App\Models;

use App\Scopes\SortOrderScope;
use GeneaLabs\LaravelModelCaching\Traits\Cachable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperSmartFilter
 */
class SmartFilter extends Model
{
    use HasFactory, Cachable;

    protected $casts = [
        'body' => 'array',
    ];

    protected $attributes = [
        'body' => '{}',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted()
    {
        static::addGlobalScope(new SortOrderScope);

        static::creating(function (self $smartFilter) {
            $smartFilter->sort_order = self::where('user_id', auth()->id())->max('sort_order') + 1;
        });
    }
}
