<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpecificationAttribute extends Model
{
    use HasFactory;

    protected $table = 'specification_attributes';

    protected $fillable = ['specification_group_id', 'name', 'value', 'order'];

    protected $casts = ['order' => 'integer'];

    public function group(): BelongsTo
    {
        return $this->belongsTo(SpecificationGroup::class, 'specification_group_id');
    }
}
