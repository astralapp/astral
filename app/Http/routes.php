<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::get('/', function () {
    return view('index');
});

Route::group(['prefix' => 'api'], function () {
    Route::group(['middleware' => 'web'], function () {
        Route::get('auth', 'AuthController@redirectToProvider');
        Route::get('auth/callback', 'AuthController@handleProviderCallback');
    });

    Route::group(['middleware' => 'response'], function () {
        Route::get('auth/logout', 'AuthController@logout');
        Route::get('auth/user', 'AuthController@fetchUser');
        Route::get('github/stars', 'GithubController@getStars');

        Route::resource('tags', 'TagController');
        Route::post('tags/reorder', 'TagController@reorder');

        Route::get('stars', 'StarController@index');
        Route::post('stars/tag', 'StarController@tag');
        Route::post('stars/syncTags', 'StarController@syncTags');
        Route::post('stars/notes', 'StarController@editNotes');
    });
});
