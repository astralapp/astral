<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class MigrationController extends Controller
{
    public function index()
    {
        return Inertia::render('migrate', [
            'stars' => auth()->user()->stars()->get(),
        ]);
    }

    public function update(Request $request) {
        $request->validate([
            'stars' => ['required', 'array'],
            'stars.*.starId' => ['required', 'integer'],
            'stars.*.databaseId' => ['required', 'integer'],
            'stars.*.nameWithOwner' => ['required', 'string'],
            'stars.*.url' => ['required', 'string', 'url'],
            'stars.*.description' => ['nullable', 'string'],
        ]);

        $stars = $request->input('stars');

        foreach ($stars as $star) {
            $userStar = auth()->user()->stars()->find($star['starId']);

            if(!$userStar) continue;

            $userStar->update([
                'repo_id' => $star['databaseId'],
                'meta' => [
                    'nameWithOwner' => $star['nameWithOwner'],
                    'url' => $star['url'],
                    'description' => $star['description'],
                ]
            ]);

            if (!is_null($userStar['notes']) && is_null(json_decode($userStar['notes'], true)))
            {
                $userStar->update([
                    'notes' => Str::markdown($userStar['notes']),
                ]);
            }
        }

        auth()->user()->setFlag('2023-migration', true);

        return redirect(route('dashboard.index'));
    }
}
