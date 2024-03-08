<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MigrationController extends Controller
{
    public function index()
    {
        return hybridly('migrate', [
            'stars' => auth()->user()->stars()->get(),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'stars' => ['required', 'array'],
            'stars.*.starId' => ['required', 'integer'],
            'stars.*.databaseId' => ['required', 'integer'],
            'stars.*.nameWithOwner' => ['required', 'string'],
            'stars.*.url' => ['required', 'string', 'url'],
            'stars.*.description' => ['nullable', 'string'],
        ]);

        $stars = $request->input('stars');

        DB::beginTransaction();

        try {
            foreach ($stars as $star) {
                $userStar = auth()->user()->stars()->find($star['starId']);

                if (! $userStar) {
                    continue;
                }

                $userStar->update([
                    'repo_id' => $star['databaseId'],
                    'meta' => [
                        'nameWithOwner' => $star['nameWithOwner'],
                        'url' => $star['url'],
                        'description' => $star['description'],
                    ],
                ]);

                if (! is_null($userStar['notes']) && is_null(json_decode($userStar['notes'], true))) {
                    $userStar->update([
                        'notes' => Str::markdown($userStar['notes']),
                    ]);
                }
            }
        } catch (\Exception $e) {
            DB::rollBack();
        }

        auth()->user()->setFlag('2023-migration', true);

        DB::commit();

        return redirect(route('dashboard.show'));
    }
}
