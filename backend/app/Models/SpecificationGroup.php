<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SpecificationGroup extends Model
{
    use HasFactory;

    protected $table = 'specification_groups';

    protected $fillable = ['specification_table_id', 'name', 'order'];

    protected $casts = ['order' => 'integer'];

    public function table(): BelongsTo
    {
        return $this->belongsTo(SpecificationTable::class, 'specification_table_id');
    }

    public function attributes(): HasMany
    {
        return $this->hasMany(SpecificationAttribute::class, 'specification_group_id');
    }
}
