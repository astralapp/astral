<?php

namespace Astral\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $fillable = [
        'name', 'email', 'password',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function stars()
    {
        return $this->hasMany(Star::class);
    }

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    public function mapGitHubUser($githubUser)
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

    public function setShowLanguageTags($show)
    {
        $this->show_language_tags = (bool)$show;
        $this->save();
    }

    public function starsCacheKey()
    {
        return "user_{$this->id}.github_stars";
    }
}
