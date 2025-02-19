import axios from "axios";
import { getAppRoot } from "onload/loadConfig";
import { rethrowSimple } from "utils/simple-error";

export async function urlData({ url }) {
    try {
        console.debug("Requesting data from: ", url);
        const { data } = await axios.get(`${getAppRoot()}${url}`);
        return data;
    } catch (e) {
        rethrowSimple(e);
    }
}
