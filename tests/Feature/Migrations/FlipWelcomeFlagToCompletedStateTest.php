<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\DB;

function seedLegacyWelcomeFlag(User $user, bool $value): void
{
    DB::table('user_flags')->insert([
        'key' => 'pending-welcome',
        'user_id' => $user->id,
        'value' => $value,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

it('flips the welcome flag to the completed-state convention', function () {
    // Mid-welcome: still pending → must stay "not completed" so they still see the screen.
    $midWelcome = User::factory()->create();
    seedLegacyWelcomeFlag($midWelcome, true);

    // Finished welcome under the old flag → completed.
    $finished = User::factory()->create();
    seedLegacyWelcomeFlag($finished, false);

    // Predates the feature (no flag) → treated as completed so it isn't re-shown.
    $preFeature = User::factory()->create();

    $migration = require database_path('migrations/2026_07_09_213240_flip_welcome_flag_to_completed_state.php');
    $migration->up();

    expect($midWelcome->fresh()->hasCompletedWelcome())->toBeFalse();
    expect($finished->fresh()->hasCompletedWelcome())->toBeTrue();
    expect($preFeature->fresh()->hasCompletedWelcome())->toBeTrue();

    // No stale pending-welcome rows survive the flip.
    expect(DB::table('user_flags')->where('key', 'pending-welcome')->count())->toBe(0);
});
