<?php

declare(strict_types=1);

use Hybridly\Support\Configuration\Architecture;

return [
    /*
    |--------------------------------------------------------------------------
    | Route filters
    |--------------------------------------------------------------------------
    | This option defines which routes Hybridly will expose to the frontend.
    |
    | By default, all vendor routes are hidden, but you may selectively expose
    | them by adding the vendor to the `allowed_vendors` array.
    |
    | Additionally, you may also exclude your own routes by adding them to the
    | `exclude` array. Filters in the `exclude` array support wildcards (*).
    */
    'router' => [
        'allowed_vendors' => [
            'laravel/fortify',
        ],
        'exclude' => [
            // 'admin*'
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Architecture
    |--------------------------------------------------------------------------
    | Hybridly has a flexible architecture implementation. By default,
    | views, layouts and components in the `resources` directory
    | will be used, but you may change this behavior below.
    |
    | See: https://hybridly.dev/guide/architecture.html
    */
    'architecture' => [
        'load_default_module' => true,
        'eager_load_views' => true,
        'root_directory' => 'resources',
        'application_directory' => 'application',
        'application_main' => Architecture::APPLICATION_MAIN,
        'root_view' => Architecture::ROOT_VIEW,
        'extensions' => ['vue'],
        'excluded_views_directories' => [],
    ],

    /*
    |--------------------------------------------------------------------------
    | Refining
    |--------------------------------------------------------------------------
    | When refininig queries, the `sorts_key` and `filters_key` options
    | define the names of the query parameters that will be generated
    | using the provided front-end utilities.
    |
    | See: https://hybridly.dev/guide/refining.html
    */
    'refining' => [
        'sorts_key' => 'sort',
        'filters_key' => 'filters',
    ],

    /*
    |--------------------------------------------------------------------------
    | Tables
    |--------------------------------------------------------------------------
    | The `tables` option defines the endpoint that will be used to
    | invoke table actions, as well as the name of the route
    | that will be used to generate the endpoint URL.
    |
    | See: https://hybridly.dev/guide/tables.html
    */
    'tables' => [
        'enable_actions' => true,
        'actions_endpoint' => 'invoke',
        'actions_endpoint_name' => 'hybridly.action.invoke',
        'actions_endpoint_middleware' => [],
    ],

    /*
    |--------------------------------------------------------------------------
    | Testing
    |--------------------------------------------------------------------------
    | When `ensure_views_exist` is enabled, Hybridly will ensure that views
    | actually exist on the disk when hybrid testing utilities are used.
    */
    'testing' => [
        'ensure_views_exist' => true,
    ],
];
