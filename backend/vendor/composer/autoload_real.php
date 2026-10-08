<?php

class ComposerAutoloaderInitNellaiSpecialz
{
    private static $loader;

    public static function getLoader()
    {
        if (null !== self::$loader) {
            return self::$loader;
        }

        spl_autoload_register([__CLASS__, 'loadClass'], true, true);

        self::$loader = true;

        return self::$loader;
    }

    public static function loadClass(string $class): void
    {
        // PSR-4 mapping: PHPMailer\PHPMailer\ -> vendor/phpmailer/phpmailer/src/
        $psr4 = [
            'PHPMailer\\PHPMailer\\' => __DIR__ . '/../phpmailer/phpmailer/src/',
        ];

        foreach ($psr4 as $prefix => $baseDir) {
            $len = strlen($prefix);

            if (strncmp($prefix, $class, $len) !== 0) {
                continue;
            }

            $relativeClass = substr($class, $len);
            $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

            if (is_file($file)) {
                require $file;
                return;
            }
        }
    }
}
