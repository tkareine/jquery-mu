/* A queue for actions to be completed in sequence.
 *
 * Actions can be functions to be executed or Ajax requests to be processed.
 * The current implementation uses a common queue for all the actions. The
 * process of dequeuing starts as soon as the first element is queued.
 *
 * Functions can either explicitly signal their completion, so that the next
 * action in the queue is not dequeued before a signal is given. A truthy
 * value in the property action#callsComplete denotes that signaling is in
 * use for the action. The signal is given simply calling action#complete.
 * If signaling is not used, functions dequeue automatically after each one
 * finishes its execution.
 *
 * For queuing a function, use the syntax
 *
 *   var fun = function () { };
 *   $.mu.queue.action(fun);
 *
 * For queuing an Ajax request:
 *
 *   var request = { ... };
 *   $.mu.queue.ajax(request);
 *
 * The request will be passed as a parameter to jQuery's Ajax function:
 * $.ajax(request).
 */
(function (mu, $) {
    var queue = (function (queueName) {
        var dequeuingInProgress = false;

        function queueIsEmpty() {
            return $(document).queue(queueName).length === 0;
        }

        return {
            queue: function (action) {
                $(document).queue(queueName, function () {
                    dequeuingInProgress = true;
                    action();
                });
                if (!dequeuingInProgress) {
                    $(document).dequeue(queueName);
                }
                return $(document).queue(queueName).length;
            },
            dequeue: function () {
                if (!queueIsEmpty()) {
                    $(document).dequeue(queueName);
                }
                else {
                    dequeuingInProgress = false;
                }
            }
        };
    })("MuQueue" + mu.util.createPseudoUniqueId());

    function queueAndDequeue(action) {
        if (action.callsComplete) {
            var oldComplete = action.complete;
            action.complete = function () {
                if (oldComplete) {
                    oldComplete.apply(this, arguments);
                }
                queue.dequeue();
            };
        }

        return queue.queue(function () {
            action();
            if (!action.callsComplete) {
                queue.dequeue();
            }
        });
    }

    mu.queue = {
        action: queueAndDequeue,

        ajax: function (request) {
            var oldComplete = request.complete;
            request.complete = function () {
                if (oldComplete) {
                    oldComplete.apply(this, arguments);
                }
                action.complete();
            };
            var action = function () {
                $.ajax(request);
            };
            action.callsComplete = true;
            queueAndDequeue(action);
        }
    };
})(jQuery.mu, jQuery);
