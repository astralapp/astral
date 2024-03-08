<?php

declare(strict_types=1);

namespace App\Transformers;

use Spatie\TypeScriptTransformer\Structures\TransformedType;
use Spatie\TypeScriptTransformer\Transformers\Transformer;

class EnumTransformer implements Transformer
{
    public function transform(\ReflectionClass $class, string $name): ?TransformedType
    {
        $typescriptType = "{\n".collect($class->getConstants())->map(function ($item, $key) {
            return "  {$key}: \"$item->value\"";
        })->implode(",\n")."} as const;\nexport type {$name} = (typeof {$name})[keyof typeof {$name}]";

        return TransformedType::create($class, $name, $typescriptType, null, false, 'const');
    }
}
