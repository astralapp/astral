<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Flip the welcome flag from the `pending-welcome` (true = still pending) style to the
     * `welcome-completed` (true = done) convention shared by the other user flags. Because the
     * polarity inverts, an absent flag now means "not done" — so every existing user who
     * should stay off the welcome screen must be explicitly marked completed.
     */
    public function up(): void
    {
        // Users who already finished welcome carry the flag forward as completed.
        DB::table('user_flags')
            ->where('key', 'pending-welcome')
            ->where('value', false)
            ->update(['key' => 'welcome-completed', 'value' => true]);

        // Everyone with no welcome flag of either kind predates the feature (or is a legacy
        // account) and has effectively passed the welcome stage; mark them completed so the
        // polarity flip doesn't re-show it. Users still mid-welcome keep their pending row for
        // now, so they're excluded here and handled in the final step.
        $timestamp = now();

        DB::table('users')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('user_flags')
                    ->whereColumn('user_flags.user_id', 'users.id')
                    ->whereIn('user_flags.key', ['welcome-completed', 'pending-welcome']);
            })
            ->orderBy('id')
            ->chunkById(500, function ($users) use ($timestamp) {
                DB::table('user_flags')->insert(
                    $users->map(fn ($user) => [
                        'key' => 'welcome-completed',
                        'user_id' => $user->id,
                        'value' => true,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ])->all()
                );
            });

        // Users still mid-welcome stay "not done": drop the pending marker so its absence
        // shows the screen on their next visit.
        DB::table('user_flags')
            ->where('key', 'pending-welcome')
            ->where('value', true)
            ->delete();
    }

    /**
     * Best-effort reverse to the pending-welcome style. The blanket completed backfill cannot
     * be perfectly undone, but restoring the key and polarity keeps the gate behaving.
     */
    public function down(): void
    {
        DB::table('user_flags')
            ->where('key', 'welcome-completed')
            ->where('value', true)
            ->update(['key' => 'pending-welcome', 'value' => false]);

        DB::table('user_flags')
            ->where('key', 'welcome-completed')
            ->where('value', false)
            ->update(['key' => 'pending-welcome', 'value' => true]);
    }
};
