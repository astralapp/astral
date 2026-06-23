<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Lib\ImportLegacyData;
use App\Lib\LegacyMigration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MigrationController extends Controller
{
    public function index(LegacyMigration $migration)
    {
        $user = auth()->user();

        if ($user->hasMigrated()) {
            return redirect(route('dashboard.show'));
        }

        // Nothing to migrate: mark them done and skip the migrate step entirely.
        if (! ($migration->isEnabled() && $migration->hasLegacyData($user))) {
            $user->markAsMigrated();

            return redirect(route('dashboard.show'));
        }

        return hybridly()->view('views.migrate', [
            'stars' => $user->stars()->get(),
        ]);
    }

    public function import(LegacyMigration $migration, ImportLegacyData $importer)
    {
        $user = auth()->user();

        if ($migration->isEnabled() && $migration->hasLegacyData($user)) {
            $importer->handle($user);
        }

        return hybridly()->view('views.migrate', [
            'stars' => $user->stars()->get(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'stars' => ['present', 'array'],
            'stars.*.starId' => ['required', 'integer'],
            'stars.*.databaseId' => ['required', 'integer'],
            'stars.*.nameWithOwner' => ['required', 'string'],
            'stars.*.url' => ['required', 'string', 'url'],
            'stars.*.description' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['stars'] as $star) {
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
            }

            auth()->user()->markAsMigrated();
        });

        return redirect(route('dashboard.show'));
    }
}
