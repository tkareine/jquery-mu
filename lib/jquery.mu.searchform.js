(function (mu, $) {
    var id = mu.util.createPseudoUniqueId();

    $.expr[':'].muContainsIgnoringCase = function (element, index, meta, stack) {
        var content = (element.textContent || element.innerText || $(element).text() || "").toLowerCase(),
            matchAgainst = meta[3].toLowerCase();
        return content.indexOf(matchAgainst) >= 0;
    };

    function createIdName(type) {
        return "MuSearchForm" + (type ? type : "") + id;
    }

    function createClassName(type) {
        return "muSearchForm" + (type ? type : "");
    }

    function filterElementsToShowWithAndBooleanLogic(elements, searchWords) {
        $.each(searchWords, function (index, searchWord) {
            elements = elements.filter(":muContainsIgnoringCase(" + searchWord + ")");
        });
        return elements;
    }

    $.fn.muSearchForm = function (userOptions) {
        var options                     = $.extend({
                formId:                     createIdName(),
                formClass:                  createClassName(),
                inputId:                    createIdName("Input"),
                inputClass:                 createClassName("Input"),
                loaderId:                   createIdName("Loader"),
                loaderClass:                createClassName("Loader"),
                highlightClass:             null,
                loadWith:                   null,
                attachWith:                 function (form) {
                    $("body").append(form);
                },
                filterElementsToShowWith:   filterElementsToShowWithAndBooleanLogic,
                delay:                      500,
                formScope:                  $(document),            /* mainly for testing */
                setTimeoutWith:             window.setTimeout,      /* mainly for testing */
                clearTimeoutWith:           window.clearTimeout     /* mainly for testing */
            }, userOptions),
            searchScope                 = $(this),
            formScope                   = options.formScope,
            timeoutId                   = null,
            clearTimeout                = options.clearTimeoutWith,
            setTimeout                  = options.setTimeoutWith,
            useLoader                   = options.loadWith && options.loaderId,
            filterElementsToShow        = options.filterElementsToShowWith,
            useHighlighting             = options.highlightClass !== null,
            highlightClass              = null,
            allowedCharsInSearchString  = "a-z0-9._\\-!?@#";

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

        function toUniqueArray(ary) {
            var result = [],
                length = ary.length,
                index,
                element;
            for (index = 0; index < length; index++) {
                element = ary[index];
                if (result.indexOf(element) < 0) {
                    result.push(element);
                }
            }
            return result;
        }

        function sanitizeSearchString(str) {
            str = str.replace(/\s+/g, " ");
            str = str.replace(new RegExp("[^" + allowedCharsInSearchString + "\\s]", "gi"), "");
            str = $.trim(str);
            if (str.length > 0) {
                return toUniqueArray(str.split(/\s+/)).sort(function (a, b) {
                    return b.length - a.length;
                });
            }
            else {
                return [];
            }
        }

        function createHighlightNode(contentNode) {
            var node = document.createElement("span");
            node.className = highlightClass;
            node.appendChild(contentNode);
            return node;
        }

        /*
         * Based on jquery.highlight-3.js, by Johann Burkad. See
         * <http://johannburkard.de/resources/Johann/jquery.highlight-3.js>.
         */
        function highlightWord(node, word) {
            if (node.nodeType === Node.TEXT_NODE) {
                var foundAt = node.data.toLowerCase().indexOf(word),
                    matchingNode,
                    highlightNode,
                    restNode;
                if (foundAt >= 0) {
                    matchingNode = node.splitText(foundAt);
                    restNode = matchingNode.splitText(word.length);
                    highlightNode = createHighlightNode(matchingNode.cloneNode(true));
                    matchingNode.parentNode.replaceChild(highlightNode, matchingNode);
                    highlightWord(restNode, word);
                }
            }
            else if (node.nodeType === Node.ELEMENT_NODE &&
                     node.className !== highlightClass &&
                     node.childNodes &&
                     !/(script|style)/i.test(node.tagName)) {
                $.each(node.childNodes, function (index, childNode) {
                    highlightWord(childNode, word);
                });
            }
        }

        function highlightAllWords(elements, words) {
            elements.each(function () {
                var node = this;
                $.each(words, function (index, word) {
                    highlightWord(node, word.toLowerCase());
                });
            });
        }

        function unhighlightAllWords(elements) {
            elements.find("span." + highlightClass).each(function () {
                var parentNode = this.parentNode;
                parentNode.replaceChild(this.firstChild, this);
                parentNode.normalize();
            });
        }

        function filterElements(searchFor) {
            var elementsToShow,
                searchWords;

            if (useHighlighting) {
                unhighlightAllWords(searchScope);
            }

            searchWords = sanitizeSearchString(searchFor);
            if (searchWords.length > 0) {
                searchScope.hide();
                elementsToShow = filterElementsToShow(searchScope, searchWords);
                if (useHighlighting) {
                    highlightAllWords(elementsToShow, searchWords);
                }
                elementsToShow.show();
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
            var loader;
            if (useLoader) {
                loader = formScope.find("span#" + options.loaderId);
                if (isShown) {
                    loader.show();
                }
                else {
                    loader.hide();
                }
            }
        }

        function filterElementsAfterDelay(searchFor) {
            var delay = options.delay / 2;

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

        if (useHighlighting) {
            highlightClass = options.highlightClass;
        }

        performPluginAction();

        return this;
    };
})(jQuery.mu, jQuery);
