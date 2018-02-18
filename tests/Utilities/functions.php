<?php

use Astral\Models\User;

function create($class, $attributes = [], $times = null)
{
  return factory($class, $times)->create($attributes);
}

function make($class, $attributes = [], $times = null)
{
  return factory($class, $times)->make($attributes);
}

function createLoggedInUser(User $user = null)
{
  $user = $user ? : create('Astral\Models\User');
  auth()->login($user);
}