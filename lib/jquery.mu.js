/*!
 * Mu plugin collection v$VERSION
 * <http://github.com/tuomas/jquery-mu>
 *
 * Requires jQuery 1.3.2 or 1.4.
 *
 * Copyright (c) 2009-2010 Tuomas Kareinen, Reaktor Innovations Oy
 * Licensed under the MIT license.
 *
 * Portions based on code from jquery.highlight-3.js.
 * Copyright (c) 2007 Johann Burkard, <http://johannburkard.de>
 * Licensed under the MIT license.
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
