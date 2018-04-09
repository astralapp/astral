<?php

namespace Tests\Unit;

use Astral\Lib\TagSlugger;
use Tests\TestCase;

class TagSluggerTest extends TestCase
{
    /** @test */
    public function it_converts_a_simple_tag_name_into_a_slug()
    {
        $slugger = new TagSlugger('Build Tools');
        $this->assertEquals('build-tools', $slugger->fix());
    }

    /** @test */
    public function it_replaces_ampersands_with_and()
    {
        $slugger = new TagSlugger('foo & bar');
        $this->assertEquals('foo-and-bar', $slugger->fix());
    }

    /** @test */
    public function it_replaces_slashes()
    {
        $slugger = new TagSlugger('A/B Testing');
        $this->assertEquals('a-b-testing', $slugger->fix());
    }

    /** @test */
    public function it_replaces_quotes()
    {
        $slugger = new TagSlugger('Some "tag"');
        $this->assertEquals('some-tag', $slugger->fix());
    }

    /** @test */
    public function it_replaces_dot_net()
    {
        $slugger = new TagSlugger('.net');
        $this->assertEquals('dot-net', $slugger->fix());
    }

    /** @test */
    public function it_replaces_c_plus_plus()
    {
        $slugger = new TagSlugger('c++');
        $this->assertEquals('cpp', $slugger->fix());
    }

    /** @test */
    public function it_replaces_c_sharp()
    {
        $slugger = new TagSlugger('c#');
        $this->assertEquals('c-sharp', $slugger->fix());
    }

    /** @test */
    public function it_replaces_f_sharp()
    {
        $slugger = new TagSlugger('f#');
        $this->assertEquals('f-sharp', $slugger->fix());
    }

    /** @test */
    public function it_removes_hashes()
    {
        $slugger = new TagSlugger('#selfie');
        $this->assertEquals('selfie', $slugger->fix());
    }

    /** @test */
    public function it_replaces_plus_symbols()
    {
        $slugger = new TagSlugger('Gulp+Grunt');
        $this->assertEquals('gulp-grunt', $slugger->fix());
    }

    /** @test */
    public function it_replaces_dots()
    {
        $slugger = new TagSlugger('website.com');
        $this->assertEquals('website-com', $slugger->fix());
    }

    /** @test */
    public function it_replaces_encoded_spaces()
    {
        $slugger = new TagSlugger(urlencode('oh snap'));
        $this->assertEquals('oh-snap', $slugger->fix());
    }
}
