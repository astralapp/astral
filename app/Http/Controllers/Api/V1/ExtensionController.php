<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\TagData;
use App\Exceptions\TagLimitExceededException;
use App\Http\Controllers\Controller;
use App\Lib\SyncStarTags;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExtensionController extends Controller
{
    /**
     * The authenticated user's full tag list, used for the extension's autocomplete.
     */
    public function tags(Request $request): JsonResponse
    {
        return response()->json([
            'tags' => TagData::collect($request->user()->tags()->withStarCount()->get()),
        ]);
    }

    /**
     * The Astral tags currently applied to a repo, keyed by its GitHub database id.
     * Returns an empty set (not 404) when the repo has never been tagged.
     */
    public function repoTags(Request $request, int $databaseId): JsonResponse
    {
        $star = $request->user()->stars()->with('tags')->where('repo_id', $databaseId)->first();

        return response()->json([
            'databaseId' => $databaseId,
            'starExists' => (bool) $star,
            'tags' => $star ? TagData::collect($star->tags) : [],
        ]);
    }

    /**
     * Replace the full set of tags on a repo, creating the star and any missing
     * tags. Mirrors the dashboard sync via the shared SyncStarTags action.
     */
    public function syncTags(Request $request, SyncStarTags $syncStarTags): JsonResponse
    {
        $request->validate([
            'databaseId' => ['required', 'integer'],
            'nameWithOwner' => ['required', 'string'],
            'url' => ['required', 'string', 'url'],
            'description' => ['nullable', 'string'],
            'tags' => 'array',
            'tags.*.name' => ['required_with:tags', 'string'],
        ]);

        try {
            $star = $syncStarTags->handle(
                $request->user(),
                (int) $request->input('databaseId'),
                $request->only(['nameWithOwner', 'url', 'description']),
                $request->input('tags', []),
            );
        } catch (TagLimitExceededException $e) {
            return response()->json([
                'message' => 'Tag limit reached. An active sponsorship is required to add more tags.',
                'sponsorshipRequired' => $e->ability->value,
            ], 403);
        }

        return response()->json([
            'databaseId' => $star->repo_id,
            'tags' => TagData::collect($star->load('tags')->tags),
        ]);
    }
}
