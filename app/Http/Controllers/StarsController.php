<?php
namespace Astral\Http\Controllers;

use Astral\Models\Star;
use Illuminate\Http\Request;

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
