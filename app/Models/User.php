<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'users';

    public function stars() {
      return $this->hasMany('App\Models\Star');
    }

    public function tags() {
      return $this->hasMany('App\Models\Tag');
    }
}
