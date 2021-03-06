jQuery Mu Plugin Collection
===========================

Mu is a collection of plugins for jQuery. Their guiding design principle is
simplicity and ease-of-use. If you like some parts of the collection, just
grab it and possibly even modify it to your particular needs.

The collection is divided into modules. Besides jQuery, the only dependency
each module requires is the core module of the collection, `jquery.mu.js`.

The modules are located under the `lib` directory.

Mu is compatible with jQuery 1.3.2 and 1.4.

Queue
-----

Queue module allows actions to be completed in a sequence, in synchronized
manner.

The module is a collection of jQuery utility functions in `$.mu.queue` object.
The module resides in the file `jquery.mu.queue.js`.

Actions can be functions to be executed or Ajax requests to be sent and
processed. The current implementation uses a common queue for all the actions.
The process of dequeuing starts as soon as the first action is queued.

Functions may choose to signal their completion, so that the next action in
the queue is not dequeued before a signal is given to indicate that the
current function is completed. A truthy value in the property
`action.callsComplete` denotes that signaling is in use for the function. The
signal is given simply by calling `action.complete`. If signaling is not used,
functions dequeue automatically after each one finishes its execution.

Ajax requests use the signaling mechanism in the queue implicitly. This
ensures that the next request in the queue is not sent before the previous
request has been completed.

For queuing a function, use the syntax

    var fun = function () { };
    $.mu.queue.action(fun);

For queuing an Ajax request:

    var request = { ... };
    $.mu.queue.ajax(request);

Behind the scenes, the syntax above passes `request` as a parameter to
jQuery's` Ajax function when the time is right:

    $.ajax(request)

See [the example](http://tkareine.github.com/jquery-mu/example/action_processing_with_queue.html).

SearchForm
----------

SearchForm is a simple filtering search form in the user interface; it shows
and hides DOM elements depending on the search query entered into the field of
the form.

The module is a jQuery wrapper method, `$.muSearchForm`. The source is in the
file `jquery.mu.searchform.js`.

The form operates on the wrapped element set. For example, given the
following:

    $("#detail table tr:not(:first)").muSearchForm({
        attachWith: function (form) {
            context.find("#detail table").before(form);
        },
        loadWith: function () {
            return "<img src='image/progress_white.gif' alt='Searching...' />";
        },
        highlightClass: "highlight"
    });

The selected elements, `#detail table tr:not(:first)`, are the elements upon
which the form operates. The form takes options as an object argument. The
most important options are

* `attachWith`, specifying a function that inserts the form to user-specified
  place in the DOM,
* `loadWith`, a function returning an element to be shown when the search is
  on, and
* `highlightClass`, enabling highlighting of matched words and telling which
  class to use to mark the highlighted words with `span` tags.

For more options, see the source and examples:

* [simple](http://tkareine.github.com/jquery-mu/example/table_with_simple_searchform.html),
* [complex](http://tkareine.github.com/jquery-mu/example/table_with_complex_searchform.html).

Legal notes
-----------

See `LICENSE.txt` and `NOTICE.txt` in this directory.
