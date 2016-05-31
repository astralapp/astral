<?php

namespace Astral\Console\Commands;

use Illuminate\Console\Command;
use Colors\RandomColor;
use Astral\Models\Tag;

class ColorTags extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tags:color';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Adds color values to all tags that do not have one.';

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
        $tags = Tag::whereNull('color')->get();
        $bar = $this->output->createProgressBar(count($tags));
        foreach ($tags as $tag) {
            $tag->color = RandomColor::one();
            $tag->save();
            $bar->advance();
        }
        $bar->finish();
        $this->info('Colors successfully added to '.count($tags).' tags.');
    }
}
