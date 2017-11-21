<?php
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
 */

Route::get('me', 'AuthController@me');

Route::get('/tags', 'TagController@index');

Route::put('/star/tags', 'StarTagsController@update');

Route::post('stars/github', 'StarsController@fetchGitHubStars');
