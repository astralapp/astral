<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\ExtensionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Token-authed surface for the companion browser extension.
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get('tags', [ExtensionController::class, 'tags'])->name('api.v1.tags.index');
    Route::get('repos/{databaseId}/tags', [ExtensionController::class, 'repoTags'])
        ->whereNumber('databaseId')
        ->name('api.v1.repos.tags');
    Route::put('repos/tags', [ExtensionController::class, 'syncTags'])->name('api.v1.repos.tags.sync');
});
