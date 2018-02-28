<?php
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
 */

Route::get('auth/me', 'AuthController@me');
Route::get('auth/refresh', 'AuthController@refresh');
Route::get('auth/logout', 'AuthController@logout');

Route::get('/tags', 'TagController@index');
Route::post('/tags', 'TagController@store');

Route::put('/star/tags', 'StarTagsController@update');
Route::post('/star/tags', 'StarTagsController@store');

Route::post('/star/notes', 'StarNotesController@store');

Route::get('/stars', 'StarsController@index');

Route::get('stars/github', 'GitHubStarsController@index');

Route::delete('stars/cleanup', 'StarsJanitorController@destroy');

