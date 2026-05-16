<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with(['customer'])
            ->when($request->search, fn ($q, $s) =>
                $q->where('id', 'like', "%$s%")
                  ->orWhere('code', 'like', "%$s%")
                  ->orWhereHas('customer', fn ($u) => $u->where('name', 'like', "%$s%")->orWhere('email', 'like', "%$s%")))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    public function show(Order $invoice): JsonResponse
    {
        $invoice->load(['customer', 'products', 'shippingAddress']);
        return response()->json(['data' => $invoice]);
    }

    public function download(Order $invoice)
    {
        $invoice->load(['customer', 'products', 'shippingAddress']);

        $pdf = Pdf::loadView('pdf.invoice', ['order' => $invoice])
            ->setPaper('a4', 'portrait');

        $filename = 'invoice-' . str_pad($invoice->id, 6, '0', STR_PAD_LEFT) . '.pdf';

        return $pdf->download($filename);
    }
}
