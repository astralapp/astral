<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Astral</title>
  <link rel="icon" type="image/png" href="/images/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="/images/favicon-16x16.png" sizes="16x16" />
  <link href='//fonts.googleapis.com/css?family=Karla:400,400italic,700,700italic' rel='stylesheet' type='text/css'>
  <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/highlight.js/latest/styles/github.min.css">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/simplemde/latest/simplemde.min.css">
  {!! Html::style('css/vendor/select2.min.css') !!}
  {!! Html::style('css/vendor/github.css') !!}
  <link rel="stylesheet" href="/css/app.css">
</head>
<body>
<div id="app"></div>
<script src="/js/app.js"></script>
{{-- <script src="{{ elixir("js/app.bundle.js") }}"></script> --}}
@if (App::environment('production'))
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-53631521-1', 'auto');
  ga('send', 'pageview');

</script>
@endif

</body>
</html>
