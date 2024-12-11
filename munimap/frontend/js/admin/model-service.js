angular.module('munimapAdmin')

    .provider('ModelService', [function() {

        var _model = {
            configs: undefined,
            layers: undefined,
            protectedLayers: undefined,
            protectedLayersList: [],
            missingProtectedLayers: [],
            projects: undefined,
            protectedProjects: undefined,
            missingProtectedProjects: [],
            protectedProjectsList: [],
            groups: undefined,
            users: undefined,
            logs: undefined,
            enviroment: undefined,
            selectionlists: undefined,
            plugins: undefined
        };

        this.initModel = function(model) {
            angular.extend(_model, model);
        };

        this.$get = [
            '$location', '$http', '$httpParamSerializer', 'NotificationService', 'GroupAddUserUrl', 'GroupRemoveUserUrl',
            'GroupAddLayerUrl', 'GroupRemoveLayerUrl', 'GroupAddProjectUrl', 'GroupRemoveProjectUrl',
            'ProtectProjectUrl', 'UnprotectProjectUrl', 'ProtectLayerUrl', 'UnprotectLayerUrl',
            'RemoveGroupUrl', 'AddGroupUrl', 'EditGroupUrl', 'CSRFToken',
            'AddProjectUrl', 'EditProjectUrl', 'RemoveProjectUrl', 'LoadProjectUrl',
            'LoadMapConfigUrl', 'AddMapConfigUrl', 'UpdateMapConfigUrl', 'RemoveMapConfigUrl',
            'TransferProjectConfigUrl', 'TransferMapConfigUrl', 'RenameMapConfigUrl', 'LoadLayersUrl', 'RemoveLogUrl',
            'RenameProjectConfigUrl', 'AddUserUrl', 'EditUserUrl', 'LoadUserUrl', 'RemoveUserUrl',
            'LoadSelectionlistUrl', 'EditSelectionlistUrl', 'AddSelectionlistUrl', 'RemoveSelectionlistUrl',
            'RenameSelectionlistConfigUrl',
            'LoadPluginUrl', 'EditPluginUrl', 'AddPluginUrl', 'RemovePluginUrl', 'RenamePluginConfigUrl',
            function($location, $http, $httpParamSerializer, NotificationService, GroupAddUserUrl, GroupRemoveUserUrl,
                GroupAddLayerUrl, GroupRemoveLayerUrl, GroupAddProjectUrl, GroupRemoveProjectUrl,
                ProtectProjectUrl, UnprotectProjectUrl, ProtectLayerUrl, UnprotectLayerUrl,
                RemoveGroupUrl, AddGroupUrl, EditGroupUrl, CSRFToken,
                AddProjectUrl, EditProjectUrl, RemoveProjectUrl, LoadProjectUrl,
                LoadMapConfigUrl, AddMapConfigUrl, UpdateMapConfigUrl, RemoveMapConfigUrl,
                TransferProjectConfigUrl, TransferMapConfigUrl, RenameMapConfigUrl, LoadLayersUrl, RemoveLogUrl,
                RenameProjectConfigUrl, AddUserUrl, EditUserUrl, LoadUserUrl, RemoveUserUrl,
                LoadSelectionlistUrl, EditSelectionlistUrl, AddSelectionlistUrl, RemoveSelectionlistUrl,
                RenameSelectionlistConfigUrl,
                LoadPluginUrl, EditPluginUrl, AddPluginUrl, RemovePluginUrl, RenamePluginConfigUrl
            ) {

                var Model = function(model) {
                    var self = this;
                    angular.extend(this, model);

                    angular.forEach(this.protectedLayers, function(layer) {
                        self.protectedLayersList.push(layer);
                        if(layer.missingConfig === true) {
                            self.missingProtectedLayers.push(layer);
                        }
                    });

                    angular.forEach(this.protectedProjects, function(project) {
                        self.protectedProjectsList.push(project);
                        if(project.missingConfig === true) {
                            self.missingProtectedProjects.push(project);
                        }
                    });
                    var pageBody = angular.element(document).find('body');
                    this.addWaiting = function() {
                        pageBody.addClass('waiting');
                    };
                    this.removeWaiting = function() {
                        pageBody.removeClass('waiting');
                    };
                };

                Model.prototype.groupById = function(groupId) {
                    var _group;
                    angular.forEach(this.groups, function(group) {
                        if(angular.isDefined(_group)) {
                            return;
                        }
                        if(group.id === groupId) {
                            _group = group;
                        }
                    });
                    return _group;
                };

                Model.prototype.layerById = function(layerId) {
                    var _layer;
                    angular.forEach(this.protectedLayers, function(layer) {
                        if(angular.isDefined(_layer)) {
                            return;
                        }
                        if(layer.id === layerId) {
                            _layer = layer;
                        }
                    });
                    return _layer;
                };

                Model.prototype.projectById = function(projectId) {
                    var _project;
                    angular.forEach(this.protectedProjects, function(project) {
                        if(angular.isDefined(_project)) {
                            return;
                        }
                        if(project.id === projectId) {
                            _project = project;
                        }
                    });
                    return _project;
                };

                Model.prototype.userById = function(userId) {
                    var _user;
                    angular.forEach(this.users, function(user) {
                        if(angular.isDefined(_user)) {
                            return;
                        }
                        if(user.id === userId) {
                            _user = user;
                        }
                    });
                    return _user;
                };

                Model.prototype.usersListsForGroup = function(group) {
                    var availableUsers = [];
                    var assignedUsers = [];
                    angular.forEach(this.users, function(user) {
                        if(group.users.indexOf(user.id) > -1) {
                            assignedUsers.push(user);
                        } else {
                            availableUsers.push(user);
                        }
                    });
                    return {
                        availableUsers: availableUsers,
                        assignedUsers: assignedUsers
                    };
                };

                Model.prototype.layersListsForGroup = function(group) {
                    var availableLayers = [];
                    var assignedLayers = [];
                    angular.forEach(this.protectedLayers, function(layer) {
                        if(group.layers.indexOf(layer.name) > -1) {
                            assignedLayers.push(layer);
                        } else {
                            availableLayers.push(layer);
                        }
                    });
                    return {
                        availableLayers: availableLayers,
                        assignedLayers: assignedLayers
                    };
                };

                Model.prototype.projectsListsForGroup = function(group) {
                    var availableProjects = [];
                    var assignedProjects = [];
                    angular.forEach(this.protectedProjects, function(project) {
                        if(group.projects.indexOf(project.name) > -1) {
                            assignedProjects.push(project);
                        } else {
                            availableProjects.push(project);
                        }
                    });
                    return {
                        availableProjects: availableProjects,
                        assignedProjects: assignedProjects
                    };
                };

                Model.prototype.groupsListsForLayer = function(layer) {
                    var availableGroups = [];
                    var assignedGroups = [];
                    angular.forEach(this.groups, function(group) {
                        if(group.layers.indexOf(layer.name) > -1) {
                            assignedGroups.push(group);
                        } else {
                            availableGroups.push(group);
                        }
                    });
                    return {
                        availableGroups: availableGroups,
                        assignedGroups: assignedGroups
                    };
                };

                Model.prototype.groupsListsForProject = function(project) {
                    var availableGroups = [];
                    var assignedGroups = [];
                    angular.forEach(this.groups, function(group) {
                        if(group.projects.indexOf(project.name) > -1) {
                            assignedGroups.push(group);
                        } else {
                            availableGroups.push(group);
                        }
                    });
                    return {
                        availableGroups: availableGroups,
                        assignedGroups: assignedGroups
                    };
                };

                Model.prototype.groupsListsForUser = function(user) {
                    var availableGroups = [];
                    var assignedGroups = [];
                    angular.forEach(this.groups, function(group) {
                        if(group.users.indexOf(user.id) > -1) {
                            assignedGroups.push(group);
                        } else {
                            availableGroups.push(group);
                        }
                    });
                    return {
                        availableGroups: availableGroups,
                        assignedGroups: assignedGroups
                    };
                };

                Model.prototype.assignUserToGroup = function(group, user) {
                    var self = this;
                    var data = {
                        'groupId': group.id,
                        'userId': user.id
                    };
                    self.addWaiting();
                    return $http.post(GroupAddUserUrl, data).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.groupId === group.id && response.data.userId === user.id) {
                                group.users.push(response.data.userId);
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.deassignUserFromGroup = function(group, user) {
                    var data = {
                        'groupId': group.id,
                        'userId': user.id
                    };
                    var self = this;
                    self.addWaiting();
                    return $http.post(GroupRemoveUserUrl, data).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.groupId === group.id && response.data.userId === user.id) {
                                group.users.splice(group.users.indexOf(response.data.userId), 1);
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.assignLayerToGroup = function(group, layer) {
                    var data = {
                        'groupId': group.id,
                        'layerName': layer.name
                    };
                    var self = this;
                    self.addWaiting();
                    return $http.post(GroupAddLayerUrl, data).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.groupId === group.id && response.data.layerName === layer.name) {
                                group.layers.push(response.data.layerName);
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.deassignLayerFromGroup = function(group, layer) {
                    var data = {
                        'groupId': group.id,
                        'layerName': layer.name
                    };
                    var self = this;
                    self.addWaiting();
                    return $http.post(GroupRemoveLayerUrl, data).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.groupId === group.id && response.data.layerName === layer.name) {
                                group.layers.splice(group.layers.indexOf(response.data.layerName), 1);
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.assignProjectToGroup = function(group, project) {
                    var data = {
                        'groupId': group.id,
                        'projectName': project.name
                    };
                    var self = this;
                    self.addWaiting();
                    return $http.post(GroupAddProjectUrl, data).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.groupId === group.id && response.data.projectName === project.name) {
                                group.projects.push(response.data.projectName);
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.deassignProjectFromGroup = function(group, project) {
                    var data = {
                        'groupId': group.id,
                        'projectName': project.name
                    };
                    var self = this;
                    self.addWaiting();
                    return $http.post(GroupRemoveProjectUrl, data).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.groupId === group.id && response.data.projectName === project.name) {
                                group.projects.splice(group.projects.indexOf(response.data.projectName), 1);
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.loadUser = function(user, duplicate) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/json'
                    };
                    self.addWaiting();

                    var url = LoadUserUrl;
                    if (angular.isDefined(duplicate) && duplicate) {
                        url += '?duplicate=true';
                    }

                    return $http.post(url, user, {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if (angular.isDefined(duplicate) && duplicate) {
                                console.info(response.data.message);
                            } else {
                                NotificationService.addSuccess(response.data.message);
                            }
                            return response.data;
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.addUser = function(mbUser, duplicate) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(mbUser, {'csrf_token': CSRFToken});
                    self.addWaiting();

                    var url = AddUserUrl;
                    if (angular.isDefined(duplicate) && duplicate) {
                        url += '?duplicate=true';
                    }

                    return $http.post(url, $httpParamSerializer(mbUser), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if (response.data.errors) {
                                NotificationService.addError(response.data.message);
                                return response.data;
                            } else {
                                if(response.data.user) {
                                    self.users.push(response.data.user);
                                }
                                NotificationService.addSuccess(response.data.message);
                                $location.path('users/edit/'+response.data.user.id);
                                $location.replace();
                                return response.data;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.updateUser = function(mbUser) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(mbUser, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(EditUserUrl, $httpParamSerializer(mbUser), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if (response.data.errors) {
                                NotificationService.addError(response.data.message);
                                return response.data;
                            } else {
                                if(response.data.user && response.data.user.id === mbUser.mb_user_id) {
                                    var idx;
                                    angular.forEach(self.users, function(user, _idx) {
                                        if(angular.isDefined(idx)) {
                                            return;
                                        }
                                        if(user.id === response.data.user.id) {
                                            idx = _idx;
                                        }
                                    });
                                    self.users[idx] = response.data.user;
                                }
                                NotificationService.addSuccess(response.data.message);
                                return response.data;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.removeUser = function(user) {
                    var self = this;
                    var data = {
                        'userId': user.id
                    };
                    self.addWaiting();
                    return $http.post(RemoveUserUrl, data).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.user && response.data.user.id === user.id) {
                                var idx;
                                angular.forEach(self.users, function(user, _idx) {
                                    if(angular.isDefined(idx)) {
                                        return;
                                    }
                                    if(user.id === response.data.user.id) {
                                        idx = _idx;
                                    }
                                });
                                self.users.splice(idx, 1);
                                NotificationService.addSuccess(response.data.message);
                            } else {
                                NotificationService.addError(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.layersForList = function() {
                    var self = this;
                    var layers = [];
                    angular.forEach(this.layers, function(layer) {
                        if(angular.isDefined(self.protectedLayers[layer.name])) {
                            layers.push(self.protectedLayers[layer.name]);
                        } else {
                            layers.push(layer);
                        }
                    });
                    return layers.concat(this.missingProtectedLayers);
                };

                Model.prototype.getLayers = function() {
                    var self = this;
                    return $http.get(LoadLayersUrl).then(
                        function(response) {
                            if(response.data.layers) {
                                self.layers = response.data.layers;
                            }
                            if(response.data.protected_layers) {
                                self.protected_layers = response.data.protected_layers;
                            }

                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.protectLayer = function(layer) {
                    var self = this;
                    var data = {
                        'layerName': layer.name,
                        'layerTitle': layer.title
                    };
                    self.addWaiting();
                    return $http.post(ProtectLayerUrl, data).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.layer.name === layer.name) {
                                self.protectedLayers[response.data.layer.name] = response.data.layer;
                                self.protectedLayersList.push(response.data.layer);
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.unprotectLayer = function(layer) {
                    var self = this;
                    var data = {
                        'layerId': layer.id
                    };
                    self.addWaiting();
                    return $http.post(UnprotectLayerUrl, data).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.layer.id === layer.id) {
                                var removedLayer = self.protectedLayers[response.data.layer.name];
                                delete self.protectedLayers[response.data.layer.name];

                                var groups = self.groupsListsForLayer(removedLayer);
                                angular.forEach(groups.assignedGroups, function(group) {
                                    var glIdx = group.layers.indexOf(removedLayer.name);
                                    if(glIdx > -1) {
                                        group.layers.splice(glIdx, 1);
                                    }
                                });

                                var pIdx;
                                angular.forEach(self.protectedLayersList, function(layer, idx) {
                                    if(angular.isDefined(pIdx)) {
                                        return;
                                    }
                                    if(layer.id === response.data.layer.id) {
                                        pIdx = idx;
                                    }
                                });
                                if(angular.isDefined(pIdx)) {
                                    self.protectedLayersList.splice(pIdx, 1);
                                }

                                var mIdx;
                                angular.forEach(self.missingProtectedLayers, function(layer, idx) {
                                    if(angular.isDefined(mIdx)) {
                                        return;
                                    }
                                    if(layer.id === response.data.layer.id) {
                                        mIdx = idx;
                                    }
                                });
                                if(angular.isDefined(mIdx)) {
                                    self.missingProtectedLayers.splice(mIdx, 1);
                                }
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.projectsForList = function() {
                    var projects = [];
                    angular.forEach(this.projects, function(project) {
                        projects.push({name: project});
                    });
                    return projects.concat(this.missingProtectedProjects);
                };

                Model.prototype.transferProjectConfig = function(project) {
                    var self = this;
                    var data = {
                        'projectName': project.name
                    };
                    self.addWaiting();
                    return $http.post(TransferProjectConfigUrl, data).then(
                        function(response) {
                            self.removeWaiting();
                            if (response.data.success) {
                                NotificationService.addSuccess(response.data.message);
                            } else {
                                NotificationService.addError(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.protectProject = function(project) {
                    var self = this;
                    var data = {
                        'projectName': project.name
                    };
                    self.addWaiting();
                    return $http.post(ProtectProjectUrl, data).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.project.name === project.name) {
                                self.protectedProjects[response.data.project.name] = response.data.project;
                                self.protectedProjectsList.push(response.data.project);
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.unprotectProject = function(project) {
                    var self = this;
                    var data = {
                        'projectId': project.id
                    };
                    self.addWaiting();
                    return $http.post(UnprotectProjectUrl, data).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.project.id === project.id) {
                                var removedProject = self.protectedProjects[response.data.project.name];
                                delete self.protectedProjects[response.data.project.name];

                                var groups = self.groupsListsForProject(removedProject);
                                angular.forEach(groups.assignedGroups, function(group) {
                                    var gpIdx = group.projects.indexOf(removedProject.name);
                                    if(gpIdx > -1) {
                                        group.projects.splice(gpIdx, 1);
                                    }
                                });

                                var pIdx;
                                angular.forEach(self.protectedProjectsList, function(project, idx) {
                                    if(angular.isDefined(pIdx)) {
                                        return;
                                    }
                                    if(project.id === response.data.project.id) {
                                        pIdx = idx;
                                    }
                                });
                                if(angular.isDefined(pIdx)) {
                                    self.protectedProjectsList.splice(pIdx, 1);
                                }

                                var mIdx;
                                angular.forEach(self.missingProtectedProjects, function(project, idx) {
                                    if(angular.isDefined(mIdx)) {
                                        return;
                                    }
                                    if(project.id === response.data.project.id) {
                                        mIdx = idx;
                                    }
                                });
                                if(angular.isDefined(mIdx)) {
                                    self.missingProtectedProjects.splice(mIdx, 1);
                                }
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.addGroup = function(group) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(group, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(AddGroupUrl, $httpParamSerializer(group), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(angular.isDefined(response.data.group)) {
                                self.groups.push(response.data.group);
                                NotificationService.addSuccess(response.data.message);
                                return response.data.group;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.updateGroup = function(group) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(group, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(EditGroupUrl, $httpParamSerializer(group), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(angular.isDefined(response.data.group)) {
                                var group = self.groupById(response.data.group.id);
                                angular.extend(group, response.data.group);
                                NotificationService.addSuccess(response.data.message);
                                return response.data.group;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.removeGroup = function(group) {
                    var self = this;
                    var data = {
                        'groupId': group.id
                    };
                    self.addWaiting();
                    return $http.post(RemoveGroupUrl, data).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.group.id === group.id) {
                                var idx;
                                angular.forEach(self.groups, function(group, _idx) {
                                    if(angular.isDefined(idx)) {
                                        return;
                                    }
                                    if(group.id === response.data.group.id) {
                                        idx = _idx;
                                    }
                                });
                                self.groups.splice(idx, 1);
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.loadProject = function(project) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    self.addWaiting();
                    return $http.post(LoadProjectUrl, $httpParamSerializer(project), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(angular.isDefined(response.data.code)) {
                                NotificationService.addSuccess(response.data.message);
                                return response.data.code;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.addProject = function(project) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(project, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(AddProjectUrl, $httpParamSerializer(project), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(angular.isDefined(response.data.project)) {
                                self.projects.push(response.data.project);
                                NotificationService.addSuccess(response.data.message);
                                return response.data;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.updateProject = function(project) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(project, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(EditProjectUrl, $httpParamSerializer(project), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(angular.isDefined(response.data.project)) {
                                NotificationService.addSuccess(response.data.message);
                                return response.data;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.renameProjectConfig = function(name, newName) {
                    var self = this;
                    var data = {
                        'name': name,
                        'newName': newName,
                    };

                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(data, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(RenameProjectConfigUrl, $httpParamSerializer(data), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if (response.data.success) {
                                var idx;
                                angular.forEach(self.projects, function(project, _idx) {
                                    if(angular.isDefined(idx)) {
                                        return;
                                    }
                                    if(project === response.data.name) {
                                        idx = _idx;
                                    }
                                });
                                self.projects.splice(idx, 1);
                                self.projects.push(response.data.newName);

                                if(response.data.project) {
                                    self.protectedProjects[response.data.newName] = response.data.project;
                                    delete self.protectedProjects[response.data.name];

                                    angular.forEach(self.protectedProjectsList, function(project) {
                                        if(project.name === response.data.name) {
                                            project.name = response.data.newName;
                                        }
                                    });
                                    angular.forEach(self.groups, function(group) {
                                        if (group.projects.length > 0) {
                                            var groupHasProject = false;
                                            var gpidx;
                                            angular.forEach(group.projects, function(project, _idx) {
                                                if (project === response.data.name) {
                                                    groupHasProject = true;
                                                    gpidx = _idx;
                                                }
                                            });
                                            if (groupHasProject) {
                                                group.projects.splice(gpidx, 1);
                                                group.projects.push( response.data.newName);
                                            }
                                        }
                                    });
                                }

                                NotificationService.addSuccess(response.data.message);
                            } else {
                                NotificationService.addError(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };


                Model.prototype.removeProject = function(project) {
                    var self = this;
                    var data = {
                        'name': project
                    };
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    self.addWaiting();
                    return $http.post(RemoveProjectUrl, $httpParamSerializer(data), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.success) {
                                var idx;
                                angular.forEach(self.projects, function(project, _idx) {
                                    if(angular.isDefined(idx)) {
                                        return;
                                    }
                                    if(project === response.data.project) {
                                        idx = _idx;
                                    }
                                });
                                self.projects.splice(idx, 1);
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.loadMapConfig = function(project) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    self.addWaiting();
                    return $http.post(LoadMapConfigUrl, $httpParamSerializer(project), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(angular.isDefined(response.data.code)) {
                                NotificationService.addSuccess(response.data.message);
                                return response.data.code;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.addMapConfig = function(project) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(project, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(AddMapConfigUrl, $httpParamSerializer(project), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(angular.isDefined(response.data.config)) {
                                self.configs.push(response.data.config);
                                self.getLayers();
                                NotificationService.addSuccess(response.data.message);
                                return response.data;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.updateMapConfig = function(project) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(project, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(UpdateMapConfigUrl, $httpParamSerializer(project), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(angular.isDefined(response.data)) {
                                NotificationService.addSuccess(response.data.message);
                                // update description on list
                                if(angular.isDefined(response.data.config)) {
                                    var idx;
                                    angular.forEach(self.configs, function(config, _idx) {
                                        if(angular.isDefined(idx)) {
                                            return;
                                        }
                                        if(config.name === response.data.config.name) {
                                            idx = _idx;
                                        }
                                    });
                                    self.configs[idx] = response.data.config;
                                    self.getLayers();
                                }

                                return response.data;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.renameMapConfig = function(name, newName) {
                    var self = this;
                    var data = {
                        'name': name,
                        'newName': newName,
                    };

                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(data, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(RenameMapConfigUrl, $httpParamSerializer(data), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if (response.data.success) {
                                NotificationService.addSuccess(response.data.message);
                                var idx;
                                angular.forEach(self.configs, function(config, _idx) {
                                    if(angular.isDefined(idx)) {
                                        return;
                                    }
                                    if(config.name === response.data.name) {
                                        idx = _idx;
                                    }
                                });
                                self.configs[idx].name = response.data.newName;
                                self.getLayers();
                            } else {
                                NotificationService.addError(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };


                Model.prototype.transferMapConfig = function(project) {
                    var self = this;
                    var data = {
                        'projectName': project.name
                    };
                    self.addWaiting();
                    return $http.post(TransferMapConfigUrl, data).then(
                        function(response) {
                            self.removeWaiting();
                            if (response.data.success) {
                                NotificationService.addSuccess(response.data.message);
                            } else {
                                NotificationService.addError(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.removeMapConfig = function(project) {
                    var self = this;
                    var data = {
                        'name': project
                    };
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    self.addWaiting();
                    return $http.post(RemoveMapConfigUrl, $httpParamSerializer(data), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.success) {
                                var idx;
                                angular.forEach(self.configs, function(config, _idx) {
                                    if(angular.isDefined(idx)) {
                                        return;
                                    }
                                    if(config.name === response.data.config) {
                                        idx = _idx;
                                    }
                                });
                                self.configs.splice(idx, 1);
                                self.getLayers();
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.removeLog = function(log) {
                    var self = this;
                    var data = {
                        'name': log
                    };
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    self.addWaiting();
                    return $http.post(RemoveLogUrl, $httpParamSerializer(data), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.success) {
                                var idx;
                                angular.forEach(self.logs, function(log, _idx) {
                                    if(angular.isDefined(idx)) {
                                        return;
                                    }
                                    if(log === response.data.name) {
                                        idx = _idx;
                                    }
                                });
                                self.logs.splice(idx, 1);
                                NotificationService.addSuccess(response.data.message);
                            } else {
                                NotificationService.addError(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.loadSelectionlist = function(selectionlist) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    self.addWaiting();
                    return $http.post(LoadSelectionlistUrl, $httpParamSerializer(selectionlist), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(angular.isDefined(response.data.code)) {
                                NotificationService.addSuccess(response.data.message);
                                return response.data.code;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.updateSelectionlist = function(selectionlist) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(selectionlist, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(EditSelectionlistUrl, $httpParamSerializer(selectionlist), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(angular.isDefined(response.data.selectionlist)) {
                                NotificationService.addSuccess(response.data.message);
                                return response.data;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.addSelectionlist = function(selectionlist) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(selectionlist, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(AddSelectionlistUrl, $httpParamSerializer(selectionlist), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(angular.isDefined(response.data.selectionlist)) {
                                self.selectionlists.push(response.data.selectionlist);
                                NotificationService.addSuccess(response.data.message);
                                return response.data;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.removeSelectionlist = function(selectionlist) {
                    var self = this;
                    var data = {
                        'name': selectionlist
                    };
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    self.addWaiting();
                    return $http.post(RemoveSelectionlistUrl, $httpParamSerializer(data), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.success) {
                                var idx;
                                angular.forEach(self.selectionlists, function(selectionlist, _idx) {
                                    if(angular.isDefined(idx)) {
                                        return;
                                    }
                                    if(selectionlist === response.data.selectionlist) {
                                        idx = _idx;
                                    }
                                });
                                self.selectionlists.splice(idx, 1);
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.renameSelectionlistConfig = function(name, newName) {
                    var self = this;
                    var data = {
                        'name': name,
                        'newName': newName,
                    };

                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(data, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(RenameSelectionlistConfigUrl, $httpParamSerializer(data), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if (response.data.success) {
                                var idx;
                                angular.forEach(self.selectionlists, function(selectionlist, _idx) {
                                    if(angular.isDefined(idx)) {
                                        return;
                                    }
                                    if(selectionlist === response.data.name) {
                                        idx = _idx;
                                    }
                                });
                                self.selectionlists.splice(idx, 1);
                                self.selectionlists.push(response.data.newName);

                                NotificationService.addSuccess(response.data.message);
                            } else {
                                NotificationService.addError(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.loadPlugin = function(plugin) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    self.addWaiting();
                    return $http.post(LoadPluginUrl, $httpParamSerializer(plugin), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(angular.isDefined(response.data.code)) {
                                NotificationService.addSuccess(response.data.message);
                                return response.data.code;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                Model.prototype.updatePlugin = function(plugin) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(plugin, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(EditPluginUrl, $httpParamSerializer(plugin), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(angular.isDefined(response.data.plugin)) {
                                NotificationService.addSuccess(response.data.message);
                                return response.data;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.addPlugin = function(plugin) {
                    var self = this;
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(plugin, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(AddPluginUrl, $httpParamSerializer(plugin), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(angular.isDefined(response.data.plugin)) {
                                self.plugins.push(response.data.plugin);
                                NotificationService.addSuccess(response.data.message);
                                return response.data;
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.removePlugin = function(plugin) {
                    var self = this;
                    var data = {
                        'name': plugin
                    };
                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    self.addWaiting();
                    return $http.post(RemovePluginUrl, $httpParamSerializer(data), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if(response.data.success) {
                                var idx;
                                angular.forEach(self.plugins, function(plugin, _idx) {
                                    if(angular.isDefined(idx)) {
                                        return;
                                    }
                                    if(plugin === response.data.plugin) {
                                        idx = _idx;
                                    }
                                });
                                self.plugins.splice(idx, 1);
                                NotificationService.addSuccess(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                            return response.data;
                        }
                    );
                };

                Model.prototype.renamePluginConfig = function(name, newName) {
                    var self = this;
                    var data = {
                        'name': name,
                        'newName': newName,
                    };

                    var headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    angular.extend(data, {'csrf_token': CSRFToken});
                    self.addWaiting();
                    return $http.post(RenamePluginConfigUrl, $httpParamSerializer(data), {headers: headers}).then(
                        function(response) {
                            self.removeWaiting();
                            if (response.data.success) {
                                var idx;
                                angular.forEach(self.plugins, function(plugin, _idx) {
                                    if(angular.isDefined(idx)) {
                                        return;
                                    }
                                    if(plugin === response.data.name) {
                                        idx = _idx;
                                    }
                                });
                                self.plugins.splice(idx, 1);
                                self.plugins.push(response.data.newName);

                                NotificationService.addSuccess(response.data.message);
                            } else {
                                NotificationService.addError(response.data.message);
                            }
                        },
                        function(response) {
                            self.removeWaiting();
                            NotificationService.addError(response.data.message);
                        }
                    );
                };

                return new Model(_model);
            }
        ];
    }]);
