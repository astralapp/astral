<?php

declare(strict_types=1);

namespace App\Http\Controllers;

class UserController extends Controller
{
    public function revokeGrant()
    {
        auth()->user()->revokeGrant();

        return hybridly()->external(route('auth.destroy'));
    }

    public function destroy()
    {
        $user = auth()->user();
        auth()->logout();
        $user->delete();

        return hybridly()->external(route('login.show'));
    }
}
