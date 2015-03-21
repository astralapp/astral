<?php

Route::get('/', function()
{
  return View::make('index');
});

Route::get('/beta_emails/unsubscribe', function(){
  $key = Input::get('key');
  $user = BetaUser::where('email', Crypt::decrypt($key))->first();
  $user->unsubscribed = true;
  $user->save();
  return "You have been succesfully unsubscribed from all emails from Astral. Bye!";
});
Route::group(['prefix' => 'admin', 'before' => 'admin-auth'], function(){
  Route::get('/', 'AdminController@index');
  Route::post('/email', 'AdminController@postEmail');
  Route::get('/beta_users', 'AdminController@getBetaUsers');
  Route::post('/beta_users', 'AdminController@postBetaUsers');
  Route::get('/logs', 'AdminController@getLogs');
  Route::get('/logs/{date}', 'AdminController@getLog');
});

Route::group(['prefix' => 'api'], function(){
  Route::get('auth/login', 'UserController@authenticate');
  Route::get('auth/user', ['before' => 'auth', 'uses' => 'UserController@user']);
  Route::get('auth/logout', 'UserController@logout');
  Route::resource('stars', 'StarController');
  Route::post('star/tag', 'StarController@tag');
  Route::post('star/autotag', 'StarController@autotag');
  Route::post('star/syncTags', 'StarController@syncTags');
  Route::post('star/crowdtag', 'StarController@getOccurencesOfTagForStar');
  Route::get('github/stars', 'GitHubController@stars');
  Route::get('github/repo/{owner}/{repo}/readme', 'GitHubController@readme');
  Route::post('github/unstar', 'GitHubController@unstar');
  Route::resource('tags', 'TagController');
  Route::post('tags/reorder', 'TagController@reorder');
  Route::post('user/settings/autotag', 'UserController@updateAutotag');
  Route::post('user/settings/crowdtag', 'UserController@updateCrowdtag');
  Route::get('user/settings/exportData', 'UserController@exportData');
});
