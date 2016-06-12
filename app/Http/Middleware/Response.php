<?php

namespace Astral\Http\Middleware;

use Closure;
use Symfony\Component\HttpFoundation\Response as BaseResponse;

class Response
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure $next
     *
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        $statusCode = $response->getStatusCode();

        $method = "code_{$statusCode}";

        if (method_exists($this, $method)) {
            return response()->json([
                'code' => $statusCode,
                'message' => $this->{$method}($response),
                'errors' => [],
            ], $statusCode);
        }

        return $response;
    }

    private function code_200(BaseResponse $response)
    {
        $content = $response->getContent();

        if (empty($content)) {
            $content = 'Success, but no response received.';
        }

        return $this->is_json($content) ? json_decode($content) : $content;
    }

    private function code_405(BaseResponse $response) : string
    {
        return 'Could not route request. Check the documentation.';
    }

    private function code_404(BaseResponse $response) : string
    {
        return 'Could not route request. Check the documentation.';
    }

    /** @todo: Refactor to make generally available */
    private function is_json($input)
    {
        json_decode($input);

        return json_last_error() === JSON_ERROR_NONE;
    }
}
