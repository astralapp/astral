<?php

namespace Tests\Stubs;

class GitHubUser
{
    public $token = 'abcdefg1234567';

    public function getNickname()
    {
        return 'janeDoe';
    }

    public function getId()
    {
        return 12345;
    }

    public function getName()
    {
        return 'Jane Doe';
    }

    public function getAvatar()
    {
        return 'http://lorempixel.com/200/200/';
    }
}
