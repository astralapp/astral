<!doctype html>
<html lang="{{ app()->getLocale() }}">

<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Astral is the best way to manage your starred repositories on GitHub using tags, notes and a powerful search feature.">
    <meta name="keywords" content="astral, stars, github, tags, app, organize">
    <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
    <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96">
	<title>Astral</title>
	<link href="https://fonts.googleapis.com/css?family=Karla:400,400i,700" rel="stylesheet">
	<link rel="stylesheet" href="{{ mix('css/app.css') }}">
	<script defer src="https://use.fontawesome.com/releases/v5.0.7/js/all.js"></script>

</head>

<body>
	<div id="app"></div>
	<script src="{{ mix('js/app.js') }}"></script>
</body>

</html>
