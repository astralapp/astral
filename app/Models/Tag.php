<?php
use LaravelBook\Ardent\Ardent;
class Tag extends Ardent {
  public $autoHydrateEntityFromInput = true;
  public $autoPurgeRedundantAttributes = true;
  protected $guarded = ['id'];
  protected $hidden = array("pivot", "user_id");
  public static $relationsData = [
    'stars' => [self::BELONGS_TO_MANY, 'Star']
  ];
  public static $rules = [
    'name' => 'required'
  ];
  public function getIdAttribute($value){
    return (int)$value;
  }
  public function beforeCreate() {
    $this->user_id = Auth::user()->id;
    $this->sort_order = Tag::where('user_id', Auth::user()->id)->count();
  }
}