define(function (require) {
  var _ = require('lodash');
  require('plugins/settings/sections/indices/_indexed_fields');
  require('plugins/settings/sections/indices/_scripted_fields');

  require('routes')
  .addResolves(/settings\/indices\/(.+)\/scriptedField/, {
    indexPattern: function ($route, courier) {
      return courier.indexPatterns.get($route.current.params.id)
      .catch(courier.redirectWhenMissing('/settings/indices'));
    }
  })
  .when('/settings/indices/:id/scriptedField', {
    template: require('text!plugins/settings/sections/indices/scripted_fields/index.html'),
  })
  .when('/settings/indices/:id/scriptedField/:field', {
    template: require('text!plugins/settings/sections/indices/scripted_fields/index.html'),
  });

  require('modules').get('apps/settings')
  .controller('scriptedFieldsEdit', function ($scope, $route, $window, Notifier) {
    var fieldEditorPath = '/settings/indices/{{ indexPattern }}/scriptedField';
    var notify = new Notifier();
    var createMode = (!$route.current.params.field);
    $scope.indexPattern = $route.current.locals.indexPattern;

    if (createMode) {
      $scope.action = 'Create';
    } else {
      var scriptName = $route.current.params.field;
      $scope.action = 'Edit';
      $scope.scriptedField = _.find($scope.indexPattern.fields, {
        name: scriptName,
        scripted: true
      });
    }

    $scope.cancel = function () {
      $window.history.back();
    };

    $scope.submit = function () {
      if (createMode) {
        $scope.indexPattern.addScriptedField($scope.scriptedField.name, $scope.scriptedField.script);
      } else {
        $scope.indexPattern.save();
      }

      notify.info('Scripted field \'' + $scope.scriptedField.name + '\' successfully saved');
      $window.history.back();
    };

    $scope.$watch('scriptedField.name', function (name) {
      checkConflict(name);
    });

    function checkConflict(name) {
      var match = _.find($scope.indexPattern.fields, {
        name: name,
        scripted: false
      });

      if (match) {
        $scope.namingConflict = true;
      } else {
        $scope.namingConflict = false;
      }
    }
  });
});