<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class OpenAiReadmeSummaryController extends Controller
{
    public function __invoke(Request $request)
    {
        if (!$request->user()->openai_token) {
            return redirect()
                ->route('dashboard.show')
                ->withErrors([
                    'openai_token' => 'You must provide an OpenAI token to use this feature.',
                ]);
        }

        try {
            $data = Http::withToken($request->user()->openai_token)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model'    => 'gpt-3.5-turbo',
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are an assistant that is an expert at taking GitHub Readmes as an HTML payload and summarizing them into a few digestable paragraphs and returning the result as markdown.'],
                        ['role' => 'user', 'content' => $request->input('readme')],
                    ],
                ])
                ->throw()
                ->json();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }

        return $data;
    }
}
