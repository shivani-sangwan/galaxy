<template>
    <Details
        :name="history.name"
        :annotation="history.annotation"
        :tags="history.tags"
        :writeable="writeable"
        @save="$emit('update:currentHistory', $event)">
        <template v-slot:name>
            <h3 data-description="history name display" v-short="history.name || 'History'" />
            <h5 class="history-size mt-1">
                <span v-if="history.size">{{ history.size | niceFileSize }}</span>
                <span v-else v-localize>(empty)</span>
            </h5>
        </template>
    </Details>
</template>

<script>
import prettyBytes from "pretty-bytes";
import short from "components/directives/v-short";
import { History } from "components/History/model";
import Details from "components/History/Layout/Details";

export default {
    components: {
        Details,
    },
    directives: {
        short,
    },
    filters: {
        niceFileSize(rawSize = 0) {
            return prettyBytes(rawSize);
        },
    },
    props: {
        history: { type: History, required: true },
        writeable: { type: Boolean, default: true },
    },
};
</script>
