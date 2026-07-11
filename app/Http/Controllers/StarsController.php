<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

class StarsController extends Controller
{
    /**
     * Remove the given stars belonging to the authenticated user.
     *
     * @return Response
     */
    public function destroyMany(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        auth()
            ->user()
            ->stars()
            ->whereIn('id', $validated['ids'])
            ->get()
            ->each
            ->delete();

        return redirect()->route('dashboard.show');
    }
}
