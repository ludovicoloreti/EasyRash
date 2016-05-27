angular.module('EasyRashApp.utils', [])

.filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                    value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
    });

/*.directive('myTooltip', function () {
    return {
        restrict: 'AC',
        link: function (scope, element, attrs) {
            element.qtip();
        }server
    };
});

// l'html diventa:
<span my-tooltip title="Testo nel tooltip">Testo nel box</span>
*/
