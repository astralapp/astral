<?php
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
 */

Route::get('me', 'AuthController@me');

Route::get('/tags', 'TagController@index');
Route::post('/tags', 'TagController@store');

Route::put('/star/tags', 'StarTagsController@update');
Route::post('/star/tags', 'StarTagsController@store');

Route::post('/star/notes', 'StarNotesController@store');

Route::get('/stars', 'StarsController@index');

Route::post('stars/github', 'GitHubStarsController@index');

