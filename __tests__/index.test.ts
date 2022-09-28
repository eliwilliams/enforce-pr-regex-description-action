import { getPullRequestDescription, getRegEx, isValidRegEx } from "../src/index";
import * as github from "@actions/github";
import { readFileSync } from "fs";

describe("index", () => {
    describe("getRegex", () => {
        const name = "regex";

        it("returns a RegExp object if the provided regex string is valid", () => {
            process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = "^[1-9]\\d{0,2}$";
            const testPattern = getRegEx();
            expect(testPattern).toEqual(new RegExp(/^[1-9]\d{0,2}$/));
        });

        it("throws an error if the provided regex is invalid", () => {
            process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = "^[1--9.]\\d{0,.2}$";
            expect(getRegEx).toThrowError("Invalid RegEx pattern provided");
        });
    });

    describe("getPullRequestDescription", () => {
        it("gets a pull request event description", () => {
            process.env["GITHUB_EVENT_PATH"] = __dirname + "/valid-context.json";
            github.context.payload = JSON.parse(
                readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' })
            );
            const description = getPullRequestDescription();
            expect(description).toEqual("Valid Body");
        });

        it("throws an error if the event is not a pull_request type", () => {
            process.env["GITHUB_EVENT_PATH"] = __dirname + "/wrong-event-type-context.json";
            github.context.payload = JSON.parse(
                readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' })
            );
            expect(getPullRequestDescription).toThrowError("This action should only be run with Pull Request Events");
        });

        it("throws an error if the description is not provided", () => {
            process.env["GITHUB_EVENT_PATH"] = __dirname + "/event-without-a-body.json";
            github.context.payload = JSON.parse(
                readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' })
            );
            expect(getPullRequestDescription).toThrowError("This action should only be run with Pull Request Events");
        });
    });

    describe("isValidRegEx", () => {
        it("validates pull request description regex", () => {
            let description = "https://app.asana.com/0/269147081508722/1202858895894385/f"
            let pattern = new RegExp(/(https:\/\/)?app.asana.com\/0\/(search\/|inbox\/)?\d+\/\d+(\/\d+)?/i)
            expect(isValidRegEx(description, pattern)).toBe(true);
        });
    });
})