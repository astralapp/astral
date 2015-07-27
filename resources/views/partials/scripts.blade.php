{!! HTML::script('bower_components/jquery/dist/jquery.min.js') !!}
{!! HTML::script('bower_components/angular/angular.min.js') !!}
{!! HTML::script('bower_components/angular-ui-router/release/angular-ui-router.min.js') !!}
{!! HTML::script('bower_components/angular-animate/angular-animate.min.js') !!}
{!! HTML::script('bower_components/angular-classy/angular-classy.min.js') !!}

{!! HTML::script('js/app.js') !!}
<script>
  angular.module('astral').constant('CSRF_TOKEN', '{{ csrf_token() }}');
</script>
