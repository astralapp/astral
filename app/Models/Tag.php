<?php

namespace Astral\Models;

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

    /** @var array */
    protected $appends = ['starCount'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('Astral\Models\User');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function stars()
    {
        return $this->belongsToMany('Astral\Models\Star');
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

    public function starCount()
    {
        return $this->belongsToMany('Astral\Models\Star')
        ->selectRaw('count(stars.id) as aggregate')
        ->groupBy('tag_id');
    }

    public function getStarCountAttribute()
    {
        if (!array_key_exists('starCount', $this->relations)) {
            $this->load('starCount');
        }
        $related = $this->getRelation('starCount')->first();

        return ($related) ? $related->aggregate : 0;
    }

    /**
     * Scope for tags belonging to the user with all its stars.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithStars($query)
    {
        $query->with('stars')->where('user_id', Auth::id())->orderBy('sort_order', 'asc');
    }

    /**
     * Scope for tags belonging to the user with the count of its stars.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithStarCount($query)
    {
        $query->with('starCount')->where('user_id', Auth::id())->orderBy('sort_order', 'asc');
    }

    /**
     * Scope for tags belonging to the user with a given name.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWhereName($query, $name)
    {
        $query->where('name', $name)->where('user_id', Auth::id());
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tag) {
            JWTAuth::parseToken()->authenticate();
            $tag->user_id = Auth::id();
            $tag->sort_order = self::where('user_id', Auth::id())->count();
            $tag->slug = str_slug($tag->name);
        });

        static::saving(function ($tag) {
            $tag->slug = str_slug($tag->name);
        });
    }
}
