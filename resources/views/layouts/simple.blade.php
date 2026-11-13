<!doctype html>
<html lang="{{ app()->getLocale() }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>@yield('title')</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 26rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    label { display: block; margin-top: 1rem; }
    input, select, button { font: inherit; padding: .5rem; width: 100%; box-sizing: border-box; }
    button { margin-top: 1.5rem; cursor: pointer; }
    .error { color: #b00020; margin: .25rem 0 0; }
  </style>
</head>
<body>
  <main>@yield('content')</main>
</body>
</html>
