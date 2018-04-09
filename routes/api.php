<?php


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
 */

Route::get('auth/me', 'AuthController@me');
Route::get('auth/refresh', 'AuthController@refresh');
Route::get('auth/logout', 'AuthController@logout');

Route::get('/tags', 'TagsController@index');
Route::post('/tags', 'TagsController@store');
Route::delete('/tags/{tag}', 'TagsController@destroy');
Route::patch('/tags/{tag}', 'TagsController@update');
Route::put('/tags/reorder', 'TagSortOrderController@update');

Route::put('/star/tags', 'StarTagsController@update');
Route::post('/star/tags', 'StarTagsController@store');

Route::post('/star/notes', 'StarNotesController@store');

Route::get('/stars', 'StarsController@index');

Route::get('stars/github', 'GitHubStarsController@index');

Route::delete('stars/cleanup', 'StarsJanitorController@destroy');
