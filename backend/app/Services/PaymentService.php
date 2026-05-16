<?php

namespace App\Services;

use App\Jobs\ProcessStoreRevenue;
use App\Models\Order;
use App\Models\Payment;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Illuminate\Http\Request;

class PaymentService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function processPayment(Order $order, string $method, array $paymentData): array
    {
        return match ($method) {
            'stripe'       => $this->processStripe($order, $paymentData),
            'paypal'       => $this->processPaypal($order, $paymentData),
            'cod'          => $this->processCod($order),
            'bank_transfer'=> $this->processBankTransfer($order),
            default        => throw new \InvalidArgumentException("Unsupported payment method: $method"),
        };
    }

    public function createStripePaymentIntent(float $amount, string $currency = 'USD'): PaymentIntent
    {
        return PaymentIntent::create([
            'amount' => (int) ($amount * 100),
            'currency' => strtolower($currency),
            'automatic_payment_methods' => ['enabled' => true],
        ]);
    }

    public function handleStripeWebhook(Request $request): void
    {
        $payload = $request->getContent();
        $sig = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sig, $secret);
        } catch (\Exception $e) {
            abort(400, $e->getMessage());
        }

        match ($event->type) {
            'payment_intent.succeeded' => $this->handleStripeSuccess($event->data->object),
            'payment_intent.payment_failed' => $this->handleStripeFailed($event->data->object),
            default => null,
        };
    }

    public function capturePaypalOrder(string $paypalOrderId): array
    {
        // PayPal capture implementation
        return ['status' => 'success', 'transaction_id' => $paypalOrderId];
    }

    private function processStripe(Order $order, array $data): array
    {
        $payment = Payment::create([
            'order_id' => $order->id,
            'payment_channel' => 'stripe',
            'amount' => $order->total_amount,
            'currency' => $order->currency ?? 'USD',
            'status' => 'pending',
            'charge_id' => $data['payment_intent_id'] ?? null,
        ]);

        return [
            'method' => 'stripe',
            'status' => 'pending',
            'payment_id' => $payment->id,
        ];
    }

    private function processPaypal(Order $order, array $data): array
    {
        Payment::create([
            'order_id' => $order->id,
            'payment_channel' => 'paypal',
            'amount' => $order->total_amount,
            'status' => 'pending',
            'charge_id' => $data['paypal_order_id'] ?? null,
        ]);

        return ['method' => 'paypal', 'status' => 'pending'];
    }

    private function processCod(Order $order): array
    {
        Payment::create([
            'order_id' => $order->id,
            'payment_channel' => 'cod',
            'amount' => $order->total_amount,
            'status' => 'pending',
        ]);

        return ['method' => 'cod', 'status' => 'pending'];
    }

    private function processBankTransfer(Order $order): array
    {
        Payment::create([
            'order_id' => $order->id,
            'payment_channel' => 'bank_transfer',
            'amount' => $order->total_amount,
            'status' => 'pending',
        ]);

        return ['method' => 'bank_transfer', 'status' => 'pending'];
    }

    private function handleStripeSuccess(object $paymentIntent): void
    {
        $payment = Payment::where('charge_id', $paymentIntent->id)->first();
        if (! $payment) return;

        $payment->update(['status' => 'completed']);
        $order = $payment->order;
        if ($order) {
            $order->update(['payment_status' => 'completed', 'status' => 'processing']);
            ProcessStoreRevenue::dispatch($order);
        }
    }

    private function handleStripeFailed(object $paymentIntent): void
    {
        $payment = Payment::where('charge_id', $paymentIntent->id)->first();
        if ($payment) {
            $payment->update(['status' => 'failed']);
            $payment->order?->update(['payment_status' => 'failed']);
        }
    }
}
