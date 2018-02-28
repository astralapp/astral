<?php

namespace Astral\Console\Commands;

use Zttp\Zttp;
use Astral\Models\Star;
use Illuminate\Console\Command;

class MigrateV3Ids extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'repoIds:migrate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrates all star entities to use GitHub\'s GraphQL API Relay ids.';

    /**
     * Create a new command instance.
     *
     * @return void
     */

    protected $repos;
    protected $accessToken;

    public function __construct()
    {
        parent::__construct();
        $this->repos = [];
        $this->accessToken = env('GITHUB_PERSONAL_ACCESS_TOKEN');
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $starsToFix = Star::whereNull('relay_id');

        $count = $starsToFix->count();

        $bar = $this->output->createProgressBar($count);

        $starsToFix->chunk(1000, function ($stars) use ($bar) {
            foreach ($stars as $star) {
                if (!$star->repo_id) {
                    continue;
                }
                if (array_key_exists($star->repo_id, $this->repos)) {
                    $star->update(['relay_id' => $this->repos[$star->repo_id]]);
                } else {
                    $repo = $this->fetchRepo($star->repo_id);
                    if (!array_key_exists('node_id', $repo)) {
                        continue;
                    }
                    $nodeId = $repo['node_id'];
                    $star->update(['relay_id' => $nodeId]);
                    $this->repos[$star->repo_id] = $nodeId;
                }
                $bar->advance();
            }
        });

        $bar->finish();

        $this->info(PHP_EOL . 'Finished migrating ' . $count . ' stars. ' . PHP_EOL);
    }

    private function fetchRepo($id)
    {
        $token = $this->accessToken;
        return Zttp::withHeaders([
            'Accept' => 'application/vnd.github.jean-grey-preview+json'
        ])->get("https://api.github.com/repositories/{$id}?access_token={$token}")->json();
    }
}
