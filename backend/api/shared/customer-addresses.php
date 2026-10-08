<?php

declare(strict_types=1);

function customerAddressColumns(PDO $db): array
{
    $statement = $db->query('SHOW COLUMNS FROM customer_addresses');
    $available = array_column($statement->fetchAll(), 'Field');
    $candidates = [
        'id' => ['id'],
        'customer_id' => ['customer_id'],
        'label' => ['label'],
        'full_name' => ['full_name'],
        'phone' => ['phone'],
        'address_line1' => ['address_line1', 'address_line_1'],
        'address_line2' => ['address_line2', 'address_line_2'],
        'city' => ['city'],
        'state' => ['state'],
        'postal_code' => ['postal_code', 'pincode'],
        'country' => ['country'],
        'is_default' => ['is_default'],
        'created_at' => ['created_at'],
        'updated_at' => ['updated_at'],
    ];
    $columns = [];

    foreach ($candidates as $logicalName => $names) {
        foreach ($names as $name) {
            if (in_array($name, $available, true)) {
                $columns[$logicalName] = $name;
                break;
            }
        }
    }

    $required = ['id', 'customer_id', 'label', 'full_name', 'phone', 'address_line1', 'city', 'state', 'postal_code', 'country', 'is_default', 'updated_at'];
    $missing = array_values(array_diff($required, array_keys($columns)));
    if ($missing !== []) {
        throw new RuntimeException('customer_addresses is missing required columns: ' . implode(', ', $missing));
    }

    return $columns;
}

function customerAddressColumn(array $columns, string $logicalName): string
{
    if (!isset($columns[$logicalName])) {
        throw new RuntimeException('customer_addresses does not support ' . $logicalName . '.');
    }

    return '`' . $columns[$logicalName] . '`';
}

function customerAddressSelect(array $columns): string
{
    $fields = [
        'id' => 'id',
        'label' => 'label',
        'full_name' => 'full_name',
        'phone' => 'phone',
        'address_line1' => 'address_line1',
        'address_line2' => 'address_line2',
        'city' => 'city',
        'state' => 'state',
        'postal_code' => 'postal_code',
        'country' => 'country',
        'is_default' => 'is_default',
        'created_at' => 'created_at',
        'updated_at' => 'updated_at',
    ];
    $select = [];
    foreach ($fields as $logicalName => $alias) {
        if (isset($columns[$logicalName])) {
            $select[] = customerAddressColumn($columns, $logicalName) . ' AS `' . $alias . '`';
        } elseif ($logicalName === 'address_line2') {
            $select[] = 'NULL AS `address_line2`';
        } elseif ($logicalName === 'created_at') {
            $select[] = 'NULL AS `created_at`';
        }
    }
    $select[] = customerAddressColumn($columns, 'address_line1') . ' AS `address_line_1`';
    $select[] = customerAddressColumn($columns, 'postal_code') . ' AS `pincode`';

    return implode(', ', $select);
}
