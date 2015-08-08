<?php

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
    return $this->belongsToMany('Star')
  }
  public function getIdAttribute($value)
  {
    return (int)$value;
  }
  protected static function boot()
  {
    parent::boot();
    static::creating(function(Content $content)
    {
      $content->user_id = \Auth::user()->id;
      $content->sort_order = \Tag::where('user_id', \Auth::user()->id)->count();
      $content->slug = str_slug( $content->name );
    });
    static::saving(function(Content $content)
    {
      $content->slug = str_slug( $content->name );
    });
  }
}
