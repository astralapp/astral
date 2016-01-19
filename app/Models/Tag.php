<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Auth;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class Tag extends Model
{
  protected $guarded = ['id'];
  protected $hidden = ['pivot', 'user_id'];
  protected $fillable = ['name', 'description'];
  /**
   * The database table used by the model.
   *
   * @var string
   */
  protected $table = 'tags';

  public function stars()
  {
    return $this->belongsToMany('App\Models\Star');
  }
  public function getIdAttribute($value)
  {
    return (int)$value;
  }
  protected static function boot()
  {
    parent::boot();
    static::creating(function($tag)
    {
      $user = JWTAuth::parseToken()->authenticate();
      $tag->user_id = Auth::id();
      $tag->sort_order = self::where('user_id', Auth::id())->count();
      $tag->slug = str_slug( $tag->name );
    });
    static::saving(function($tag)
    {
      $tag->slug = str_slug( $tag->name );
    });
  }
}
