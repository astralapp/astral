<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Requests\UpdateUserSettingsRequest;

class UserSettingsController extends Controller
{
    public function update(UpdateUserSettingsRequest $request)
    {
        auth()->user()->writeSetting($request->key, (bool) $request->enabled);

        return redirect()->route('dashboard.show');
    }
}
