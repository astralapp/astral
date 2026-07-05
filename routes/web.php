<?php

declare(strict_types=1);

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrowserExtensionTokenController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DataExportController;
use App\Http\Controllers\DataImportController;
use App\Http\Controllers\MigrationController;
use App\Http\Controllers\SmartFiltersController;
use App\Http\Controllers\SmartFiltersSortOrderController;
use App\Http\Controllers\SponsorshipController;
use App\Http\Controllers\StarNotesController;
use App\Http\Controllers\StarsController;
use App\Http\Controllers\StarTagsController;
use App\Http\Controllers\TagsController;
use App\Http\Controllers\TagsSortOrderController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserSettingsController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::group(['middleware' => 'guest'], function () {
    Route::get('auth', [AuthController::class, 'show'])->name('auth.show');
    Route::get('auth/github', [AuthController::class, 'redirectToProvider'])->name('github.auth');
    Route::get('auth/github/callback', [AuthController::class, 'handleProviderCallback'])->name('github.callback');
});

Route::get('logout', [AuthController::class, 'logout'])
    ->middleware('auth')
    ->name('auth.destroy');

Route::redirect('/login', '/auth/github')->name('login.show');

// Local-only auth bypass for development and previewing. Guarded by the local
// environment, so it is never registered in staging or production.
if (app()->environment('local')) {
    Route::get('dev-login', function () {
        auth()->login(User::firstOrFail());

        return redirect()->route('dashboard.show');
    })->name('dev.login');
}

Route::group(['middleware' => ['auth']], function () {
    Route::get('/', [DashboardController::class, 'show'])->middleware('migrated')->name('dashboard.show');

    Route::get('migrate', [MigrationController::class, 'index'])->name('migrate.index');
    Route::post('migrate', [MigrationController::class, 'import'])->name('migrate.import');
    Route::put('migrate', [MigrationController::class, 'update'])->name('migrate.update');

    Route::post('tags', [TagsController::class, 'store'])->name('tags.store');
    Route::delete('tags/{tag}', [TagsController::class, 'destroy'])->name('tags.destroy');
    Route::put('tags/reorder', TagsSortOrderController::class)->name('tags.reorder');
    Route::put('tags/{tag}', [TagsController::class, 'update'])->name('tags.update');

    Route::post('stars/tag', [StarTagsController::class, 'store'])->name('star.tags.store');
    Route::put('star/sync-tags', [StarTagsController::class, 'update'])->name('star.tags.update');
    Route::put('star/notes', StarNotesController::class)->name('star.notes.update');
    Route::delete('star/{star}', [StarsController::class, 'destroy'])->name('star.destroy');

    Route::post('smart-filters', [SmartFiltersController::class, 'store'])->name('smart-filters.store');
    Route::put('smart-filters/reorder', SmartFiltersSortOrderController::class)->name('smart-filters.reorder');
    Route::put('smart-filters/{smart_filter}', [SmartFiltersController::class, 'update'])->name('smart-filters.update');
    Route::delete('smart-filters/{smart_filter}', [SmartFiltersController::class, 'destroy'])->name('smart-filters.destroy');

    Route::post('sponsorship/recheck', SponsorshipController::class)->name('sponsor.check');

    Route::put('settings', [UserSettingsController::class, 'update'])->name('settings.update');
    Route::put('settings/appearance', [UserSettingsController::class, 'updateAppearance'])->name('settings.appearance.update');

    Route::post('browser-extension-token', [BrowserExtensionTokenController::class, 'store'])->name('browser-extension-token.store');
    Route::delete('browser-extension-token', [BrowserExtensionTokenController::class, 'destroy'])->name('browser-extension-token.destroy');

    Route::get('data/export', DataExportController::class)->name('data.export');
    Route::post('data/import', DataImportController::class)->name('data.import');

    Route::post('revoke-grant', [AuthController::class, 'revokeGrant'])->name('revoke-grant');
    Route::delete('user', [UserController::class, 'destroy'])->name('user.destroy');
});
