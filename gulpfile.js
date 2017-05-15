(function() {
  'use strict';

  // Add gulp help functionality.
  let gulp = require('gulp-help')(require('gulp'));
  let shell = require('gulp-shell');
  let path = require('path');
  let fs = require('fs');
  let ts = require('gulp-typescript');
  let insert = require('gulp-insert');

  const DIR_SERVER = path.join(__dirname, 'server');
  const DIR_UPLOAD = path.join(DIR_SERVER, 'upload');
  const DIR_JS = path.join(__dirname, '/client/js/');
  const DIR_SERVER_JS = path.join(DIR_SERVER, '/js/');
  const PATH_TS = path.join(__dirname, '/client/src/', '/**/*.ts');
  const PATH_TS_SERVER = path.join(DIR_SERVER, '/src/**/*.ts');
  const PATH_AMD_LOADER = path.join(__dirname,'client/vendor/almond.js');

  function compile(project) {
    return project.src().pipe(project()).js;
  }

  gulp.task('ts', 'Compile typescript files into bundle.js', () => {
    let project = ts.createProject(__dirname + '/client/tsconfig.json');
    return compile(project)
      .pipe(insert.prepend(fs.readFileSync(PATH_AMD_LOADER)))
      .pipe(gulp.dest(DIR_JS));
  });

  gulp.task('ts-server', 'Compile typescript server files.', () => {
    let project = ts.createProject(__dirname + '/server/tsconfig.json');
    return compile(project)
      .pipe(gulp.dest(DIR_SERVER_JS));
  });

  gulp.task('npm-install', 'Install npm dependencies.',
            shell.task(['npm install']));

  gulp.task('clean', 'Remove uploaded clips.',
            shell.task([`git clean -idx ${DIR_UPLOAD}`]));

  gulp.task('listen', 'Run development server.', () => {
    require('gulp-nodemon')({
      script: 'server/js/server.js',
      // Use [c] here to workaround nodemon bug #951
      watch: ['server/js', '[c]onfig.json'],
      delay: 2.5,
    });
  });

  gulp.task('watch', 'Rebuild, rebundle, re-install on file changes.', () => {
    gulp.watch('package.json', ['npm-install']);
    gulp.watch(PATH_TS, ['ts']);
    gulp.watch(PATH_TS_SERVER, ['ts-server']);
  });

  gulp.task('default', 'Running just `gulp`.',
            ['ts', 'ts-server', 'watch', 'listen']);
})();
