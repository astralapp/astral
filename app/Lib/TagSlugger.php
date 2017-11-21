<?php
namespace Astral\Lib;

class TagSlugger
{
    protected $slug;

    public function __construct($name)
    {
        $this->slug = strtolower($name);
    }

    public function fix()
    {
        $this->replace_ampersand();
        $this->replace_slash();
        $this->replace_quotes();
        $this->replace_dotnet();
        $this->replace_cpp();
        $this->replace_c_sharp();
        $this->replace_f_sharp();
        $this->replace_hash();
        $this->replace_plus();
        $this->replace_dots();

        if (str_slug($this->slug) !== '') {
            return str_slug($this->slug);
        }

        $this->slug = urlencode($this->slug);
        $this->replace_encoded_space();
        $this->replace_plus();

        return str_slug($this->slug) ? : str_random(6);
    }

    private function replace_ampersand()
    {
        if (str_contains($this->slug, '&')) {
            $this->slug = str_replace('&', ' and ', $this->slug);
        }
    }

    private function replace_slash()
    {
        if (str_contains($this->slug, '/')) {
            $this->slug = str_replace('/', ' ', $this->slug);
        }
    }

    private function replace_quotes()
    {
        if (str_contains($this->slug, ['"', "'"])) {
            $this->slug = str_replace(['"', "'"], ' ', $this->slug);
        }
    }

    private function replace_dotnet()
    {
        if ($this->slug == '.net') {
            $this->slug = 'dot-net';
        } elseif (starts_with($this->slug, '.net ')) {
            $this->slug = 'dot-net ';
        } elseif (ends_with($this->slug, ' .net')) {
            $this->slug = ' dot-net';
        }
    }

    private function replace_cpp()
    {
        if (str_contains($this->slug, 'c++')) {
            $this->slug = str_replace('c++', 'cpp', $this->slug);
        }
    }

    private function replace_c_sharp()
    {
        if (str_contains($this->slug, 'c#')) {
            $this->slug = str_replace('c#', 'c sharp', $this->slug);
        }
    }

    private function replace_f_sharp()
    {
        if (str_contains($this->slug, 'f#')) {
            $this->slug = str_replace('f#', 'f sharp', $this->slug);
        }
    }

    private function replace_hash()
    {
        if (str_contains($this->slug, '#')) {
            $this->slug = str_replace('#', '', $this->slug);
        }
    }

    private function replace_plus()
    {
        if (str_contains($this->slug, '+')) {
            $this->slug = str_replace('+', ' ', $this->slug);
        }
    }

    private function replace_dots()
    {
        if (str_contains($this->slug, '.')) {
            $this->slug = str_replace('.', ' ', $this->slug);
        }
    }

    private function replace_encoded_space()
    {
        if (str_contains($this->slug, '%20')) {
            $this->slug = str_replace('%20', ' ', $this->slug);
        }
    }
}
