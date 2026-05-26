# /webhook-setup — Webhook設計

## 用途
システム間のリアルタイムデータ連携をWebhookで実装する。

## Webhook実装（Laravel受信側）
```php
Route::post('/webhook/stripe', [StripeWebhookController::class, 'handle'])
    ->withoutMiddleware(['throttle:api']);

public function handle(Request $request)
{
    $signature = $request->header('Stripe-Signature');
    $event = Stripe::constructEvent($request->getContent(), $signature, config('stripe.webhook_secret'));
    
    match($event->type) {
        'payment_intent.succeeded' => $this->handlePaymentSuccess($event->data->object),
        'customer.subscription.deleted' => $this->handleCancellation($event->data->object),
        default => null,
    };
    
    return response()->json(['status' => 'received']);
}
```

## セキュリティ
- シグネチャ検証を必ず実装する
- Webhookエンドポイントのレート制限を設定する
- 冪等性キーで重複処理を防ぐ
