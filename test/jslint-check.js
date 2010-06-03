var sources = [
        "lib/jquery.mu.js",
        "lib/jquery.mu.queue.js",
        "lib/jquery.mu.searchform.js"
    ],
    totalErrors = 0,
    currentSource,
    errors,
    currentError,
    i,
    j;

load("vendor/jslint.js");

for (i = 0; i < sources.length; i++) {
    currentSource = sources[i];

    JSLINT(readFile(currentSource));
    errors = JSLINT.errors;

    for (j = 0; j < errors.length; j++) {
        totalErrors++;
        currentError = errors[j];
        print(currentSource + ":" + currentError.line + "," + currentError.character + ": " + currentError.reason + "\n");
        print(currentError.evidence + "\n");
    }
}

if (totalErrors > 0) {
    print("JSLint found " + totalErrors + " error(s).");
    quit(1);
}
else {
    print("Passed JSLint check.");
}
