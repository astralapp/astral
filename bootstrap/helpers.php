<?php

if(!function_exists('is_json')) {
    function is_json($input)
    {
        json_decode($input);

        return json_last_error() === JSON_ERROR_NONE;
    }
}