<?php

namespace Astral\Console\Commands;

use Astral\Models\Tag;
use Astral\TagSlugger;
use Illuminate\Console\Command;

class FixTagSlugs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tags:fix';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fixes all tags to have the correct slug';

    /**
     * Create a new command instance.
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
        $total_tags = Tag::count();

        $bar = $this->output->createProgressBar($total_tags);

        Tag::chunk(1000, function ($tags) use ($bar) {
            foreach ($tags as $tag) {
                $slug = (new TagSlugger($tag->name))->fix();
                if ($tag->slug !== $slug) {
                    $tag->slug = $slug;
                    $tag->save();
                }
                $bar->advance();
            }
        });

        $bar->finish();

        $this->info(PHP_EOL . "All slugs have been successfully fixed." . PHP_EOL);
    }
}
