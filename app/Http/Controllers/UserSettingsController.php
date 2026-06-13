<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Requests\UpdateAppearanceRequest;
use App\Requests\UpdateUserSettingsRequest;

class UserSettingsController extends Controller
{
    public function update(UpdateUserSettingsRequest $request)
    {
        auth()->user()->writeSetting($request->key, (bool) $request->enabled);

        return redirect()->route('dashboard.show');
    }

    public function updateAppearance(UpdateAppearanceRequest $request)
    {
        auth()->user()->writeSetting('appearance', $request->appearance->value);

        return redirect()->route('dashboard.show');
    }
}
