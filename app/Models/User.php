<?php

declare(strict_types=1);

namespace App\Models;

use App\Data\Enums\UserFlagKey;
use App\Exceptions\InvalidAccessTokenException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\HasApiTokens;

/**
 * @mixin IdeHelperUser
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const BROWSER_EXTENSION_TOKEN = 'browser-extension';

    protected $hidden = [
        'remember_token',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_sponsor' => 'boolean',
        'access_token' => 'encrypted',
    ];

    protected $with = ['flags'];

    public const AVAILABLE_SETTINGS = ['show_language_tags', 'show_topics', 'autosave_notes', 'sidebar_tags_collapsed', 'sidebar_smart_filters_collapsed', 'sidebar_languages_collapsed', 'clone_https_url', 'appearance'];

    protected $attributes = [
        'settings' => '{"show_language_tags": true, "show_topics": false, "autosave_notes": true, "sidebar_tags_collapsed": false, "sidebar_smart_filters_collapsed": false, "sidebar_languages_collapsed": false, "clone_https_url": false, "appearance": "system"}',
    ];

    protected static function booted()
    {
        static::deleting(function (self $user) {
            $user->revokeGrant();
            $user->tags()->delete();
            $user->stars()->delete();
            $user->flags()->delete();
            $user->tokens()->delete();
        });
    }

    /**
     * is_sponsor is a monetization flag written only via setSponsorshipStatus().
     * Keep it out of mass assignment even though Model::unguard() is global, so a
     * stray User::update($request->all()) can never let a user self-promote.
     */
    public function isFillable($key): bool
    {
        if ($key === 'is_sponsor') {
            return false;
        }

        return parent::isFillable($key);
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

        if ($response->getStatusCode() == 404) {
            throw new InvalidAccessTokenException;
        }

        $this->update(['access_token' => null]);

        return $this;
    }

    public function isSponsor(): bool
    {
        return (bool) $this->is_sponsor || ! (bool) config('app.check_for_sponsorship');
    }

    public function isNotSponsor(): bool
    {
        return ! $this->isSponsor();
    }

    public function setSponsorshipStatus(bool $isSponsor): self
    {
        // Direct assignment: is_sponsor is not mass-assignable (see isFillable()).
        $this->is_sponsor = $isSponsor ? now() : null;
        $this->save();

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
        // Sponsors are unlimited; -1 is the "no limit" sentinel the client understands.
        return $this->isNotSponsor() ?
            config('limits') :
            collect(config('limits'))->map(fn () => -1)->toArray();
    }

    public function flags()
    {
        return $this->hasMany(UserFlag::class);
    }

    public function getFlag(UserFlagKey|string $key): bool
    {
        $key = $key instanceof UserFlagKey ? $key->value : $key;

        return (bool) optional($this->flags()->where('key', $key)->first())->value ?? false;
    }

    public function setFlag(UserFlagKey|string $key, bool $value): UserFlag
    {
        $key = $key instanceof UserFlagKey ? $key->value : $key;

        return $this->flags()->updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public function hasMigrated(): bool
    {
        return $this->getFlag(UserFlagKey::MIGRATION);
    }

    public function markAsMigrated(): UserFlag
    {
        return $this->setFlag(UserFlagKey::MIGRATION, true);
    }
}
