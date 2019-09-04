<?php

namespace Astral\Console\Commands;

use Astral\Models\User;
use Illuminate\Console\Command;

class ClearAccessTokensCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'access_tokens:clear';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Removes all GitHub access tokens from all users.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $this->info('Removing all user access tokens...');

        $users = User::all();
        $bar = $this->output->createProgressBar(count($users));

        $bar->start();

        foreach ($users as $user) {
            $user->access_token = null;
            $user->save();
            $bar->advance();
        }

        $bar->finish();
        $this->output->newLine();
    }
}
