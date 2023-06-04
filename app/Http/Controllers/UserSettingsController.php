<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserSettingsController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'key' => ['required', Rule::in(User::AVAILABLE_SETTINGS)],
            'enabled' => 'required|boolean',
        ]);

        auth()->user()->writeSetting($request->input('key'), (bool) $request->input('enabled'));

        return redirect()->route('dashboard.index');
    }
}
