(function (JSpec) {
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

                describe("with expected user options and highlighting disabled", function () {
                    before_each(function () {
                        page.find("table tr:not(:first)").muSearchForm(searchOptions);
                        input = page.find("input.muSearchFormInput");
                        searchContext = page.find("table tr:not(:first)");
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
                        expect(searchContext.eq(0)).to(be_hidden);
                        expect(searchContext.eq(1)).to(be_hidden);
                        expect(searchContext.eq(2)).to(be_visible);
                        expect(searchContext.eq(3)).to(be_hidden);
                    });

                    it("should not insert extra span elements for highlighting", function () {
                        input.simulateSearch("john");
                        expect(searchContext.find("span")).to(be_empty);
                    });

                    it("after searching, should show relevant results, hiding the rest", function () {
                        input.simulateSearch("John");
                        expect(searchContext.eq(0)).to(be_visible);
                        expect(searchContext.eq(1)).to(be_hidden);
                        expect(searchContext.eq(2)).to(be_visible);
                        expect(searchContext.eq(3)).to(be_hidden);
                    });

                    it("should not search at all if sanitizing results to no reasonable user input", function () {
                        input.simulateSearch("  \t) ");
                        page.find("table tr:not(:first)").each(function () {
                            expect($(this)).to(be_visible);
                        });
                    });

                    describe("for sanitizing the user input for the search", function () {
                        before(function () {
                            orgJQueryFilter = jQuery.fn.filter;
                        });

                        after(function () {
                            $.fn.filter = orgJQueryFilter;
                        });

                        before_each(function () {
                            resultedFilterWords = [];
                            $.fn.filter = function (query) {
                                resultedFilterWords.push(query.match(/:muContainsIgnoringCase\((.*)\)/)[1]);
                                return orgJQueryFilter.apply(this, arguments);
                            };
                        });

                        it("should allow empty input", function () {
                            input.simulateSearch("");
                            expect(resultedFilterWords).to(eql, []);
                        });

                        it("should allow input containing just whitespace", function () {
                            input.simulateSearch(" \t  \n");
                            expect(resultedFilterWords).to(eql, []);
                        });

                        it("should remove leading and trailing whitespace", function () {
                            input.simulateSearch("  \tJohn  ");
                            expect(resultedFilterWords).to(eql, ["John"]);
                        });

                        it("should remove excess whitespace characters between words", function () {
                            input.simulateSearch("   J\n Michael \t Spoonman\n\n");
                            expect(resultedFilterWords).to(eql, ["Spoonman", "Michael", "J"]);
                        });

                        it("should sort the search words from long to short order", function () {
                            input.simulateSearch("zapav p apa foobar");
                            expect(resultedFilterWords).to(eql, ["foobar", "zapav", "apa", "p"]);
                        });

                        it("should remove duplicate words", function () {
                            input.simulateSearch("zap mana zap");
                            expect(resultedFilterWords).to(eql, ["mana", "zap"]);
                        });

                        it("should allow certain allowed special characters", function () {
                            input.simulateSearch(".!?#-_");
                            expect(resultedFilterWords).to(eql, [".!?#-_"]);
                        });

                        it("should remove suspectful characters, case HTML tags", function () {
                            input.simulateSearch(" <html>here?!</html>");
                            expect(resultedFilterWords).to(eql, ["htmlhere?!html"]);
                        });

                        it("should remove suspectful characters, case semicolon termination", function () {
                            input.simulateSearch("; rm");
                            expect(resultedFilterWords).to(eql, ["rm"]);
                        });

                        it("should remove suspectful characters, case JavaScript injection", function () {
                            input.simulateSearch("'call()\"");
                            expect(resultedFilterWords).to(eql, ["call"]);
                        });

                        it("should remove suspectful characters, case jQuery injection", function () {
                            input.simulateSearch(").filter(#important)");
                            expect(resultedFilterWords).to(eql, [".filter#important"]);
                        });
                    });
                });
            });

            describe("with expected user options and highlighting enabled", function () {
                before_each(function () {
                    searchOptions.highlightClass = "highlight";
                    page.find("table tr:not(:first)").muSearchForm(searchOptions);
                    input = page.find("input.muSearchFormInput");
                    searchContext = page.find("table tr:not(:first)");
                });

                it("after searching, should show relevant results and highlight matching words", function () {
                    input.simulateSearch("john");
                    expect(searchContext.eq(0)).to(be_visible);
                    expect(searchContext.eq(1)).to(be_hidden);
                    expect(searchContext.eq(2)).to(be_visible);
                    expect(searchContext.eq(3)).to(be_hidden);
                    expect(searchContext.eq(0).find("td:eq(1) span.highlight").html()).to(equal, "john");
                    expect(searchContext.eq(0).find("td:eq(2) span.highlight").html()).to(equal, "John");
                    expect(searchContext.eq(2).find("td:eq(2) span.highlight").html()).to(equal, "John");
                    expect(searchContext.find("span.highlight")).to(have_length, 3);
                });

                it("for highlighting and the default search, should ignore the character case of the search word", function () {
                    input.simulateSearch("John");
                    expect(searchContext.eq(0).find("td:eq(1) span.highlight").html()).to(equal, "john");
                    expect(searchContext.eq(0).find("td:eq(2) span.highlight").html()).to(equal, "John");
                });

                it("after searching again with new words, should highlight the new matching words", function () {
                    input.simulateSearch("John");
                    input.simulateSearch("alan");
                    expect(searchContext.eq(0)).to(be_hidden);
                    expect(searchContext.eq(1)).to(be_visible);
                    expect(searchContext.eq(2)).to(be_hidden);
                    expect(searchContext.eq(3)).to(be_hidden);
                    expect(searchContext.eq(1).find("td:eq(1) span.highlight").html()).to(equal, "alan");
                    expect(searchContext.eq(1).find("td:eq(2) span.highlight").html()).to(equal, "Alan");
                    expect(searchContext.find("span.highlight")).to(have_length, 2);
                });

                it("after searching with words where the one word contains the other, should highlight the longest matches possible", function () {
                    input.simulateSearch("jo john");
                    expect(searchContext.eq(0)).to(be_visible);
                    expect(searchContext.eq(1)).to(be_hidden);
                    expect(searchContext.eq(2)).to(be_visible);
                    expect(searchContext.eq(3)).to(be_hidden);
                    expect(searchContext.eq(0).find("td:eq(1) span.highlight").html()).to(equal, 'john');
                    expect(searchContext.eq(0).find("td:eq(2) span.highlight").html()).to(equal, 'John');
                    expect(searchContext.eq(2).find("td:eq(0) span.highlight").html()).to(equal, 'jo');
                    expect(searchContext.eq(2).find("td:eq(1) span.highlight").html()).to(equal, 'jo');
                    expect(searchContext.eq(2).find("td:eq(2) span.highlight").html()).to(equal, 'John');
                    expect(searchContext.find("span.highlight")).to(have_length, 5);
                });

                it("after searching with words where there are multiple matches in a single text node, should highlight all the matches", function () {
                    input.simulateSearch("o");
                    expect(searchContext.eq(0)).to(be_visible);
                    expect(searchContext.eq(1)).to(be_visible);
                    expect(searchContext.eq(0).find("td:eq(1)").html()).to(equal, 'j<span class="highlight">o</span>hn.g<span class="highlight">o</span>re@hard.c<span class="highlight">o</span>m');
                    expect(searchContext.eq(1).find("td:eq(1)").html()).to(equal, 'alan.sp<span class="highlight">o</span><span class="highlight">o</span>nman@drums.net');
                    expect(searchContext.find("span.highlight")).to(have_length, 21);
                });

                it("after clearing the search, should have no highlights", function () {
                    input.simulateSearch("John");
                    input.simulateSearch("");
                    expect(searchContext.eq(0)).to(be_visible);
                    expect(searchContext.eq(1)).to(be_visible);
                    expect(searchContext.eq(2)).to(be_visible);
                    expect(searchContext.eq(3)).to(be_visible);
                    expect(searchContext.find("span.highlight")).to(have_length, 0);
                });

                it("after clearing the search with words where the one word contains the other, should have no highlights", function () {
                    input.simulateSearch("john oh");
                    input.simulateSearch("");
                    expect(searchContext.eq(0)).to(be_visible);
                    expect(searchContext.eq(1)).to(be_visible);
                    expect(searchContext.eq(2)).to(be_visible);
                    expect(searchContext.eq(3)).to(be_visible);
                    expect(searchContext.find("span.highlight")).to(have_length, 0);
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
                    searchOptions.highlightClass = "highlight";
                    page.find("table tr:not(:first)").muSearchForm(searchOptions);
                    input = page.find("input.muSearchFormInput");
                    searchContext = page.find("table tr:not(:first)");
                });

                it("should allow overriding the default filtering function to show the searched elements", function () {
                    input.simulateSearch("john nathan");
                    expect(searchContext.eq(0)).to(be_visible);
                    expect(searchContext.eq(1)).to(be_hidden);
                    expect(searchContext.eq(2)).to(be_visible);
                    expect(searchContext.eq(3)).to(be_hidden);
                });

                it("after searching, should show relevant results and highlight matching words", function () {
                    input.simulateSearch("spade nathan");
                    expect(searchContext.eq(0)).to(be_hidden);
                    expect(searchContext.eq(1)).to(be_hidden);
                    expect(searchContext.eq(2)).to(be_visible);
                    expect(searchContext.eq(3)).to(be_visible);
                    expect(searchContext.eq(2).find("td:eq(0) span.highlight").html()).to(equal, "nathan");
                    expect(searchContext.eq(2).find("td:eq(1) span.highlight").html()).to(equal, "nathan");
                    expect(searchContext.eq(2).find("td:eq(2) span.highlight").html()).to(equal, "Nathan");
                    expect(searchContext.eq(3).find("td:eq(0) span.highlight").html()).to(equal, "spade");
                    expect(searchContext.eq(3).find("td:eq(1) span.highlight").html()).to(equal, "spade");
                    expect(searchContext.eq(3).find("td:eq(2) span.highlight").html()).to(equal, "Spade");
                    expect(searchContext.find("span.highlight")).to(have_length, 6);
                });
            });
        });
    });
})(JSpec);
