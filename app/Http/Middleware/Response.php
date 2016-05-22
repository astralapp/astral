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

        $status_code = $response->getStatusCode();

        $method = "code_{$status_code}";

        if (method_exists($this, $method)) {
            return response()->json([
                'code' => $status_code,
                'message' => $this->{$method}($response),
                'errors' => [],
            ], $status_code);
        }

        return $response;
    }

    private function code_200(BaseResponse $response)
    {
        $content = $response->getContent();

        if (empty( $content )) {
            $content = "Success, but no response received.";
        }

        return is_json($content) ? json_decode($content) : $content;
    }

    private function code_405(BaseResponse $response) : string
    {
        return 'Could not route request. Check the documentation.';
    }

    private function code_404(BaseResponse $response) : string
    {
        return 'Could not route request. Check the documentation.';
    }
}