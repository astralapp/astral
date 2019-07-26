<?php

namespace Astral\Models;

use Illuminate\Database\Eloquent\Model;

class Predicate extends Model
{
    protected $fillable = ['name', 'body'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
