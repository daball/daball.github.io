(function($) {
  "use strict"; // Start of use strict

  // Activate tooltips
  $(function () {
    $('a.github-corner').tooltip({ container: 'body' });
    $('[data-toggle="tooltip"]').tooltip();
  });

  // Activate popovers
  $(function () {
    $('[data-toggle="popover"]').popover();
  });

})(jQuery); // End of use strict
