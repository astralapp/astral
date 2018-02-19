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

    public function store(Request $request)
    {
        $this->validate($request, ['name' => 'required']);

        $name = $request->input('name');

        return Tag::create(['name' => $name]);
    }
}
