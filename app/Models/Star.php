<?php

namespace Astral\Models;

use Auth;
use DB;
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

    public function removeAllTags()
    {
        $this->tags()->sync([]);
    }

    public function attachRepoInfo($id, $name)
    {
        $this->repo_id = $id;
        $this->repo_name = $name;
        $this->save();
    }

    /**
     * Scope for stars belonging to the user with a github repo id.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithRepoId($query, $id)
    {
        return $query->where('repo_id', $id)->where('user_id', Auth::id());
    }

    /**
     * Scope for stars belonging to the user with all its tags.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithTags($query)
    {
        return $query->with('tags')->where('user_id', Auth::id());
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
            DB::table('star_tag')->where('star_id', $star->id)->delete();
        });
    }
}
