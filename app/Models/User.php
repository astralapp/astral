<?php

namespace Astral\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'name', 'email', 'password',
    ];

    protected $hidden = [
        'password', 'remember_token', 'access_token',
    ];

    protected $casts = [
        'autosave_notes'     => 'boolean',
        'show_language_tags' => 'boolean',
    ];

    public function stars()
    {
        return $this->hasMany(Star::class);
    }

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    public function predicates()
    {
        return $this->hasMany(Predicate::class);
    }

    public function mapGitHubUserData($githubUser)
    {
        $this->username = $githubUser->getNickname();
        $this->github_id = $githubUser->getId();
        if ($githubUser->getName()) {
            $this->name = $githubUser->getName();
        }
        $this->avatar_url = $githubUser->getAvatar();

        $this->save();
    }

    public function setShowLanguageTags($flag)
    {
        $this->show_language_tags = (bool) $flag;
        $this->save();
    }

    public function setAutosaveNotes($flag)
    {
        $this->autosave_notes = (bool) $flag;
        $this->save();
    }

    public function starsCacheKey()
    {
        return "user_{$this->id}.github_stars";
    }
}
