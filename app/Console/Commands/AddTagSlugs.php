<?php

namespace Astral\Console\Commands;

use Illuminate\Console\Command;
use Astral\Models\Tag;

class AddTagSlugs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tags:slugify';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Adds a slug to all tags that do not have one.';

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
        $tags = Tag::whereNull('slug')->get();
        $bar = $this->output->createProgressBar(count($tags));
        foreach ($tags as $tag) {
            $tag->slug = str_slug($tag->name);
            $tag->save();
            $bar->advance();
        }
        $bar->finish();
        $this->info('Slugs successfully added to '.count($tags).' tags.');
    }
}
