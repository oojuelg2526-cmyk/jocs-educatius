<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('titulo') · Jocs per aprendre</title>
    <style>
        body { font-family: Georgia, serif; background: #f4ecd8; color: #3b2f1e; margin: 0; }
        main { max-width: 34rem; margin: 3rem auto; padding: 0 1rem; }
        h1 { font-size: 2rem; }
        form { display: grid; gap: .9rem; }
        label { display: grid; gap: .3rem; font-weight: bold; }
        input[type=text], input[type=password] { padding: .6rem; font-size: 1rem; border: 1px solid #8a7550; border-radius: 4px; }
        button { padding: .7rem; font-size: 1rem; background: #7a4b1e; color: #fff; border: 0; border-radius: 4px; cursor: pointer; }
        .error { color: #9b1c1c; font-weight: bold; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border-bottom: 1px solid #c9b88f; padding: .4rem; text-align: left; }
    </style>
</head>
<body>
    <main>@yield('contenido')</main>
</body>
</html>
