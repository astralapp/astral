<?php

namespace Astral\Http\Controllers;

use Illuminate\Http\Request;

class UserSettingsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function setShowLanguagetags(Request $request)
    {
        auth()->user()->setShowLanguageTags($request->input('flag'));

        return auth()->user();
    }

    public function setAutosaveNotes(Request $request)
    {
        auth()->user()->setAutosaveNotes($request->input('flag'));

        return auth()->user();
    }
}
