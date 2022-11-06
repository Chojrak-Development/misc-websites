/*
    Build script for error-handlers.

    https://github.com/Chojrak-Development/misc-websites

    This script MUST be run with working directory set to project's root!

    License: Apache License, Version 2.0
    (C) Chojrak Development 2022
*/
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const sass = require('sass');
const postcss = require('postcss');
const postcssPresetEnv = require('postcss-preset-env');
const autoprefixer = require('autoprefixer');
const cheerio = require('cheerio');
const { minify } = require('html-minifier-terser');

// Recreate folder
fs.rmSync('dist/error-pages', { recursive: true, force: true }, (err) => {
	if (err) {
		throw err;
	}
});
fs.mkdirSync('dist/error-pages', { recursive: true });

// Compile and inject style.scss
const scssResult = sass.compile('src/error-pages/styles.scss', {
	style: 'compressed',
});

postcss([autoprefixer, postcssPresetEnv])
	.process(scssResult.css, {
		from: 'src/error-pages/base.scss',
	})
	.then((cssResult) => {
		let rawerrors = fs.readFileSync('src/error-pages/errors.json');
		let errors = JSON.parse(rawerrors);

		for (const error in errors) {
			const $ = cheerio.load(
				fs.readFileSync('src/error-pages/base.html')
			);
			$('.title').append(errors[error].title);
			$('title').append(errors[error].title);
			$('.text').append(errors[error].content);
			$('head').append('<style>' + cssResult.css + '</style>');

			minify($.html(), {
				caseSensitive: true,
				continueOnParseError: true,
				html5: true,
				minifyJS: true,
				minifyURLs: true,
				removeComments: true,
				removeEmptyAttributes: true,
				useShortDoctype: true,
				collapseWhitespace: true,
			}).then((result) => {
				fs.writeFileSync(
					'dist/error-pages/' + error + '.html',
					result,
					{
						flag: 'w+',
					}
				);
			});
		}
	});
