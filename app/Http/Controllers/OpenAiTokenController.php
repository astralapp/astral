<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OpenAiTokenController extends Controller
{
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'openai_token' => 'nullable|string',
        ]);

        $request->user()->update(['openai_token' => $data['openai_token'] ?? null]);

        return redirect()->route('dashboard.show');
    }
}
