<?php

declare(strict_types=1);

namespace App\Models;

use App\Exceptions\InvalidAccessTokenException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Http;

/**
 * @mixin IdeHelperUser
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $hidden = [
        'remember_token',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_sponsor' => 'boolean',
        'access_token' => 'encrypted',
        'openai_token' => 'encrypted',
    ];

    protected $with = ['flags'];

    public const AVAILABLE_SETTINGS = ['show_language_tags', 'autosave_notes', 'sidebar_tags_collapsed', 'sidebar_smart_filters_collapsed', 'sidebar_languages_collapsed', 'clone_https_url'];

    protected $attributes = [
        'settings' => '{"show_language_tags": true, "autosave_notes": true, "sidebar_tags_collapsed": false, "sidebar_smart_filters_collapsed": false, "sidebar_languages_collapsed": false, "clone_https_url": false}',
    ];

    protected static function booted()
    {
        static::deleting(function (self $user) {
            $user->revokeGrant();
            $user->tags()->delete();
            $user->stars()->delete();
            $user->flags()->delete();
        });
    }

    public function readSetting(string $name, $default = null)
    {
        if (array_key_exists($name, $this->settings)) {
            return $this->settings[$name];
        }

        return $default;
    }

    public function writeSetting(string $name, $value, bool $save = true): self
    {
        throw_if(! in_array($name, self::AVAILABLE_SETTINGS), new \Exception('Setting not available'));

        $this->settings = array_merge($this->settings, [$name => $value]);

        if ($save) {
            $this->save();
        }

        return $this;
    }

    public function updateFromGitHubProfile($githubUser): self
    {
        $this->username = $githubUser->getNickname();
        $this->github_id = $githubUser->getId();

        if ($githubUser->getName()) {
            $this->name = $githubUser->getName();
        }
        $this->avatar = $githubUser->getAvatar();

        return $this;
    }

    public function revokeGrant(): self
    {
        $clientId = config('services.github.client_id');
        $clientSecret = config('services.github.client_secret');

        $response = Http::withBasicAuth($clientId, $clientSecret)
            ->withHeaders(['Accept' => 'application/vnd.github.v3+json'])
            ->delete("https://api.github.com/applications/{$clientId}/grant", ['access_token' => $this->access_token]);

        $this->update(['access_token' => null]);

        if ($response->getStatusCode() == 404) {
            throw new InvalidAccessTokenException();
        }

        return $this;
    }

    public function isSponsor(): bool
    {
        return (bool) $this->is_sponsor || ! (bool) config('app.check_for_sponsorship');
    }

    public function isNotSponsor(): bool
    {
        return ! (bool) $this->is_sponsor;
    }

    public function setSponsorshipStatus(bool $isSponsor): self
    {
        $this->update(['is_sponsor' => $isSponsor ? now() : null]);

        return $this;
    }

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    public function stars()
    {
        return $this->hasMany(Star::class);
    }

    public function smartFilters()
    {
        return $this->hasMany(SmartFilter::class);
    }

    public function limits()
    {
        return $this->isNotSponsor() ?
            config('limits') :
            collect(config('limits'))->map(fn () => -1)->toArray();
    }

    public function flags()
    {
        return $this->hasMany(UserFlag::class);
    }

    public function getFlag($key): bool
    {
        return (bool) optional($this->flags()->where('key', $key)->first())->value ?? false;
    }

    public function setFlag($key, bool $value)
    {
        return $this->flags()->updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
