(function (JSpec) {
    var resultedFilterWords = null;   // unfortunately, this cannot be closer to its usage than this

    JSpec.describe("jQuery Mu plugin's muSearchForm module", function () {
        describe("#muSearchForm", function () {
            before_each(function () {
                page = sandbox().append(fixture("jquery.mu.searchform"));
                searchOptions = {
                    attachWith:         function (form) {
                        page.find("table").before(form);
                    },
                    loadWith:           function () {
                        return "<span class='searchNotify'>Searching...</span>";
                    },
                    formScope:          page,
                    clearTimeoutWith:   function () {},
                    setTimeoutWith:     function (action) {
                        action();
                        return "1";     /* a fake id */
                    }
                };
            });

            describe("for its layout", function () {
                before_each(function () {
                    page.find("table tr:not(:first)").muSearchForm(searchOptions);
                });

                it("should create a form into user defined location on a page", function () {
                    var form = page.find("table").prev();
                    expect(form[0].tagName).to(equal, "FORM");
                    expect(form.hasClass("muSearchForm")).to(be_true);
                });

                it("should have an input field in the form", function () {
                    var input = page.find("form.muSearchForm input");
                    expect(input.hasClass("muSearchFormInput")).to(be_true);
                });

                it("should have a loader element in the form, initially hidden", function () {
                    var wrapper = page.find("form.muSearchForm > span");
                    expect(wrapper.hasClass("muSearchFormLoader")).to(be_true);
                    expect(wrapper).to(be_hidden);
                    var loader = wrapper.children();
                    expect(loader.hasClass("searchNotify")).to(be_true);
                });
            });

            describe("for its behavior", function () {
                before_each(function () {
                    $.fn.simulateSearch = function (query) {
                        element = $(this);
                        element.val(query);
                        element.trigger("keyup");
                        return element;
                    };
                });

                describe("with expected user options", function () {
                    before_each(function () {
                        page.find("table tr:not(:first)").muSearchForm(searchOptions);
                        input = page.find("input.muSearchFormInput");
                    });

                    it("when searching, should show loader element", function () {
                        var timedActions = [];
                        searchOptions.setTimeoutWith = function (action) {
                            timedActions.push(action);
                        };
                        page.find("form.muSearchForm").remove();
                        page.find("table tr:not(:first)").muSearchForm(searchOptions);
                        input = page.find("input.muSearchFormInput");
                        input.simulateSearch("John");
                        timedActions.pop().call();
                        var wrapper = page.find("form.muSearchForm > span");
                        expect(wrapper.hasClass("muSearchFormLoader")).to(be_true);
                        expect(wrapper).to(be_visible);
                    });

                    it("when searching, should use Boolean AND operator for multiple words in search input, by default", function () {
                        input.simulateSearch("john nathan");
                        var searchContext = page.find("table tr:not(:first)");
                        expect(searchContext.eq(0)).to(be_hidden);
                        expect(searchContext.eq(1)).to(be_hidden);
                        expect(searchContext.eq(2)).to(be_visible);
                        expect(searchContext.eq(3)).to(be_hidden);
                    });

                    it("after searching, should show relevant results, hiding the rest", function () {
                        input.simulateSearch("John");
                        var searchContext = page.find("table tr:not(:first)");
                        expect(searchContext.eq(0)).to(be_visible);
                        expect(searchContext.eq(1)).to(be_hidden);
                        expect(searchContext.eq(2)).to(be_visible);
                        expect(searchContext.eq(3)).to(be_hidden);
                    });

                    describe("for its result of user input sanitization for the search", function () {
                        var proxiedFilter = $.fn.filter;
                        $.fn.filter = function (query) {
                            resultedFilterWords.push(query.match(/:muContainsIgnoringCase\((.*)\)/)[1]);
                            return proxiedFilter.apply(this, arguments);
                        };

                        before_each(function () {
                            resultedFilterWords = [];
                        });

                        it("should have no leading or trailing whitespace", function () {
                            input.simulateSearch("  \tJohn  ");
                            expect(resultedFilterWords).to(eql, ["John"]);
                        });

                        it("should have whitespace characters converted to spaces", function () {
                            input.simulateSearch("  Michael \t J\n Spoonman\n\n");
                            expect(resultedFilterWords).to(eql, ["Michael", "J", "Spoonman"]);
                        });

                        it("should have certain allowed special characters", function () {
                            input.simulateSearch(".!?#-_");
                            expect(resultedFilterWords).to(eql, [".!?#-_"]);
                        });

                        it("should have no suspectful characters, case HTML tags", function () {
                            input.simulateSearch(" <html>here?!</html>");
                            expect(resultedFilterWords).to(eql, ["htmlhere?!html"]);
                        });

                        it("should have no suspectful characters, case semicolon termination", function () {
                            input.simulateSearch("; rm -fr");
                            expect(resultedFilterWords).to(eql, ["rm", "-fr"]);
                        });

                        it("should have no suspectful characters, case JavaScript injection", function () {
                            input.simulateSearch("'call()\"");
                            expect(resultedFilterWords).to(eql, ["call"]);
                        });

                        it("should have no suspectful characters, case jQuery injection", function () {
                            input.simulateSearch(").filter(#important)");
                            expect(resultedFilterWords).to(eql, [".filter#important"]);
                        });

                        it("should not search at all if sanitization results to empty string", function () {
                            input.simulateSearch("  \t) ");
                            expect(resultedFilterWords).to(eql, []);
                            page.find("table tr:not(:first)").each(function () {
                                expect($(this)).to(be_visible);
                            });
                        });
                    });
                });
            });

            describe("with unexpected, but quite possible, user options", function () {
                before_each(function () {
                    function filterElementsToShowWithOrBooleanLogic(elements, searchWords) {
                        matches = [];
                        $.each(searchWords, function (index, searchWord) {
                            var found = elements.filter(":muContainsIgnoringCase(" + searchWord + ")");
                            found.each(function (index) { matches.push(this); });
                        });
                        matches = $.unique(matches);
                        return $(matches, elements);
                    }
                    searchOptions.filterElementsToShowWith = filterElementsToShowWithOrBooleanLogic;
                    page.find("table tr:not(:first)").muSearchForm(searchOptions);
                    input = page.find("input.muSearchFormInput");
                });

                it("should allow overriding the default filtering function to show the searched elements", function () {
                    input.simulateSearch("john nathan");
                    var searchContext = page.find("table tr:not(:first)");
                    expect(searchContext.eq(0)).to(be_visible);
                    expect(searchContext.eq(1)).to(be_hidden);
                    expect(searchContext.eq(2)).to(be_visible);
                    expect(searchContext.eq(3)).to(be_hidden);
                });
            });
        });
    });
})(JSpec);
