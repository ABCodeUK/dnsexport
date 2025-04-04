<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DNSController extends Controller
{
    public function lookup(Request $request)
    {
        $request->validate([
            'domain' => 'required|string',
            'subdomains' => 'array',
        ]);

        $domain = $request->input('domain');
        $selectedSubdomains = $request->input('subdomains', []);
        $apiKey = config('services.dns_api.key');
        
        // Include main domain first
        $allDomainsToCheck = [$domain];
        
        // Add all selected subdomains
        foreach ($selectedSubdomains as $sub) {
            $allDomainsToCheck[] = "{$sub}.{$domain}";
        }

        try {
            $records = [];

            // Rest of the function remains the same...
            foreach ($allDomainsToCheck as $key => $domainToCheck) {
                $isSubdomain = $key > 0; // First entry is main domain
                $isWWW = $domainToCheck === "www.{$domain}";

                $response = Http::withHeaders([
                    'X-Api-Key' => $apiKey,
                ])->get("https://api.api-ninjas.com/v1/dnslookup?domain={$domainToCheck}");

                if ($response->ok()) {
                    $transformedRecords = $this->transformRecords($response->json(), $domainToCheck, $isSubdomain, $isWWW);
                    $records = array_merge($records, $transformedRecords);
                } elseif ($key === 0) {
                    return response()->json([
                        'error' => 'Failed to fetch DNS records for the main domain.',
                    ], 422);
                }
            }

            return response()->json(['records' => $records]);
        } catch (\Exception $e) {
            Log::error('DNS Lookup Error: ', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'An error occurred while fetching DNS records. Please try again later.',
            ], 500);
        }
    }

    /**
     * Transform records, omitting SOA records and filtering A/AAAA records for subdomains.
     */
    private function transformRecords(array $records, string $domain, bool $isSubdomain = false, bool $isWWW = false): array
    {
        return array_filter(array_map(function ($record) use ($domain, $isSubdomain, $isWWW) {
            $type = $record['record_type'] ?? 'Unknown';
            $name = $record['name'] ?? $domain;

            // Exclude SOA records from the results
            if ($type === 'SOA') {
                return null;
            }

            // For subdomains, include only certain record types
            if ($isSubdomain && !$isWWW) {  // Modified this condition to exclude www from subdomain filtering
                // Exclude A/AAAA records for other subdomains
                if (!in_array($type, ['CNAME', 'MX', 'TXT', 'NS'])) {
                    return null;
                }
            }

            // Use TTL from API if provided; otherwise, set to null
            return [
                'type' => $type,
                'name' => $name,
                'value' => $record['value'] ?? '',
                'ttl' => $record['ttl'] ?? null,
                'priority' => $record['priority'] ?? null,
            ];
        }, $records));
    }
}