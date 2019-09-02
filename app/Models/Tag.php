<?php

namespace Astral\Models;

use Astral\Scopes\SortOrderScope;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['pivot'];

    protected $fillable = ['name'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function stars()
    {
        return $this->belongsToMany(Star::class);
    }

    public function scopeWhereName($query, $name)
    {
        return $query->where('name', $name);
    }

    public function scopeWithStarCount($query)
    {
        return $query->withCount('stars');
    }

    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope(new SortOrderScope());

        static::creating(function ($tag) {
            $tag->user_id = auth()->id();
            $tag->sort_order = self::where('user_id', auth()->id())->count();
        });
    }
}
