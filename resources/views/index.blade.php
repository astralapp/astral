<!doctype html>
<html lang="en" ng-app="astral">
<head>
  <meta charset="UTF-8">
  <title>Astral</title>
  <link rel="icon" type="image/png" href="/images/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="/images/favicon-16x16.png" sizes="16x16" />
  <link rel="stylesheet" type="text/css" href="//fast.fonts.net/cssapi/055c6832-62a2-4b92-a294-454210ba5259.css">
  <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css" rel="stylesheet">
  <!-- <% HTML::style('css/prettify_themes/github.css') %>
  <% HTML::style('bower_components/chosen_v1.1.0/chosen.min.css') %>
  <% HTML::style('bower_components/ng-tags-input/build/ng-tags-input.css') %>
  <% HTML::style('css/app.css') %> -->
  {!! HTML::style('css/app.css') !!}
  <base href="/">
</head>
<body>
  <div ui-view></div>
  @include('partials/scripts')
</body>
</html>
