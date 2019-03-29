<?php

namespace Astral\Http\Controllers;

use Illuminate\Support\Facades\Storage;

class StarsController extends Controller
{
    public function index()
    {
        return auth()->user()->stars()->with('tags')->get();
    }

    public function export()
    {
        $this->middleware('throttle:1,2');
        $stars = auth()->user()->stars()->with('tags')->get()->reverse()->toJson();
        $jsonPath = auth()->user()->username.'_astral_data.json';
        Storage::disk('public')->put($jsonPath, $stars);

        return response()->download(storage_path("app/public/{$jsonPath}"))->deleteFileAfterSend(true);
    }
}
