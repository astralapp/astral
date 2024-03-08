<?php

declare(strict_types=1);

namespace App\Models;

use App\Scopes\SortOrderScope;
use GeneaLabs\LaravelModelCaching\Traits\Cachable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperTag
 */
class Tag extends Model
{
    use HasFactory;
    use Cachable;

    protected $hidden = ['pivot'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function stars()
    {
        return $this->belongsToMany(Star::class)->withTimestamps();
    }

    public function scopeWithStarCount($query)
    {
        return $query->withCount('stars');
    }

    protected static function booted()
    {
        static::addGlobalScope(new SortOrderScope());

        static::creating(function (self $tag) {
            $tag->sort_order = self::where('user_id', auth()->id())->max('sort_order') + 1;
        });

        static::deleted(function (self $tag) {
            $tag->stars()->each(function (Star $star) use ($tag) {
                $star->tags()->detach($tag->id);

                if ($star->fresh()->isOrphan()) {
                    $star->delete();
                }
            });
        });
    }
}
