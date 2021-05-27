require('angular');
require('angular-ui-bootstrap');

require('./modules/notifications.js');

angular.module('munimap', ['munimapBase.notification', 'ui.bootstrap'])

    .directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }])

    .service('fileUpload', ['$http', '$q', function ($http, $q) {
        this.uploadFileToUrl = function(file, uploadUrl, name){
            var deferred = $q.defer();
            var formData = new FormData();                  
            formData.append('file', file);
            formData.append('projectName', name);

            var promise = $http({
                method: 'POST',
                url: uploadUrl,
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            });
            promise.then(function(response) {
                deferred.resolve(response.data);
            }, function(response) {
                if(response.status === -1) {
                    deferred.reject({'message': self.serviceUnavailableMessage});
                } else {
                    deferred.reject(response.data);
                }
            });

            return deferred.promise;
        };
    }])

    .service('saveDefaultSettings', ['$http', '$q', function ($http, $q) {
        this.save = function(url, settingsID, projectName){
            var deferred = $q.defer();
            var formData = {
                'projectName': projectName,
                'defaultSettingsID': settingsID
            };
            var promise = $http({
                method: 'POST',
                url: url,
                data: formData
            });
            promise.then(function(response) {
                deferred.resolve(response.data);
            }, function(response) {
                if(response.status === -1) {
                    deferred.reject({'message': self.serviceUnavailableMessage});
                } else {
                    deferred.reject(response.data);
                }
            });

            return deferred.promise;
        };
    }])

    .controller('baseController', ['$scope', '$uibModal', 'saveDefaultSettings', 
        function($scope, $uibModal, saveDefaultSettings){
            if (typeof(defaultSettings) !== 'undefined') {
                $scope.model = defaultSettings;  
            }
            $scope.changeDefaultProject = function(settingsID, projectName) {
                var url = '/user/settings/default/update';
                saveDefaultSettings.save(url, settingsID, projectName);
            };

            $scope.openUploadModal = function(name) {
                $uibModal.open({
                    animation: false,
                    templateUrl: 'uploadModalContent.html',
                    size: 'lg',
                    controller: 'uploadModalController',
                    resolve: {
                        projectName: function() {
                            return name;
                        }
                    }
                }).result.then(function(){}, function(res){});
            };

        }])

    .controller('uploadModalController', ['projectName', '$scope', 'fileUpload', '$uibModalInstance', 'NotificationService',
        function(projectName, $scope, fileUpload, $uibModalInstance, NotificationService) {
            $scope.close = $uibModalInstance.dismiss;
            $scope.uploadFile = function(){
                var file = $scope.myFile;
                var uploadUrl = '/user/settings/import';

                fileUpload.uploadFileToUrl(file, uploadUrl, projectName).then(function(data) {
                    $uibModalInstance.dismiss;
                    $scope.close();
                    if (data.success) {
                        NotificationService.addInfo(data.message);
                        location.reload();
                    } else {
                        NotificationService.addError(data.message);
                    }
                }, function() {
                    NotificationService.addError(data.message);
                });
            };
        }
    ]);
   
angular.element(document).ready(function() {
    angular.bootstrap(document, ['munimap']);
});