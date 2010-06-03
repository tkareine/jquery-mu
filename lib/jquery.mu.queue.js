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
            function action () {
                $.ajax(request);
            }
            action.callsComplete = true;
            queueAndDequeue(action);
        }
    };
})(jQuery.mu, jQuery);
