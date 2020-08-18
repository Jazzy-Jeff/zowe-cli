/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

jest.mock("../../../../../../../packages/zosjobs/src/GetJobs");
import { IHandlerParameters, ImperativeError } from "@zowe/imperative";
import { GetJobs } from "../../../../../../../packages/zosjobs/src/GetJobs";
import { GetJobsData } from "../../../../../../../packages/zosjobs/__tests__/__resources__/api/GetJobsData";
import { SpoolFilesByJobidDefinition } from "../../../../src/list/spool-files-by-jobid/SpoolFilesByJobid.definition";
import * as SpoolFilesHandler from "../../../../src/list/spool-files-by-jobid/SpoolFilesByJobid.handler";
import {
    UNIT_TEST_PROFILES_ZOSMF,
    getMockedResponse,
    UNIT_TEST_ZOSMF_PROF_OPTS
} from "../../../../../../../__tests__/__src__/mocks/ZosmfProfileMock";

// Disable coloring for the snapshots
process.env.FORCE_COLOR = "0";

const DEFAULT_PARAMTERS: IHandlerParameters = {
    arguments: {
        $0: "bright",
        _: ["zos-jobs", "list", "spool-files"],
        ...UNIT_TEST_ZOSMF_PROF_OPTS
    },
    positionals: ["zos-jobs", "list", "spool-files"],
    response: getMockedResponse(),
    definition: SpoolFilesByJobidDefinition,
    fullDefinition: SpoolFilesByJobidDefinition,
    profiles: UNIT_TEST_PROFILES_ZOSMF
};

describe("zos-jobs list spool-files-by-jobid handler", () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should be able to get spool files", async () => {
        GetJobs.getJob = jest.fn((session, jobid) => {
            return GetJobsData.SAMPLE_COMPLETE_JOB;
        });
        GetJobs.getSpoolFilesForJob = jest.fn((session, ijob) => {
            return GetJobsData.SAMPLE_SPOOL_FILES;
        });
        const handler = new SpoolFilesHandler.default();
        const params = Object.assign({}, ...[DEFAULT_PARAMTERS]);
        params.arguments.jobid = "j12345";
        await handler.process(params);
        expect(GetJobs.getJob).toHaveBeenCalledTimes(1);
        expect(GetJobs.getSpoolFilesForJob).toHaveBeenCalledTimes(1);
    });

    it("should not transform an error thrown from get jobs getJob API", async () => {
        const failMessage = "You fail";
        let error;
        GetJobs.getJob = jest.fn((session, jobid) => {
            throw new ImperativeError({ msg: failMessage});
        });
        const handler = new SpoolFilesHandler.default();
        const params = Object.assign({}, ...[DEFAULT_PARAMTERS]);
        params.arguments.jobid = "j12345";
        try {
            await handler.process(params);
        } catch (thrownError) {
            error = thrownError;
        }
        expect(GetJobs.getJob).toHaveBeenCalledTimes(1);
        expect(error).toBeDefined();
        expect(error instanceof ImperativeError).toBe(true);
        expect(error.message).toMatchSnapshot();
    });

    it("should not transform an error thrown from get jobs getSpoolFilesForJob API", async () => {
        const failMessage = "You fail";
        let error;
        GetJobs.getJob = jest.fn((session, jobid) => {
            return GetJobsData.SAMPLE_COMPLETE_JOB;
        });
        GetJobs.getSpoolFilesForJob = jest.fn((session, jobid) => {
            throw new ImperativeError({ msg: failMessage});
        });
        const handler = new SpoolFilesHandler.default();
        const params = Object.assign({}, ...[DEFAULT_PARAMTERS]);
        params.arguments.jobid = "j12345";
        try {
            await handler.process(params);
        } catch (thrownError) {
            error = thrownError;
        }
        expect(GetJobs.getJob).toHaveBeenCalledTimes(1);
        expect(GetJobs.getSpoolFilesForJob).toHaveBeenCalledTimes(1);
        expect(error).toBeDefined();
        expect(error instanceof ImperativeError).toBe(true);
        expect(error.message).toMatchSnapshot();
    });
});
