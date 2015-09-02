angular.module('<%= fullAppName %>', ['config', 'ngResource']);

// @ngInject
function Config($provide) {
  "use strict";

  // Log Angular exceptions to Sentry
  $provide.decorator('$exceptionHandler', [
    '$delegate', function($delegate) {
      return function(exception, cause) {
        $delegate(exception, cause);
        return Raven.captureException(exception, {
          extra: { cause: cause }
        });
      };
    }
  ]);

  // Log HTTP response errors to Sentry
  $provide.factory('ravenHttpInterceptor', [
    '$q', function($q) {
      return {
        responseError: function(rejection) {
          Raven.captureException(new Error('HTTP response error'), {
            extra: {
              config: rejection.config,
              status: rejection.status,
              data: rejection.data,
            }
          });
          return $q.reject(rejection);
        }
      };
    }
  ]);
}

angular.module('<%= fullAppName %>').config(Config);
