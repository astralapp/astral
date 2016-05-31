<?php

namespace Astral\Models;

use Auth;
use Illuminate\Database\Eloquent\Model;
use JWTAuth;

class Star extends Model
{
    /** @var string */
    protected $table = 'stars';

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
    public function tags()
    {
        return $this->belongsToMany('Astral\Models\Tag');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($star) {
            $user = JWTAuth::parseToken()->authenticate();
            $star->user_id = Auth::id();
        });

        static::saving(function ($star) {
            $user = JWTAuth::parseToken()->authenticate();
            $star->user_id = Auth::id();
        });

        static::deleting(function ($star) {
            \DB::table('star_tag')->where('star_id', $star->id)->delete();
        });
    }
}
