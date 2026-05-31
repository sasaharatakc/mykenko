<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AffiliateConversion;
use App\Models\AffiliateProgram;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AffiliateDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $programs = AffiliateProgram::withCount(['clicks', 'conversions'])
            ->withSum('conversions', 'commission_amount')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $programs]);
    }

    public function summary(): JsonResponse
    {
        $summary = DB::table('affiliate_conversions')
            ->selectRaw('
                COUNT(*) as total_conversions,
                SUM(order_amount) as total_order_amount,
                SUM(commission_amount) as total_commission,
                SUM(CASE WHEN status = "pending" THEN commission_amount ELSE 0 END) as pending_commission,
                SUM(CASE WHEN status = "paid" THEN commission_amount ELSE 0 END) as paid_commission
            ')
            ->first();

        $clickCount = DB::table('affiliate_clicks')->count();

        return response()->json([
            'data' => [
                'total_clicks'       => $clickCount,
                'total_conversions'  => $summary->total_conversions ?? 0,
                'total_order_amount' => $summary->total_order_amount ?? 0,
                'total_commission'   => $summary->total_commission ?? 0,
                'pending_commission' => $summary->pending_commission ?? 0,
                'paid_commission'    => $summary->paid_commission ?? 0,
                'cvr'                => $clickCount > 0
                    ? round(($summary->total_conversions / $clickCount) * 100, 2)
                    : 0,
            ],
        ]);
    }

    public function conversions(Request $request): JsonResponse
    {
        $conversions = AffiliateConversion::with(['program', 'order'])
            ->when($request->ref, fn($q) => $q->where('ref_code', $request->ref))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(50);

        return response()->json($conversions);
    }

    public function approve(int $id): JsonResponse
    {
        $conversion = AffiliateConversion::findOrFail($id);
        $conversion->update(['status' => 'approved']);

        return response()->json(['data' => $conversion]);
    }
}
