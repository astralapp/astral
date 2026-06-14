<?php

declare(strict_types=1);

namespace App\Exceptions;

use App\Data\Enums\Ability;
use Exception;

class TagLimitExceededException extends Exception
{
    public function __construct(public readonly Ability $ability)
    {
        parent::__construct('Tag limit exceeded.');
    }
}
