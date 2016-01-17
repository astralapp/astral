<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
  protected $guarded = ['id'];
  protected $hidden = ['pivot', 'user_id'];
  /**
   * The database table used by the model.
   *
   * @var string
   */
  protected $table = 'tags';

  public function stars()
  {
    return $this->belongsToMany('App\Models\Star')
  }
  public function getIdAttribute($value)
  {
    return (int)$value;
  }
  protected static function boot()
  {
    parent::boot();
    static::creating(function($content)
    {
      $content->user_id = \Auth::id();
      $content->sort_order = \Tag::where('user_id', \Auth::id())->count();
      $content->slug = str_slug( $content->name );
    });
    static::saving(function($content)
    {
      $content->slug = str_slug( $content->name );
    });
  }
}
