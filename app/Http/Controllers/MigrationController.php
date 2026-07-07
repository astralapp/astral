<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Lib\ImportLegacyData;
use App\Lib\LegacyMigration;
use Illuminate\Http\JsonResponse;
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

    /**
     * Import one cursor-bounded batch of legacy data. The frontend drives the cursor loop
     * and shows progress, so large accounts migrate across many short requests.
     */
    public function import(Request $request, LegacyMigration $migration, ImportLegacyData $importer): JsonResponse
    {
        $user = auth()->user();

        if (! ($migration->isEnabled() && $migration->hasLegacyData($user))) {
            return response()->json(['cursor' => null, 'done' => true, 'total' => 0, 'processed' => 0]);
        }

        $validated = $request->validate([
            'cursor' => ['nullable', 'integer'],
        ]);

        return response()->json($importer->importChunk($user, $validated['cursor'] ?? null));
    }

    /**
     * Backfill GitHub metadata for a batch of the user's stars. The frontend sends the
     * stars in slices; `finalize` marks the migration complete on the last slice.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'stars' => ['present', 'array'],
            'stars.*.starId' => ['required', 'integer'],
            'stars.*.databaseId' => ['required', 'integer'],
            'stars.*.nameWithOwner' => ['required', 'string'],
            'stars.*.url' => ['required', 'string', 'url'],
            'stars.*.description' => ['nullable', 'string'],
            'finalize' => ['boolean'],
        ]);

        $user = auth()->user();

        DB::transaction(function () use ($validated, $user) {
            foreach ($validated['stars'] as $star) {
                $userStar = $user->stars()->find($star['starId']);

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
        });

        if ($validated['finalize'] ?? false) {
            $user->markAsMigrated();
        }

        return response()->json(['done' => (bool) ($validated['finalize'] ?? false)]);
    }
}
