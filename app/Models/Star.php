<?php

namespace Astral\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Star extends Model
{
    protected $fillable = ['repo_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }

    public function scopeWithRepoId($query, $id)
    {
        return $query->where('repo_id', $id);
    }

    public function syncTags($tags = [], $detach = true)
    {
        $ids = [];
        if (empty($tags)) {
            $this->tags()->sync([]);
        } else {
            foreach ($tags as $tag) {
                $name = $tag['name'];
                $userTag = Tag::whereName($name)->where('user_id', auth()->id())->first();
                if (!$userTag) {
                    $userTag = Tag::create(['name' => $name]);
                }
                array_push($ids, $userTag->id);
                $this->tags()->sync($ids, $detach);
            }
        }
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($star) {
            DB::table('star_tag')->where('star_id', $star->id)->delete();
        });
    }
}
