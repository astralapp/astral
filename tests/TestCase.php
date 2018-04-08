<?php

namespace Tests;

use Astral\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use JWTAuth;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected $headers = ['Accept' => 'application/json'];

    protected function login(User $user = null)
    {
        $user = $user ?: create('Astral\Models\User');
        $token = JWTAuth::fromUser($user);
        JWTAuth::setToken($token);
        $this->headers['Authorization'] = 'Bearer '.$token;
        auth()->login($user);

        return $this;
    }

    public function call($method, $uri, $parameters = [], $cookies = [], $files = [], $server = [], $content = null)
    {
        $applicationJson = $this->transformHeadersToServerVars($this->headers);
        $server = array_merge($server, $applicationJson);

        return parent::call($method, $uri, $parameters, $cookies, $files, $server, $content);
    }
}
