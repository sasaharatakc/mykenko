# /laravel-patterns — Laravelコーディングパターン

## 用途
MYKENKOのLaravel実装で使う標準パターンを適用する。

## サービスクラスパターン
```php
// Controller → Service → Repository
class OrderController extends Controller
{
    public function __construct(private OrderService $service) {}
    
    public function store(OrderRequest $request): JsonResponse
    {
        $order = $this->service->createOrder(
            $request->user(), 
            $request->validated()
        );
        return response()->json(['data' => OrderResource::make($order)], 201);
    }
}
```

## FormRequest バリデーション
```php
class OrderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ];
    }
}
```

## API Resource
```php
class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'total' => $this->total,
            'items' => OrderItemResource::collection($this->items),
        ];
    }
}
```
