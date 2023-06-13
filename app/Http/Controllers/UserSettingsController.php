<?php

namespace App\Http\Controllers;

use App\Data\UpdateUserSettingsRequest;

class UserSettingsController extends Controller
{
    public function update(UpdateUserSettingsRequest $request)
    {
        auth()->user()->writeSetting($request->key, (bool) $request->enabled);

        return redirect()->route('dashboard.show');
    }
}
