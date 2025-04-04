<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DownloadController extends Controller
{
    public function download(Request $request)
    {
        $domain = $request->query('domain');
        $format = $request->query('format', 'csv'); // Default to CSV
        $records = $request->query('records'); // Assume records are passed via query

        if (!$domain || !$records) {
            return response()->json(['error' => 'Invalid request data.'], 400);
        }

        $records = json_decode($records, true); // Decode records from JSON

        if ($format === 'csv') {
            $csvData = $this->generateCSV($records);
            return response($csvData)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', "attachment; filename={$domain}.csv");
        }

        if ($format === 'zone') {
            $zoneData = $this->generateZoneFile($records, $domain);
            return response($zoneData)
                ->header('Content-Type', 'text/plain')
                ->header('Content-Disposition', "attachment; filename={$domain}.zone");
        }

        return response()->json(['error' => 'Unsupported format.'], 400);
    }

    private function generateCSV(array $records): string
    {
        $output = fopen('php://temp', 'r+');
        fputcsv($output, ['Name', 'Type', 'Value', 'TTL', 'Priority']);
        foreach ($records as $record) {
            fputcsv($output, [
                $record['name'] ?? '',
                $record['type'] ?? '',
                $record['value'] ?? '',
                $record['ttl'] ?? '',
                $record['priority'] ?? '',
            ]);
        }
        rewind($output);
        return stream_get_contents($output);
    }

    private function generateZoneFile(array $records, string $domain): string
    {
        $zoneFile = "\$ORIGIN {$domain}.\n\$TTL 3600\n";

        foreach ($records as $record) {
            $name = $record['name'] ?? '@';
            $type = $record['type'] ?? '';
            $value = $record['value'] ?? '';
            $ttl = $record['ttl'] ?? 3600;
            $priority = $record['priority'] ?? null;

            if (!str_ends_with($value, '.') && $type !== 'TXT') {
                $value .= '.';
            }

            if ($type === 'MX' && $priority) {
                $zoneFile .= "{$name}. {$ttl} IN MX {$priority} {$value}\n";
            } elseif ($type === 'CNAME') {
                $zoneFile .= "{$name}. {$ttl} IN CNAME {$value}\n";
            } elseif (in_array($type, ['A', 'AAAA'])) {
                $zoneFile .= "{$name}. {$ttl} IN {$type} {$value}\n";
            } elseif ($type === 'TXT') {
                $zoneFile .= "{$name}. {$ttl} IN TXT \"{$value}\"\n";
            } elseif ($type === 'NS') {
                $zoneFile .= "{$name}. {$ttl} IN NS {$value}\n";
            }
        }

        return $zoneFile;
    }
}