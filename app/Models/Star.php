<?php
use LaravelBook\Ardent\Ardent;
class Star extends Ardent {
  protected $guarded = ['id', 'tag_id'];
  protected $hidden = array("user_id");
  public static $relationsData = [
    'user' => [self::BELONGS_TO, 'User'],
    'category' => [self::BELONGS_TO, 'Category'],
    'tags' => [self::BELONGS_TO_MANY, 'Tag']
  ];

  public function beforeCreate() {
    $this->user_id = Auth::user()->id;
  }
  public function beforeUpdate() {
    $this->user_id = Auth::user()->id;
  }
  public function beforeDelete() {
    DB::table('star_tag')->where('star_id', $this->id)->delete();
  }
}