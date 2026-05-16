<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $table = 'invoice_items';

    protected $fillable = [
        'invoice_id', 'reference_id', 'reference_type',
        'name', 'description', 'image',
        'qty', 'sub_total', 'tax_amount', 'amount',
    ];

    protected $casts = [
        'qty' => 'integer',
        'sub_total' => 'float',
        'tax_amount' => 'float',
        'amount' => 'float',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
