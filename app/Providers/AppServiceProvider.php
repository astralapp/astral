<?php

namespace App\Providers;

use App\Models\User;
use App\Lib\Sponsorship;
use App\Lib\StarsJanitor;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Validator;
use Illuminate\Foundation\Http\HtmlDumper;
use Illuminate\Foundation\Console\CliDumper;
use Illuminate\Database\Eloquent\Relations\Relation;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(StarsJanitor::class, function () {
            return new StarsJanitor(auth()->user());
        });
        $this->app->bind(Sponsorship::class, function () {
            return new Sponsorship(auth()->user());
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        HtmlDumper::dontIncludeSource();
        CliDumper::dontIncludeSource();

        Validator::excludeUnvalidatedArrayKeys();
        // Model::shouldBeStrict();
        Model::preventLazyLoading(!app()->isProduction());
        Model::preventSilentlyDiscardingAttributes(!app()->isProduction());
        Model::unguard();
        Relation::enforceMorphMap([
            'user' => User::class,
        ]);
        Date::use(CarbonImmutable::class);
    }
}
