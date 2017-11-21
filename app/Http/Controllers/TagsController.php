<?php
namespace Astral\Http\Controllers;

use Astral\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index()
    {
        return Tag::withStarCount()->get();
    }
}
