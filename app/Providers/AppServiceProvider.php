<?php

namespace Astral\Providers;

use Astral\Lib\Autotagger;
use Astral\Lib\GitHubClient;
use Astral\Lib\StarsJanitor;
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

        $this->app->bind(StarsJanitor::class, function () {
            return new StarsJanitor(auth()->user());
        });

        $this->app->bind(Autotagger::class, function () {
            return new Autotagger(auth()->user());
        });
    }
}
