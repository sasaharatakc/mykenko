<?php

return [
    'disk_name' => env('MEDIA_DISK', 'public'),
    'max_file_size' => 1024 * 1024 * 10, // 10MB
    'queue_conversions_by_default' => env('QUEUE_CONVERSIONS_BY_DEFAULT', true),
    'media_model' => Spatie\MediaLibrary\MediaCollections\Models\Media::class,
    'use_default_collection_serialization' => false,
    'prefix' => env('MEDIA_PREFIX', ''),
    'moves_media_on_update' => false,
    'version_urls' => false,
    'image_optimizers' => [
        Spatie\ImageOptimizer\Optimizers\Jpegoptim::class => [
            '--strip-all', '--all-progressive', '-m85',
        ],
        Spatie\ImageOptimizer\Optimizers\Pngquant::class => ['--force'],
        Spatie\ImageOptimizer\Optimizers\Optipng::class => ['-i0', '-o2', '-quiet'],
        Spatie\ImageOptimizer\Optimizers\Svgo::class => ['--disable=cleanupIDs'],
        Spatie\ImageOptimizer\Optimizers\Gifsicle::class => ['-b', '-O3'],
        Spatie\ImageOptimizer\Optimizers\Cwebp::class => ['-m 6', '-pass 10', '-mt', '-q 80'],
        Spatie\ImageOptimizer\Optimizers\Avifenc::class => ['-a cq-level=23', '-j all', '--min 1', '--max 63'],
    ],
    'image_generators' => [
        Spatie\MediaLibrary\Conversions\ImageGenerators\Image::class,
        Spatie\MediaLibrary\Conversions\ImageGenerators\Webp::class,
        Spatie\MediaLibrary\Conversions\ImageGenerators\Pdf::class,
        Spatie\MediaLibrary\Conversions\ImageGenerators\Svg::class,
        Spatie\MediaLibrary\Conversions\ImageGenerators\Video::class,
    ],
    'temporary_upload_disk' => 'local',
    'temporary_upload_subdirectory' => 'medialibrary/temp',
    'remote_disk' => null,
    'remote_files_subdirectory' => null,
    'enable_temporary_urls' => true,
    'temporary_urls_expiration_time' => 24,
    'ffmpeg_path' => env('FFMPEG_PATH', '/usr/bin/ffmpeg'),
    'ffprobe_path' => env('FFPROBE_PATH', '/usr/bin/ffprobe'),
    'jobs' => [
        'perform_conversions' => Spatie\MediaLibrary\Conversions\Jobs\PerformConversionsJob::class,
        'generate_responsive_images' => Spatie\MediaLibrary\ResponsiveImages\Jobs\GenerateResponsiveImagesJob::class,
    ],
    'media_downloader' => Spatie\MediaLibrary\Downloaders\DefaultDownloader::class,
    'file_namer' => Spatie\MediaLibrary\Support\FileNamer\DefaultFileNamer::class,
    'path_generator' => null,
    'url_generator' => null,
    'responsive_images' => [
        'width_calculator' => Spatie\MediaLibrary\ResponsiveImages\WidthCalculator\FileSizeOptimizedWidthCalculator::class,
        'use_tiny_placeholders' => true,
        'tiny_placeholder_generator' => Spatie\MediaLibrary\ResponsiveImages\TinyPlaceholderGenerator\Blurred::class,
    ],
    'default_loading_attribute_value' => null,
    'default_responsive_images_breakpoints' => null,
    'image_driver' => env('IMAGE_DRIVER', 'gd'),
];
