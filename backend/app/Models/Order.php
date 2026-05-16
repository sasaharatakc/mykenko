<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'orders';

    protected $fillable = [
        'code', 'customer_id', 'store_id',
        'status', 'payment_status', 'payment_method',
        'sub_total', 'tax_amount', 'shipping_amount',
        'discount_amount', 'total_amount',
        'coupon_code', 'coupon_discount',
        'shipping_method', 'shipping_option',
        'tracking_id', 'note', 'private_notes',
        'is_confirmed', 'completed_at', 'token',
        'cancellation_reason', 'proof_file',
        'currency', 'exchange_rate',
        'payment_fee', 'discount_description',
    ];

    protected $casts = [
        'sub_total' => 'float',
        'tax_amount' => 'float',
        'shipping_amount' => 'float',
        'discount_amount' => 'float',
        'total_amount' => 'float',
        'payment_fee' => 'float',
        'coupon_discount' => 'float',
        'exchange_rate' => 'float',
        'is_confirmed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (! $order->code) {
                $order->code = static::generateCode();
            }
            if (! $order->token) {
                $order->token = Str::random(32);
            }
        });
    }

    public static function generateCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (static::where('code', $code)->exists());
        return $code;
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(OrderProduct::class);
    }

    public function shippingAddress(): HasOne
    {
        return $this->hasOne(OrderAddress::class)->where('type', 'shipping');
    }

    public function billingAddress(): HasOne
    {
        return $this->hasOne(OrderAddress::class)->where('type', 'billing');
    }

    public function histories(): HasMany
    {
        return $this->hasMany(OrderHistory::class);
    }

    public function shipment(): HasOne
    {
        return $this->hasOne(Shipment::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'order_id');
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function returns(): HasMany
    {
        return $this->hasMany(OrderReturn::class);
    }

    public function getTotalAmountFormattedAttribute(): string
    {
        return number_format($this->total_amount, 2);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'completed';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function canCancel(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }

    public function canReturn(): bool
    {
        return $this->status === 'completed';
    }
}
