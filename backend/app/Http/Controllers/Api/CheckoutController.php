<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\CartService;
use App\Services\CheckoutService;
use App\Services\PaymentService;
use App\Http\Resources\OrderResource;
use Illuminate\Http\Request;
use App\Jobs\SendOrderConfirmation;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(
        private CartService $cartService,
        private CheckoutService $checkoutService,
        private PaymentService $paymentService,
    ) {}

    public function getShippingRates(Request $request): JsonResponse
    {
        $request->validate([
            'country' => 'required|string',
            'state' => 'nullable|string',
            'zip_code' => 'nullable|string',
        ]);

        $items = $this->cartService->getCart($request);
        $rates = $this->checkoutService->getShippingRates($items, $request->only(['country', 'state', 'zip_code']));

        return response()->json($rates);
    }

    public function placeOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_address.name' => 'required|string|max:255',
            'shipping_address.email' => 'required|email',
            'shipping_address.phone' => 'required|string|max:20',
            'shipping_address.address' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.state' => 'nullable|string',
            'shipping_address.country' => 'required|string',
            'shipping_address.zip_code' => 'nullable|string',
            'billing_address' => 'nullable|array',
            'shipping_method' => 'required|string',
            'payment_method' => 'required|string|in:stripe,paypal,cod,bank_transfer',
            'coupon_code' => 'nullable|string',
            'note' => 'nullable|string|max:1000',
        ]);

        $items = $this->cartService->getCart($request);

        if ($items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty.'], 422);
        }

        $order = $this->checkoutService->createOrder($request->user(), $items, $validated);

        // Process payment
        $paymentResult = $this->paymentService->processPayment(
            $order,
            $validated['payment_method'],
            $request->get('payment_data', [])
        );

        $this->cartService->clearCart($request);

        // Dispatch after the checkout transaction has already committed
        SendOrderConfirmation::dispatch($order);

        return response()->json([
            'message' => 'Order placed successfully.',
            'order' => new OrderResource($order),
            'payment' => $paymentResult,
        ], 201);
    }

    public function getPaymentIntent(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.50',
            'currency' => 'nullable|string|size:3',
        ]);

        $intent = $this->paymentService->createStripePaymentIntent(
            $request->amount,
            $request->get('currency', 'USD')
        );

        return response()->json(['client_secret' => $intent->client_secret]);
    }

    public function stripeWebhook(Request $request): JsonResponse
    {
        $this->paymentService->handleStripeWebhook($request);
        return response()->json(['received' => true]);
    }

    public function paypalCapture(Request $request): JsonResponse
    {
        $request->validate(['order_id' => 'required|string']);

        $result = $this->paymentService->capturePaypalOrder($request->order_id);

        return response()->json($result);
    }
}
