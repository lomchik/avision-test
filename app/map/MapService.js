angular.module('mapApp')
    .factory('MapService', function($http) {

        return {
            get: function () {

            },
            save: function(markers) {
                return $http.post('/api/markers', markers);
            }
        };
    })
    .factory('linesMarker', function() {
        var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs"),
            marker = document.createElementNS("http://www.w3.org/2000/svg", "marker"),
            path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        path.setAttribute('d', 'M0,0 L4,2 L0,4');
        path.setAttribute('fill', 'red');
        marker.setAttribute('id', 'arrow');
        marker.setAttribute('markerWidth', 8);
        marker.setAttribute('markerHeight', 4);
        marker.setAttribute('refX', 6);
        marker.setAttribute('refY', 2);
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');
        marker.appendChild(path);
        defs.appendChild(marker);

        return {
          decorate: function(path, options) {
              var el = path._path;
              if (el.getAttribute('marker-end') == 'url(#arrow)') {
                  return;
              }
              if (!el.parentNode.parentNode.getElementById('arrow')) {

                  el.parentNode.parentNode.appendChild(defs);
                  console.log('add arrow')
              }

              el.setAttribute('marker-end', 'url(#arrow)');
          }
        };
    })
    .factory('ModalService', function ($uibModal) {

        return {
            editPoint: function(point) {
                return $uibModal.open({
                    templateUrl: 'map/edit-point.html',
                    controller: function ($scope, $uibModalInstance, point) {
                        $scope.point = point;
                        $scope.cancel = function() {
                            $uibModalInstance.close();
                        };
                        $scope.save = function(point) {
                            $uibModalInstance.close(point);
                        };
                        $scope.delete = function(point) {
                            point.remove = true;
                            $uibModalInstance.close(point);
                        };
                    },
                    size: 'normal',
                    resolve: {
                        point: function () {
                            return angular.copy(point);
                        }
                    }
                });
            }
        }
    });