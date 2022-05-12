import { shallowMount } from "@vue/test-utils";
import { getLocalVue } from "jest/helpers";
import UserAPIKey from "UserAPIKey.vue";
import axios from "axios";
import flushPromises from "flush-promises";
import { waitOnJob } from "components/JobStates/wait";
import MockAdapter from "axios-mock-adapter";

const TEST_PLUGINS_URL = "/api/user/testuser/api_key";
const TEST_NEW_API_URL = "/api/users/testuser/api_key/inputs";
const TEST_API_KEY = "dfcda9a816104aab05d1710f96de099b";
const localVue = getLocalVue();

jest.mock("components/JobStates/wait");
describe("UserAPIKey.vue", () => {
    let axiosMock;
    let wrapper;

    beforeEach(async () => {
        axiosMock = new MockAdapter(axios);
        axiosMock.onGet(TEST_PLUGINS_URL).reply(200, [{ id: "foo", writable: false }]);
        wrapper = shallowMount(UserAPIKey, {
            propsData: {},
            localVue,
        });
        await flushPromises();
    });

    it("should create a new API Key", async () => {
        await wrapper.setData({
            sourceURL: TEST_PLUGINS_URL,
        });
        let formData;
        axiosMock.onPost(TEST_NEW_API_URL).reply((request) => {
            formData = request.data;
            return [200, { api_key: TEST_API_KEY }];
        });
        let then;
        waitOnJob.mockReturnValue(
            new Promise((then_) => {
                then = then_;
            })
        );
        wrapper.vm.submit();
        await flushPromises();
        expect(formData.get("archive_source")).toBe(TEST_NEW_API_URL);
        expect(wrapper.vm.waitingOnJob).toBeTruthy();

        then({ state: "ok" });
        await flushPromises();
        expect(wrapper.vm.waitingOnJob).toBeFalsy();
        expect(wrapper.vm.complete).toBeTruthy();
    });
});
