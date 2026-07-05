<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Lib\ExportUserData;
use App\Lib\ImportUserData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class DataImportController extends Controller
{
    public function __invoke(Request $request, ImportUserData $import): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:25600'],
        ], [
            'file.required' => 'Choose a file to import.',
            'file.max' => 'That file is too large to import.',
        ]);

        $decoded = json_decode(file_get_contents($request->file('file')->getRealPath()), true);

        if (! is_array($decoded)) {
            throw ValidationException::withMessages(['file' => 'That file is not valid JSON.']);
        }

        Validator::make($decoded, [
            'version' => ['required', Rule::in([ExportUserData::VERSION])],
            'tags' => ['sometimes', 'array'],
            'tags.*.name' => ['required', 'string'],
            'stars' => ['sometimes', 'array'],
            'stars.*.repo_id' => ['required', 'integer'],
            'smart_filters' => ['sometimes', 'array'],
            'smart_filters.*.name' => ['required', 'string'],
        ], [
            'version.required' => 'That file does not look like an Astral export.',
            'version.in' => 'That file was exported from an incompatible version of Astral.',
        ])->validate();

        $counts = $import->handle(auth()->user(), $decoded);

        return redirect()
            ->route('dashboard.show')
            ->with('success', "Imported {$counts['stars']} stars, {$counts['tags']} tags, and {$counts['smart_filters']} smart filters.");
    }
}
