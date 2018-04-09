<?php

namespace Astral\Http\Controllers;

class StarsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index()
    {
        return auth()->user()->stars()->with('tags')->get();
    }
}
