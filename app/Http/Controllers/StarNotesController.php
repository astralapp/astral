<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Enums\Ability;
use Illuminate\Http\Request;

class StarNotesController extends Controller
{
    public function __invoke(Request $request)
    {
        $this->ensureCan($request->user(), Ability::ADD_NOTES);

        $request->validate([
            'repoId' => 'required|numeric',
            'nameWithOwner' => ['required', 'string'],
            'url' => ['required', 'string', 'url'],
            'description' => ['nullable', 'string'],
            'notes' => ['present', 'nullable'],
        ]);

        $meta = $request->only(['nameWithOwner', 'url', 'description']);

        auth()
            ->user()
            ->stars()
            ->updateOrCreate(
                ['repo_id' => $request->input('repoId')],
                [
                    'notes' => $request->input('notes'),
                    'meta' => $meta,
                ]
            );

        return redirect()->route('dashboard.show');
    }
}
