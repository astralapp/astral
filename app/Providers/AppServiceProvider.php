<?php

namespace Astral\Providers;

use Astral\Lib\GitHubClient;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(GitHubClient::class, function () {
            return new GitHubClient(auth()->user()->access_token);
        });
    }
}
