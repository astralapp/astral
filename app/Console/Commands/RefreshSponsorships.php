<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Lib\Sponsorship;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class RefreshSponsorships extends Command
{
    protected $signature = 'sponsorships:refresh';

    protected $description = 'Re-verify current sponsors against GitHub so lapsed sponsorships are revoked promptly';

    public function handle(Sponsorship $sponsorship): int
    {
        if (! config('app.check_for_sponsorship')) {
            $this->info('Sponsorship checking is disabled; nothing to refresh.');

            return self::SUCCESS;
        }

        $checked = 0;
        $failed = 0;

        // Only current sponsors can lapse; new sponsors are picked up at login/recheck.
        // A missing token means we can't verify, so leave that status untouched.
        // ponytail: synchronous per-user loop, fine at this scale; queue if it grows.
        User::whereNotNull('is_sponsor')
            ->whereNotNull('access_token')
            ->chunkById(100, function ($sponsors) use ($sponsorship, &$checked, &$failed): void {
                foreach ($sponsors as $sponsor) {
                    try {
                        $sponsorship->updateUserSponsorshipStatus($sponsor);
                        $checked++;
                    } catch (Throwable $e) {
                        $failed++;
                        Log::warning('Sponsorship refresh failed', ['user_id' => $sponsor->id, 'exception' => $e]);
                    }
                }
            });

        $this->info("Refreshed {$checked} sponsor(s), {$failed} failed.");

        return self::SUCCESS;
    }
}
