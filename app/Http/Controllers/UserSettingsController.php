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
        auth()->user()->setShowLanguageTags($request->input('show'));

        return auth()->user();
    }
}
