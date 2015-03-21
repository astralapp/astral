<?php namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class ErrorServiceProvider extends ServiceProvider {
  public function boot(Handler $handler, Log $log) {
    $handler->missing(function(Exception $exception) {
     return view('index', [], 200);
    });
  }
}