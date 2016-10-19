'use strict';

// Declare app level module which depends on views, and components
angular.module('mapApp', [
  'leaflet-directive', 'ui.bootstrap'
]).
config(function($logProvider){
  $logProvider.debugEnabled(false);
});
