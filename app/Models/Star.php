<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Star extends Model
{
  /**
   * The database table used by the model.
   *
   * @var string
   */
  protected $table = 'stars';

  public function user() {
    return $this->belongsTo('App\Models\User');
  }
}
