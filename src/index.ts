import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
    try {
        core.debug("Starting PR description check");

        const description = getPullRequestDescription();
        const providedPattern = getRegEx();

        core.debug(description);
        core.debug(String(providedPattern));

        if (!isValidRegEx(description, providedPattern)) {
            const failureMessage = `Pull Request description must match the required regular expression pattern: ${providedPattern}`;
            core.error(failureMessage);
            core.setFailed(failureMessage);
            return;
        }

        core.info("Description regex passed");

    } catch (error) {
        core.setFailed(error.message);
    }
}

export function getRegEx(): RegExp {
    const providedPattern = core.getInput("regex", { required: true }).trim();

    try {
        return new RegExp(providedPattern);
    } catch(e) {
        throw new Error("Invalid RegEx pattern provided");
    }
}

export function isValidRegEx(description: string, pattern: RegExp): Boolean {
    if (!pattern.test(description)) {
        return false;
    }
    return true;
}

export function getPullRequestDescription() {
    let pull_request = github.context.payload.pull_request;
    core.debug(`Pull Request: ${JSON.stringify(github.context.payload.pull_request)}`);
    if (pull_request == undefined || pull_request.body == undefined) {
        throw new Error("This action should only be run with Pull Request Events");
    }
    return pull_request.body;
}

run()
