<?php

namespace Astral\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class SortOrderScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     *
     * @param \Illuminate\Database\Eloquent\Builder $builder
     * @param \Illuminate\Database\Eloquent\Model   $model
     *
     * @return void
     */
    public function apply(Builder $builder, Model $model)
    {
        $builder->orderBy('sort_order', 'asc');
    }
}
