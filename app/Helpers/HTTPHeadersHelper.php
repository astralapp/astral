<?php

namespace Astral\Helpers;

class HTTPHeadersHelper
{
    /**
     * @param string $h
     *
     * @return array
     */
    public static function rels($h)
    {
        $h = 'Link: '.$h;
        $h = preg_replace("/(\r\n|\r)/", "\n", $h);
        $h = explode("\n", preg_replace("/(\n)[ \t]+/", ' ', $h));
        $rels = [];
        foreach ($h as $f) {
            if (! strncmp($f, 'X-Pingback: ', 12)) {
                // convert to a link header and have common code handle it
                $f = 'Link: <'.trim(substr($f, 12)).'>; rel="pingback"';
            }
            if (! strncmp($f, 'Link: ', 6)) {
                $links = explode(', ', trim(substr($f, 6)));
                foreach ($links as $link) {
                    $hrefandrel = explode('; ', $link);
                    $href = trim($hrefandrel[0], '<>');
                    $relarray = '';
                    foreach ($hrefandrel as $p) {
                        if (! strncmp($p, 'rel=', 4)) {
                            $relarray = explode(' ', trim(substr($p, 4), '"\''));
                            break;
                        }
                    }
                    if ($relarray !== '') { // ignore Link: headers without rel
                        foreach ($relarray as $rel) {
                            $rel = strtolower(trim($rel));
                            if ($rel != '') {
                                if (! array_key_exists($rel, $rels)) {
                                    $rels[$rel] = [];
                                }
                                if (! in_array($href, $rels[$rel])) {
                                    $rels[$rel][] = $href;
                                }
                            }
                        }
                    }
                }
            }
        }

        return $rels;
    }
}
