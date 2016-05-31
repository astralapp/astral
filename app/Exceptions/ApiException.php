<?php

namespace Astral\Exceptions;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\MessageBag;

class ApiException extends \Exception
{
    protected $message;
    protected $code;
    protected $previous;

    /** @var \Illuminate\Support\MessageBag */
    protected $errors;

    public function __construct($message = 'Something went wrong.', $code = 400, \Exception $previous = null)
    {
        $this->message = $message;
        $this->code = $code;
        $this->previous = $previous;
        $this->errors = new MessageBag([]);
    }

    public function withErrors(Validator $v) : ApiException
    {
        $e = new self($this->message, $this->code, $this->previous);
        $e->errors = $v->errors();

        return $e;
    }

    public function getStatusCode()
    {
        return $this->code;
    }

    public function getErrors()
    {
        return $this->errors;
    }
}
