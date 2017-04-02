<?php

namespace Astral\Http\Controllers;

use Log;
use Auth;
use JWTAuth;
use Storage;
use Socialite;
use Astral\Models\Star;
use Astral\Models\User;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth', ['only' => ['fetchUser', 'setAutotag', 'exportData', 'seenPatreonNotice']]);
    }

    /**
     * Redirect the user to the GitHub authentication page.
     *
     * @return Response
     */
    public function redirectToProvider()
    {
        return Socialite::driver('github')->redirect();
    }

    /**
     * Obtain the user information from GitHub.
     *
     * @return Response
     */
    public function handleProviderCallback(Request $request)
    {
        if (isset($request['error'])) {
            return redirect('/auth?error=true');
        }
        $githubUser = Socialite::driver('github')->user();
        $id = $githubUser->getId();
        $user = User::where('github_id', $id)->first();
        // If the user exists, just update fields that they may have changed in their Github settings
        if (! is_null($user)) {
            $user->mapGithubUser($githubUser);
        } // If no user was found, create a new one
        else {
            $user = new User();
            $user->mapGithubUser($githubUser);
        }
        $jwt = JWTAuth::fromUser($user);

        return redirect('/auth?token='.$jwt);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchUser()
    {
        return Auth::user();
    }

    public function setAutotag(Request $request)
    {
        $state = (int) $request->input('state');
        $user = Auth::user();
        $user->autotag = $state;
        $user->save();

        return Auth::user();
    }

    public function seenPatreonNotice(Request $request)
    {
        $user = Auth::user();
        $user->seen_patreon_notice = true;
        $user->save();

        return Auth::user();
    }

    public function exportData()
    {
        $stars = Star::withTags()->get()->reverse()->toJson();
        $path = Auth::user()->username.'_astral_data.json';
        Storage::disk('public')->put($path, $stars);

        return response()->download(public_path().'/storage/'.$path)->deleteFileAfterSend(true);
    }

    public function logout()
    {
        if ($token = JWTAuth::getToken()) {
            try {
                JWTAuth::invalidate($token);
            } catch (Exception $e) {
                Log::error($e);
            }
        }

        return redirect('auth');
    }
}
