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

    /** @var array */
    protected $table = 'tags';

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
