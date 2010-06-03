JSpec.describe("jQuery Mu plugin's queue module", function () {
    describe("#action", function () {
        it("should call queued action", function () {
            var actionWasCalled = false,
                action = function () { actionWasCalled = true; };
            $.mu.queue.action(action);
            expect(actionWasCalled).to(be_true);
        });

        it("should call next action in the queue automatically, in proper queue order, if the previous action does not explicitly signal its completion", function () {
            var actionSeq = [],
                actions = [
                    function () { actionSeq.push(0); },
                    function () { actionSeq.push(1); },
                    function () { actionSeq.push(2); },
                ];

            $.each(actions, function (index, action) {
                $.mu.queue.action(action);
            })

            expect(actionSeq).to(eql, [0, 1, 2]);
        });

        it("should wait before calling the next action in the queue if the previous action signals so", function () {
            var actionSeq = [],
                actions = [
                    function () { actionSeq.push(0); },
                    function () { actionSeq.push(1); },
                    function () { actionSeq.push(2); },
                ];
            actions[0].callsComplete = true;

            $.each(actions, function (index, action) {
                $.mu.queue.action(action);
            })

            expect(actionSeq).to(eql, [0]);

            actions[0].complete();

            expect(actionSeq).to(eql, [0, 1, 2]);
        });

        it("should return the current length of the queue when queuing an action", function () {
            var actions = [];
            for (var i = 0; i < 3; i++) {
                actions.push(function () {});
            }
            actions[0].callsComplete = true;

            $.each(actions, function (index, actions) {
                $.mu.queue.action(actions);
            })

            expect($.mu.queue.action(function () {})).to(equal, 3);
            actions[0].complete();    // cleanup, required for Rhino
        });

        it("should preserve the original #complete method of an action which signals its completion", function () {
            var action = function () {};
            var originalCompleteWasCalled = false;
            action.complete = function () { originalCompleteWasCalled = true; };
            action.callsComplete = true;

            $.mu.queue.action(action);

            expect(originalCompleteWasCalled).to(be_false);

            action.complete();

            expect(originalCompleteWasCalled).to(be_true);
        });
    });

    describe("#ajax", function () {
        before_each(function () {
            $.ajax = function (request) {
                request.complete("test");   // simulate a completed request
            };
        });

        it("should delegate calling #complete upon completed request", function () {
            var calledUponCompletion = false;
            $.mu.queue.ajax({ complete: function () { calledUponCompletion = true; } });
            expect(calledUponCompletion).to(be_true);
        });

        describe("for its queuing behavior", function () {
            before_each(function () {
                callQueue = [];
                $.ajax = function (request) {
                    callQueue.push(request.complete);
                };
                monitoredCalls = {};
            });

            it("should send the next Ajax request in the queue after the previous one has been completed", function () {
                $.mu.queue.ajax({ complete: function () { monitoredCalls["0"] = true; } });

                expect(monitoredCalls["0"]).to(be_undefined);

                $.mu.queue.ajax({ complete: function () { monitoredCalls["1"] = true; } });

                expect(monitoredCalls["0"]).to(be_undefined);
                expect(monitoredCalls["1"]).to(be_undefined);

                callQueue[0]();

                expect(monitoredCalls["0"]).to(be_true);
                expect(monitoredCalls["1"]).to(be_undefined);

                callQueue[1]();

                expect(monitoredCalls["1"]).to(be_true);
            });

            it("should send Ajax requests in the order they are queued", function () {
                $.mu.queue.ajax({ complete: function () { monitoredCalls["0"] = true; } });

                expect(callQueue[0]).to(be_defined);
                expect(monitoredCalls["0"]).to(be_undefined);

                $.mu.queue.ajax({ complete: function () { monitoredCalls["1"] = true; } });

                expect(callQueue[1]).to(be_undefined);
                expect(monitoredCalls["0"]).to(be_undefined);
                expect(monitoredCalls["1"]).to(be_undefined);

                callQueue[0]();

                expect(callQueue[1]).to(be_defined);
                expect(monitoredCalls["0"]).to(be_true);
                expect(monitoredCalls["1"]).to(be_undefined);

                callQueue[1]();

                expect(monitoredCalls["1"]).to(be_true);
            });
        });
    });
});
