<?php

namespace App\Data;

use Spatie\LaravelData\Data;

class UserSettingsData extends Data
{
    public function __construct(
        public readonly bool $autosave_notes,
        public readonly bool $clone_https_url,
        public readonly bool $show_language_tags,
        public readonly bool $sidebar_tags_collapsed,
        public readonly bool $sidebar_smart_filters_collapsed,
        public readonly bool $sidebar_languages_collapsed,
    ) {
    }
}
