<?php

declare(strict_types=1);

namespace App\Providers;

use App\Lib\Sponsorship;
use App\Lib\StarsJanitor;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Foundation\Console\CliDumper;
use Illuminate\Foundation\Http\HtmlDumper;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\ServiceProvider;

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
        Model::preventLazyLoading(! app()->isProduction());
        Model::preventSilentlyDiscardingAttributes(! app()->isProduction());
        Model::unguard();
        Relation::enforceMorphMap([
            'user' => User::class,
        ]);
        Date::use(CarbonImmutable::class);
    }
}
