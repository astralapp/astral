<?php

namespace Astral\Models;

use Astral\TagSlugger;
use Auth;
use Illuminate\Database\Eloquent\Model;
use JWTAuth;

class Tag extends Model
{
    /** @var array */
    protected $guarded = ['id'];

    /** @var array */
    protected $hidden = ['pivot', 'user_id'];

    /** @var array */
    protected $fillable = ['name', 'description'];

    /** @var string */
    protected $table = 'tags';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(\Astral\Models\User::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function stars()
    {
        return $this->belongsToMany(\Astral\Models\Star::class);
    }

    /**
     * @param int $value
     *
     * @return int
     */
    public function getIdAttribute($value)
    {
        return (int) $value;
    }

    /**
     * Scope for tags belonging to the user with all its stars.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithStars($query)
    {
        return $query->with('stars')->withCount('stars')->where('user_id', Auth::id())->orderBy('sort_order', 'asc');
    }

    /**
     * Scope for tags belonging to the user with the count of its stars.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithStarCount($query)
    {
        return $query->withCount('stars')->where('user_id', Auth::id())->orderBy('sort_order', 'asc');
    }

    /**
     * Scope for tags belonging to the user with a given name.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWhereName($query, $name)
    {
        return $query->where('name', $name)->where('user_id', Auth::id());
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tag) {
            JWTAuth::parseToken()->authenticate();
            $tag->user_id = Auth::id();
            $tag->sort_order = self::where('user_id', Auth::id())->count();
            $tag->slug = (new TagSlugger($tag->name))->fix();
        });

        static::saving(function ($tag) {
            $tag->slug = (new TagSlugger($tag->name))->fix();
        });
    }
}
