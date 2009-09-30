/* Mu plugin collection for jQuery
 *
 * Designed for jQuery 1.3.x.
 */

// Initialize the namespace in which the plugin's global functions reside.
(function ($) {
    if (!$.mu) {
        $.mu = {};
    }
})(jQuery);

// Common functions used by the modules of the plugin.
(function (mu) {
    mu.util = {
        createPseudoUniqueId: function () {
            return Math.floor(Math.random() * 999999);
        }
    };
})(jQuery.mu);
