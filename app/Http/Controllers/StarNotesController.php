<?php

namespace App\Http\Controllers;

use App\Data\Enums\Ability;
use App\Models\Star;
use Illuminate\Http\Request;

class StarNotesController extends Controller
{
    public function __invoke(Request $request)
    {
        if (auth()->user()->cannot('addNotes', Star::class)) {
            return redirect()->route('dashboard.show')->with('sponsorship_required', Ability::ADD_NOTES);
        }

        $request->validate([
            'repoId' => 'required|numeric',
            'notes'  => 'present|nullable|json',
        ]);

        auth()->user()->stars()->updateOrCreate(['repo_id' => $request->input('repoId')], ['notes' => $request->input('notes')]);

        return redirect()->route('dashboard.show');
    }
}
