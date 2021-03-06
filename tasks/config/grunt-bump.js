/**
 * Grunt bump
 *
 */
module.exports = function(grunt) {

  grunt.config.set('bump', {
    options: {
      files: ['package.json', 'bower.json'],
      updateConfigs: [],
      commit: true,
      commitMessage: 'Release v%VERSION%',
      commitFiles: ['package.json', 'bower.json'], // '-a' for all files
      createTag: true,
      tagName: 'v%VERSION%',
      tagMessage: 'Version %VERSION%',
      push: true,
      pushTo: 'origin',
      gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
    }

  });

  grunt.loadNpmTasks('grunt-bump');
};
