<?php

namespace Astral\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;
    /** @var string */
    protected $table = 'users';

    /** @var array */
    protected $fillable = ['github_id', 'name', 'username', 'avatar_url', 'autotag', 'access_token'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function stars()
    {
        return $this->hasMany(Star::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    public function mapGithubUser($githubUser)
    {
        $this->username = $githubUser->getNickname();
        $this->github_id = $githubUser->getId();
        if ($githubUser->getName()) {
            $this->name = $githubUser->getName();
        }
        $this->avatar_url = $githubUser->getAvatar();
        $this->access_token = $githubUser->token;
        $this->save();
    }

    /**
     * @return string
     */
    public function starsCacheKey()
    {
        return "user_{$this->id}.github_stars";
    }
}
