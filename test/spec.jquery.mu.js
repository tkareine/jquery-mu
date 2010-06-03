JSpec.describe("jQuery Mu plugin's core", function () {
    describe("util module", function () {
        describe("#createPseudoUniqueId", function () {
            it("should return a value between 0...999999 (inclusive)", function () {
                var knownRandomValue = 0;
                Math.random = function () { return knownRandomValue; };

                val = $.mu.util.createPseudoUniqueId();
                expect(val).to(equal, 0);

                knownRandomValue = 1;

                val = $.mu.util.createPseudoUniqueId();
                expect(val).to(equal, 999999);
            });
        });
    });
});
