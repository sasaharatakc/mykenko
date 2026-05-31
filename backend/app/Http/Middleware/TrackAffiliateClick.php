<?php

namespace App\Http\Middleware;

use App\Models\AffiliateClick;
use App\Models\AffiliateProgram;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackAffiliateClick
{
    // Cookie TTL: 30 days
    private const COOKIE_TTL_DAYS = 30;
    private const COOKIE_NAME = 'mykenko_ref';

    public function handle(Request $request, Closure $next): Response
    {
        $ref = $request->query('ref');

        if ($ref) {
            $program = AffiliateProgram::where('code', $ref)
                ->where('is_active', true)
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->first();

            if ($program) {
                AffiliateClick::create([
                    'affiliate_program_id' => $program->id,
                    'ref_code'             => $ref,
                    'ip_address'           => $request->ip(),
                    'user_agent'           => $request->userAgent(),
                    'landing_page'         => $request->fullUrl(),
                    'referrer'             => $request->headers->get('referer'),
                ]);

                $response = $next($request);

                return $response->withCookie(
                    cookie(self::COOKIE_NAME, $ref, 60 * 24 * self::COOKIE_TTL_DAYS, '/', null, true, true)
                );
            }
        }

        return $next($request);
    }
}
