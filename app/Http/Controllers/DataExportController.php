<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Lib\ExportUserData;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DataExportController extends Controller
{
    public function __invoke(ExportUserData $export): StreamedResponse
    {
        $data = $export->handle(auth()->user());
        $filename = 'astral-export-' . now()->format('Y-m-d') . '.json';

        return response()->streamDownload(function () use ($data): void {
            echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }, $filename, ['Content-Type' => 'application/json']);
    }
}
