<?php

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

Route::get('auth/github', 'AuthController@redirectToProvider');
Route::get('auth/github/callback', 'AuthController@handleProviderCallback');
Route::get('auth/logout', 'AuthController@logout');

Route::get('login', function () {
    return redirect('/auth');
})->name('login');

Route::prefix('api')->group(function () {
    Route::get('auth/me', 'AuthController@me');

    Route::get('auth/revoke', 'AuthController@revokeApplicationGrant');
    Route::delete('auth/delete', 'AuthController@destroy');

    Route::group(['middleware' => 'auth'], function () {
        Route::put('user/show-language-tags', 'UserSettingsController@setShowLanguagetags');
        Route::put('user/autosave-notes', 'UserSettingsController@setAutosaveNotes');

        Route::get('tags', 'TagsController@index');
        Route::post('tags', 'TagsController@store');
        Route::delete('tags/{tag}', 'TagsController@destroy');
        Route::patch('tags/{tag}', 'TagsController@update');
        Route::put('tags/reorder', 'TagsSortOrderController@update');

        Route::put('star/tags', 'StarTagsController@update');
        Route::post('star/tags', 'StarTagsController@store');

        Route::post('star/notes', 'StarNotesController@store');

        Route::get('stars', 'StarsController@index');
        Route::get('stars/export', 'StarsController@export');

        Route::get('stars/github', 'GitHubStarsController@index');
        Route::get('stars/readme', 'GitHubStarsController@fetchReadme');
        Route::delete('stars/github/unstar', 'GitHubStarsController@unstar');

        Route::put('stars/autotag', 'AutotagController@update');

        Route::delete('stars/cleanup', 'StarsJanitorController@destroy');

        Route::get('predicates', 'PredicatesController@index');
        Route::post('predicates', 'PredicatesController@store');
        Route::patch('predicates', 'PredicatesController@update');
        Route::delete('predicates/{predicate}', 'PredicatesController@destroy');
        Route::put('predicates/reorder', 'PredicatesSortOrderController@update');
    });
});

Route::get('/', function () {
    if (auth()->check()) {
        return redirect('/dashboard');
    }

    return redirect('/auth');
});

Route::get('/{vue_capture?}', function () {
    return view('index');
})->where('vue_capture', '[\/\w\.-]*');
