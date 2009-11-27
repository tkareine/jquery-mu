/*
 * @depend jquery.mu.js
 */
(function (mu, $) {
    $.expr[':'].muContainsIgnoringCase = function (element, index, meta, stack) {
        var content = (element.textContent || element.innerText || $(element).text() || "").toLowerCase();
        var matchAgainst = meta[3].toLowerCase();
        return content.indexOf(matchAgainst) >= 0;
    };

    $.fn.muSearchForm = function (userOptions) {
        function createIdName(type) {
            return "MuSearchForm" + (type ? type : "") + id;
        }

        function createClassName(type) {
            return "muSearchForm" + (type ? type : "");
        }

        function createFormInput() {
            return "<input type='text' value='' " +
                   "id='" + options.inputId +
                   "' class='" + options.inputClass + "' />";
        }

        function createFormLoader() {
            if (useLoader) {
                var loader = $("<span id='" + options.loaderId +
                               "' class='"  + options.loaderClass + "'>" +
                               options.loadWith() + "</span>");
                loader.hide();
                return loader;
            }
            else {
                return "";
            }
        }

        function createForm() {
            var form = $("<form action='#' id='" + options.formId +
                         "' class='"  + options.formClass + "'>" +
                         createFormInput() + "</form>");
            form.append(createFormLoader());
            return form;
        }

        function sanitizeSearchString(str) {
            str = str.replace(/\s+/g, " ");
            str = str.replace(/[^a-z0-9-._!?#\s]/gi, "");
            str = $.trim(str);
            return str;
        }

        function filterElementsToShowWithAndBooleanLogic(elements, searchWords) {
            $.each(searchWords, function (index, searchWord) {
                elements = elements.filter(":muContainsIgnoringCase(" + searchWord + ")");
            });
            return elements;
        }

        function filterElements(searchFor) {
            searchFor = sanitizeSearchString(searchFor);
            if (searchFor.length > 0) {
                searchScope.hide();
                filterElementsToShow(searchScope, searchFor.split(/\s+/)).show();
            }
            else {
                searchScope.show();
            }
        }

        function showLoader() {
            setLoaderVisibility(true);
        }

        function hideLoader() {
            setLoaderVisibility(false);
        }

        function setLoaderVisibility(isShown) {
            if (useLoader) {
                var loader = formScope.find("span#" + options.loaderId);
                if (isShown) {
                    loader.show();
                }
                else {
                    loader.hide();
                }
            }
        }

        function filterElementsAfterDelay(searchFor) {
            var delay = options.delay/2;

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(function () {
                showLoader();

                setTimeout(function () {
                    filterElements(searchFor);
                }, delay);

                setTimeout(function () {
                    hideLoader();
                }, delay);
            }, delay);
        }

        function performPluginAction() {
            options.attachWith(createForm());

            formScope.find("input#" + options.inputId).keyup(function () {
                var searchFor = $(this).val();
                filterElementsAfterDelay(searchFor);
            });
        }

        var id              = mu.util.createPseudoUniqueId(),
            options         = $.extend({
                formId:                     createIdName(),
                formClass:                  createClassName(),
                inputId:                    createIdName("Input"),
                inputClass:                 createClassName("Input"),
                loaderId:                   createIdName("Loader"),
                loaderClass:                createClassName("Loader"),
                loadWith:                   null,
                attachWith:                 function (form) {
                    $("body").append(form);
                },
                filterElementsToShowWith:   filterElementsToShowWithAndBooleanLogic,
                delay:                      500,
                formScope:                  $(),                    /* mainly for testing */
                setTimeoutWith:             window.setTimeout,      /* mainly for testing */
                clearTimeoutWith:           window.clearTimeout     /* mainly for testing */
            }, userOptions),
            searchScope             = $(this),
            formScope               = options.formScope,
            timeoutId               = null,
            clearTimeout            = options.clearTimeoutWith,
            setTimeout              = options.setTimeoutWith,
            useLoader               = options.loadWith && options.loaderId,
            filterElementsToShow    = options.filterElementsToShowWith;

        performPluginAction();

        return this;
    };
})(jQuery.mu, jQuery);
