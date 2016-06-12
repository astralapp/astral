<?php

namespace Astral\Exceptions;

use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that should not be reported.
     *
     * @var array
     */
    protected $dontReport = [
        AuthorizationException::class,
        HttpException::class,
        ModelNotFoundException::class,
        ValidationException::class,
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception $e
     * @return void
     */
    public function report(Exception $e)
    {
        parent::report($e);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Exception $e
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $e)
    {
        if ($request->ajax()) {
            if ($e instanceof HttpException) {
                return response()->json([
                    'code' => $e->getStatusCode(),
                    'message' => $e->getMessage(),
                    'errors' => [],
                ], $e->getStatusCode());
            } else {
                if ($e instanceof ApiException) {
                    return response()->json([
                        'code' => $e->getStatusCode(),
                        'message' => $e->getMessage(),
                        'errors' => $e->getErrors(),
                    ], $e->getStatusCode());
                }
            }
        }

        if ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
            return response()->view('index');
        }

        return parent::render($request, $e);
    }
}
