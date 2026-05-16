<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GlobalOptionValue extends Model
{
    use HasFactory;

    protected $table = 'global_option_values';

    protected $fillable = [
        'option_id', 'name', 'price', 'price_type',
        'image', 'order',
    ];

    protected $casts = [
        'price' => 'float',
        'order' => 'integer',
    ];

    public function option(): BelongsTo
    {
        return $this->belongsTo(GlobalOption::class, 'option_id');
    }
}
