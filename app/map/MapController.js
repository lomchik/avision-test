angular.module('mapApp').controller('MapController', function($scope, $http, leafletData, linesMarker,  ModalService, MapService) {
    angular.extend($scope, {
        center: {
            lat: 50.4546600,
            lng: 30.5238000,
            zoom: 12
        },
        defaults: {
            scrollWheelZoom: true
        },
        events: {
            map: {
                enable: ['drag', 'click'],
                logic: 'emit'
            }
        },
        markers: {},
        paths: {
            path: {
                type: 'multiPolyline',
                latlngs: [],
                color: "red",
                weight: 2
            }
        }
    });
    leafletData.getPaths().then(function(paths) {
        $scope.path = paths;
    });
    $scope.searchIP = function(ip) {
        var url = "http://freegeoip.net/json/" + ip;
        $http.get(url).success(function(res) {
            $scope.center = {
                lat: res.latitude,
                lng: res.longitude,
                zoom: 12
            };
            $scope.ip = res.ip;
        });
    };

    var enumMarkers = function() {
        var index = 1;
        var sortedMarkers = _.keys($scope.markers).sort();
        sortedMarkers.forEach(function(id) {
            var marker = $scope.markers[id];
            marker.icon.html = marker.number = index++
        });
    };
    var removePointFromPaths = function(marker) {
        var start, end, pathsToRemove = [], paths = $scope.paths.path.latlngs;
        paths.forEach(function(path, i) {
            if (path[0].id == marker.id) {
                end = path[1];
                pathsToRemove.push(path);
            }
            if (path[1].id == marker.id) {
                start = path[0];
                pathsToRemove.push(path);
            }
        });
        pathsToRemove.forEach(function(path) {
            paths.splice(paths.indexOf(path),1);
        });
        if (start && end) {
            paths.push([start, end]);
        }
    };
    var openModal = function(marker) {
        ModalService.editPoint(marker)
            .result.then(function(model) {
            if (model) {
                if (model.remove) {
                    delete $scope.markers[model.id];
                    removePointFromPaths(model);
                }
                else {
                    angular.extend(marker, model);
                }
            }
        });
    };
    var saveMarkers = function(markers) {
        MapService.save(markers).then(function () {
          console.log('saved')
      }, function (err) {
          console.warn('error while saving : ' + err.statusText);
      })
    };


    $scope.$watch('markers', enumMarkers, true);
    $scope.$watch('markers', _.debounce(saveMarkers, 5000), true);
    $scope.$on('leafletDirectiveMarker.dblclick',function (e,marker) {
        var marker = _($scope.markers).findWhere({id: marker.model.id});
        openModal(marker);

    });
    $scope.$on('leafletDirectiveMap.click', function(event, args){
        var sortedMarks = _.keys($scope.markers).sort(),
            lastMark = sortedMarks[sortedMarks.length-1];
        var id = (new Date).getTime();
        $scope.markers[id] = {
            number: null,
            height: null,
            lat: args.leafletEvent.latlng.lat,
            lng: args.leafletEvent.latlng.lng,
            focus: true,
            draggable: true,
            id: id,
            icon: {
                type: 'div',
                className: 'round-marker',
                iconSize: [12, 12],
                popupAnchor:  [6, 6],
                html: ''
            }
        };
        if (lastMark) {
            $scope.paths.path.latlngs.push([$scope.markers[lastMark], $scope.markers[id]]);
        }
    });
    $scope.$on('leafletDirectiveMarker.dragend',function (e,marker) {
        $scope.markers[marker.model.id] = marker.model;
        $scope.paths.path.latlngs.forEach(function(array, i) {
            array.forEach(function(value, j) {
                if (value.id == marker.model.id) {
                    $scope.paths.path.latlngs[i][j] = marker.model;
                }
            });
        })
    });
    $scope.$watch(function () {
        return $scope.path.path && Object.keys($scope.path.path._layers).length;
    }, function(newVal) {
        if (typeof $scope.path.path == 'object') {
            for (var i in $scope.path.path._layers) {
                linesMarker.decorate($scope.path.path._layers[i]) ;
            }
        }
    });

    $scope.searchIP("");
});